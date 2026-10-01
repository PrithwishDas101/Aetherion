import assert from "node:assert/strict";

import { getAllChats } from "./controllers/chatController.js";
import { getContacts } from "./controllers/contactController.js";
import { getContactProfileMedia } from "./controllers/contactProfileController.js";
import { getIncomingContactRequests, getOutgoingContactRequests } from "./controllers/contactRequestController.js";
import { getAllMessages } from "./controllers/messageController.js";
import { getAllUsers } from "./controllers/userController.js";
import Chat from "./models/Chat.js";
import Contact from "./models/Contact.js";
import ContactRequest from "./models/ContactRequest.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import {
  DEFAULT_LIST_PAGE_SIZE,
  MAX_CHATS_PER_USER,
  MAX_CONTACT_PROFILE_MEDIA,
  MAX_LIST_PAGE,
  MAX_LIST_PAGE_SIZE,
  MAX_MESSAGES_PER_CHAT_HISTORY,
  MAX_OUTGOING_CONTACT_REQUESTS,
  MAX_USERS_PER_LIST,
} from "./utils/queryLimits.js";

const ids = {
  user: "000000000000000000000001",
  other: "000000000000000000000002",
  chat: "00000000000000000000000a",
  olderMessage: "00000000000000000000000b",
  middleMessage: "00000000000000000000000c",
  newerMessage: "00000000000000000000000d",
};

const originals = {
  chatFind: Chat.find,
  chatFindOne: Chat.findOne,
  contactAggregate: Contact.aggregate,
  contactRequestAggregate: ContactRequest.aggregate,
  contactRequestFind: ContactRequest.find,
  messageFind: Message.find,
  messageCountDocuments: Message.countDocuments,
  userFind: User.find,
};

const captures = {};

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const createQuery = (value, capture = {}) => ({
  populate() {
    return this;
  },
  select(selection) {
    capture.selection = selection;
    return this;
  },
  sort(sort) {
    capture.sort = sort;
    return this;
  },
  limit(limit) {
    capture.limit = limit;
    return this;
  },
  lean() {
    return Promise.resolve(value);
  },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const getFacetWindow = (pipeline, name) => {
  const facet = pipeline.find((stage) => stage.$facet)?.$facet;
  assert.ok(facet?.[name]);
  return facet[name];
};

try {
  const newestFirstMessages = [
    { _id: ids.newerMessage, createdAt: new Date("2026-01-03T00:00:00Z") },
    { _id: ids.middleMessage, createdAt: new Date("2026-01-02T00:00:00Z") },
    { _id: ids.olderMessage, createdAt: new Date("2026-01-01T00:00:00Z") },
  ];
  let messageChatAuthorized = true;
  let messageFindCalls = 0;
  captures.messageQuery = {};
  Chat.findOne = async (query) => {
    captures.messageChatFilter = query;
    return messageChatAuthorized ? { _id: ids.chat } : null;
  };
  Message.find = (query) => {
    messageFindCalls += 1;
    captures.messageFilter = query;
    return createQuery(newestFirstMessages, captures.messageQuery);
  };

  const unauthorizedResponse = createResponse();
  messageChatAuthorized = false;
  await getAllMessages(
    {
      params: { chatId: ids.chat },
      query: { limit: "999999" },
      user: { userId: ids.user },
    },
    unauthorizedResponse,
  );
  assert.equal(unauthorizedResponse.statusCode, 404);
  assert.equal(messageFindCalls, 0);

  messageChatAuthorized = true;
  const messagesResponse = createResponse();
  await getAllMessages(
    {
      params: { chatId: ids.chat },
      query: { limit: "999999" },
      user: { userId: ids.user },
    },
    messagesResponse,
  );
  assert.equal(messagesResponse.statusCode, 200);
  assert.deepEqual(captures.messageChatFilter, {
    _id: ids.chat,
    members: ids.user,
  });
  assert.deepEqual(captures.messageFilter, { chatId: ids.chat });
  assert.deepEqual(captures.messageQuery.sort, { createdAt: -1, _id: -1 });
  assert.equal(captures.messageQuery.limit, MAX_MESSAGES_PER_CHAT_HISTORY);
  assert.deepEqual(
    messagesResponse.body.data.map((message) => message._id),
    [ids.olderMessage, ids.middleMessage, ids.newerMessage],
  );
  assert.deepEqual(Object.keys(messagesResponse.body).sort(), [
    "data",
    "message",
    "success",
  ]);
  console.log("messages: authorized query capped at 500 newest; response remains chronological and shape-compatible");

  const chatRecords = [{ _id: ids.chat }, { _id: ids.other }];
  captures.chatQuery = {};
  Chat.find = (query) => {
    captures.chatFilter = query;
    return createQuery(chatRecords, captures.chatQuery);
  };
  const chatsResponse = createResponse();
  await getAllChats({ user: { userId: ids.user } }, chatsResponse);
  assert.equal(chatsResponse.statusCode, 200);
  assert.deepEqual(captures.chatFilter, { members: { $in: [ids.user] } });
  assert.deepEqual(captures.chatQuery.sort, { updatedAt: -1, _id: -1 });
  assert.equal(captures.chatQuery.limit, MAX_CHATS_PER_USER);
  assert.deepEqual(chatsResponse.body.data, chatRecords);
  console.log("chats: authenticated membership filter and activity order retained; result capped at 500");

  const manyMedia = Array.from({ length: MAX_CONTACT_PROFILE_MEDIA }, (_, index) => ({
    _id: String(index),
    type: "image",
  }));
  captures.mediaQuery = {};
  Chat.findOne = (query) => {
    captures.profileChatFilter = query;
    return {
      select() {
        return {
          lean: async () => ({ _id: ids.chat }),
        };
      },
    };
  };
  Message.find = (query) => {
    captures.mediaFilter = query;
    return createQuery(manyMedia, captures.mediaQuery);
  };
  Message.countDocuments = async (query) => {
    captures.mediaCountFilter = query;
    return 275;
  };
  const mediaResponse = createResponse();
  await getContactProfileMedia(
    {
      params: { userId: ids.other },
      user: { userId: ids.user },
    },
    mediaResponse,
  );
  assert.equal(mediaResponse.statusCode, 200);
  assert.equal(captures.mediaQuery.limit, MAX_CONTACT_PROFILE_MEDIA);
  assert.deepEqual(captures.mediaQuery.sort, { createdAt: -1, _id: -1 });
  assert.deepEqual(captures.mediaFilter, {
    chatId: ids.chat,
    type: { $in: ["image", "video", "gif", "document"] },
  });
  assert.equal(mediaResponse.body.data.media.length, MAX_CONTACT_PROFILE_MEDIA);
  assert.equal(mediaResponse.body.data.total, 275);
  assert.equal(mediaResponse.body.data.media[0].type, "image");
  console.log("profile media: newest 200 returned; count and existing response fields preserved");

  const listedUsers = [
    {
      _id: ids.other,
      toObject() {
        return { _id: ids.other, firstName: "Example" };
      },
    },
  ];
  captures.userQuery = {};
  User.find = (query) => {
    captures.userFilter = query;
    return createQuery(listedUsers, captures.userQuery);
  };
  Contact.find = (query) => {
    captures.userContactsFilter = query;
    return {
      select() {
        return { lean: async () => [] };
      },
    };
  };
  ContactRequest.find = (query) => {
    captures.userRequestsFilter = query;
    return {
      select() {
        return { lean: async () => [] };
      },
    };
  };
  const usersResponse = createResponse();
  await getAllUsers({ user: { userId: ids.user } }, usersResponse);
  assert.equal(usersResponse.statusCode, 200);
  assert.deepEqual(captures.userFilter, { _id: { $ne: ids.user } });
  assert.deepEqual(captures.userQuery.sort, { _id: -1 });
  assert.equal(captures.userQuery.limit, MAX_USERS_PER_LIST);
  assert.equal(usersResponse.body.users[0].relationshipStatus, "none");
  console.log("user list: newest users are bounded at 500; relationship annotations remain intact");

  const outgoingRequests = [{ _id: ids.chat, recipient: { _id: ids.other } }];
  captures.outgoingQuery = {};
  ContactRequest.find = (query) => {
    captures.outgoingFilter = query;
    return createQuery(outgoingRequests, captures.outgoingQuery);
  };
  const outgoingResponse = createResponse();
  await getOutgoingContactRequests(
    { user: { userId: ids.user } },
    outgoingResponse,
  );
  assert.equal(outgoingResponse.statusCode, 200);
  assert.equal(String(captures.outgoingFilter.requester), ids.user);
  assert.deepEqual(captures.outgoingQuery.sort, { createdAt: -1 });
  assert.equal(captures.outgoingQuery.limit, MAX_OUTGOING_CONTACT_REQUESTS);
  assert.deepEqual(outgoingResponse.body.data, outgoingRequests);
  console.log("outgoing requests: indexed requester ordering retained; result capped at 100");

  const contactPipelines = [];
  Contact.aggregate = async (pipeline) => {
    contactPipelines.push(pipeline);
    return [{ metadata: [{ total: 0 }], contacts: [] }];
  };
  const contactsMalformedPage = createResponse();
  await getContacts(
    {
      user: { userId: ids.user },
      params: {},
      query: { page: "not-a-page", limit: "999999" },
    },
    contactsMalformedPage,
  );
  assert.equal(contactsMalformedPage.statusCode, 200);
  let contactWindow = getFacetWindow(contactPipelines[0], "contacts");
  assert.deepEqual(contactWindow[0], { $skip: 0 });
  assert.deepEqual(contactWindow[1], { $limit: MAX_LIST_PAGE_SIZE });

  const contactsHighPage = createResponse();
  await getContacts(
    {
      user: { userId: ids.user },
      params: {},
      query: { page: "900000", limit: "100" },
    },
    contactsHighPage,
  );
  contactWindow = getFacetWindow(contactPipelines[1], "contacts");
  assert.deepEqual(contactWindow[0], { $skip: (MAX_LIST_PAGE - 1) * 100 });
  assert.deepEqual(contactWindow[1], { $limit: 100 });

  const requestPipelines = [];
  ContactRequest.aggregate = async (pipeline) => {
    requestPipelines.push(pipeline);
    return [{ metadata: [{ total: 0 }], requests: [] }];
  };
  const incomingMalformedPage = createResponse();
  await getIncomingContactRequests(
    {
      user: { userId: ids.user },
      query: { page: "Infinity", limit: "-1" },
    },
    incomingMalformedPage,
  );
  assert.equal(incomingMalformedPage.statusCode, 200);
  const requestWindow = getFacetWindow(requestPipelines[0], "requests");
  assert.deepEqual(requestWindow[0], { $skip: 0 });
  assert.deepEqual(requestWindow[1], { $limit: DEFAULT_LIST_PAGE_SIZE });
  assert.equal(MAX_LIST_PAGE, 1000);
  console.log("existing pagination: malformed values normalize and deep page numbers are bounded");

  console.log("SEC-11 unbounded-query smoke checks passed");
} finally {
  Chat.find = originals.chatFind;
  Chat.findOne = originals.chatFindOne;
  Contact.aggregate = originals.contactAggregate;
  ContactRequest.aggregate = originals.contactRequestAggregate;
  ContactRequest.find = originals.contactRequestFind;
  Message.find = originals.messageFind;
  Message.countDocuments = originals.messageCountDocuments;
  User.find = originals.userFind;
}