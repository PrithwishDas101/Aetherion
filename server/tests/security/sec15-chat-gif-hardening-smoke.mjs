import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";

import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";
import User from "../../models/User.js";
import chatRoutes from "../../routes/chatRoute.js";
import messageRoutes from "../../routes/MessageRoute.js";
import { isAllowedGiphyMediaUrl } from "../../utils/giphyUrl.js";

const secret = "sec15-chat-gif-hardening-smoke-secret";
const originalJwtSecret = process.env.JWT_SECRET;
const originals = {
  chatFindOne: Chat.findOne,
  chatCreate: Chat.create,
  chatFindByIdAndUpdate: Chat.findByIdAndUpdate,
  userFindById: User.findById,
  userCountDocuments: User.countDocuments,
  messageCreate: Message.create,
};

const ids = {
  creator: "000000000000000000000001",
  recipient: "000000000000000000000002",
  missingRecipient: "000000000000000000000003",
  legacyCreator: "000000000000000000000004",
  legacyRecipient: "000000000000000000000005",
  rateCreator: "000000000000000000000006",
  rateRecipient: "000000000000000000000007",
  otherRateCreator: "000000000000000000000008",
  chat: "000000000000000000000009",
};

const knownUsers = new Set(Object.values(ids).map((id) => id.toLowerCase()));
knownUsers.delete(ids.missingRecipient);
const chatsByPair = new Map();
const legacyChats = [];
let activeMessageChat = null;
let messageCreateCalls = 0;
let nextChatId = 20;
let nextMessageId = 40;
let racePairKey = null;
let racePairWaiters = [];

const normalizeId = (value) => String(value).toLowerCase();
const pairKeyFor = (members) => members.map(normalizeId).sort().join(":");

const query = (value) => {
  const promise = Promise.resolve(value);
  const result = {
    populate() {
      return result;
    },
    then(resolve, reject) {
      return promise.then(resolve, reject);
    },
  };

  return result;
};

const allStoredChats = () => [...chatsByPair.values(), ...legacyChats];

Chat.findOne = (filter) => {
  if (filter.pairKey) {
    if (filter.pairKey === racePairKey) {
      return query(
        new Promise((resolve) => {
          racePairWaiters.push(resolve);

          if (racePairWaiters.length === 2) {
            const waiters = racePairWaiters;
            racePairWaiters = [];
            racePairKey = null;
            waiters.forEach((waiter) =>
              waiter(chatsByPair.get(filter.pairKey) || null),
            );
          }
        }),
      );
    }

    return query(chatsByPair.get(filter.pairKey) || null);
  }

  if (filter._id && filter.members) {
    const requestedUserId = normalizeId(filter.members);
    const chats = activeMessageChat
      ? [...allStoredChats(), activeMessageChat]
      : allStoredChats();
    const chat = chats.find(
      (candidate) =>
        normalizeId(candidate._id) === normalizeId(filter._id) &&
        candidate.members.some((member) => normalizeId(member) === requestedUserId),
    );

    return query(chat || null);
  }

  const expectedMembers = filter.members?.$all?.map(normalizeId) || [];
  const chat = allStoredChats().find(
    (candidate) =>
      candidate.members.length === 2 &&
      expectedMembers.every((memberId) =>
        candidate.members.some((member) => normalizeId(member) === memberId),
      ),
  );

  return query(chat || null);
};

Chat.create = async (document) => {
  if (chatsByPair.has(document.pairKey)) {
    const error = new Error("Duplicate pair key");
    error.code = 11000;
    throw error;
  }

  const chat = {
    ...document,
    _id: String(nextChatId++).padStart(24, "0"),
    members: document.members.map(normalizeId),
    async populate() {
      return this;
    },
  };

  chatsByPair.set(document.pairKey, chat);
  return chat;
};

Chat.findByIdAndUpdate = () => query(activeMessageChat);

User.findById = (userId) => ({
  select() {
    return {
      lean: async () => ({ _id: normalizeId(userId), authVersion: 0 }),
    };
  },
});

User.countDocuments = async (filter) =>
  filter._id.$in.filter((userId) => knownUsers.has(normalizeId(userId))).length;

Message.create = async (document) => {
  messageCreateCalls += 1;

  return {
    ...document,
    _id: String(nextMessageId++).padStart(24, "0"),
    async populate() {
      return this;
    },
  };
};

process.env.JWT_SECRET = secret;
const app = express();
app.use(express.json());
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

const tokenFor = (userId) =>
  jwt.sign({ userId, authVersion: 0 }, secret);

const request = async (path, { userId, body = {} } = {}) => {
  const headers = { "Content-Type": "application/json" };

  if (userId) {
    headers.Authorization = `Bearer ${tokenFor(userId)}`;
  }

  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
};

const readResponse = async (response) => ({
  status: response.status,
  body: await response.json(),
});

const makeChatRequest = (userId, recipientId, extra = {}) =>
  request("/api/v1/chat/create", {
    userId,
    body: { members: [userId, recipientId], ...extra },
  });

const runSendMessage = async (body) => {
  let result;
  const req = {
    body,
    file: null,
    user: { userId: ids.creator },
  };
  const res = {
    status(code) {
      result = { status: code };
      return this;
    },
    json(payload) {
      result.body = payload;
      return payload;
    },
  };

  const { sendMessage } = await import("../../controllers/messageController.js");
  await sendMessage(req, res);
  return result;
};

try {
  const pairIndex = Chat.schema.indexes().find(([keys]) => keys.pairKey === 1);
  assert.ok(pairIndex, "pairKey index is declared");
  assert.equal(pairIndex[1].unique, true);
  assert.deepEqual(pairIndex[1].partialFilterExpression, {
    pairKey: { $type: "string" },
  });

  const unauthenticated = await request("/api/v1/chat/create", {
    body: { members: [ids.creator, ids.recipient] },
  });
  assert.equal(unauthenticated.status, 401);

  const created = await readResponse(
    await makeChatRequest(ids.creator, ids.recipient),
  );
  assert.equal(created.status, 201, "searched-user chat creation remains allowed");
  assert.equal(created.body.success, true);
  assert.equal(chatsByPair.size, 1);

  const duplicate = await readResponse(
    await makeChatRequest(ids.recipient, ids.creator),
  );
  assert.equal(duplicate.status, 200, "existing chat is reused in either order");
  assert.equal(String(duplicate.body.data._id), String(created.body.data._id));
  assert.equal(chatsByPair.size, 1);

  const missingRecipient = await readResponse(
    await makeChatRequest(ids.creator, ids.missingRecipient),
  );
  assert.equal(missingRecipient.status, 404);
  assert.equal(chatsByPair.size, 1);

  const malformedRecipient = await readResponse(
    await makeChatRequest(ids.creator, "not-an-object-id"),
  );
  assert.equal(malformedRecipient.status, 400);
  assert.equal(chatsByPair.size, 1);

  const selfChat = await readResponse(
    await makeChatRequest(ids.creator, ids.creator),
  );
  assert.equal(selfChat.status, 400, "self-chat rejection is preserved");

  const legacyPair = [ids.legacyCreator, ids.legacyRecipient];
  legacyPair.forEach((userId) => knownUsers.add(userId));
  const legacyChat = {
    _id: "000000000000000000000099",
    members: legacyPair,
    lastMessage: null,
  };
  legacyChats.push(legacyChat);
  const legacyReuse = await readResponse(
    await makeChatRequest(ids.legacyCreator, ids.legacyRecipient),
  );
  assert.equal(legacyReuse.status, 200, "legacy pair chat is reused");
  assert.equal(String(legacyReuse.body.data._id), legacyChat._id);
  assert.equal(chatsByPair.size, 1, "legacy chat is not rewritten");

  const raceMembers = [
    "000000000000000000000011",
    "000000000000000000000012",
  ];
  raceMembers.forEach((userId) => knownUsers.add(userId));
  const concurrentPairKey = pairKeyFor(raceMembers);
  racePairKey = concurrentPairKey;
  const concurrent = await Promise.all([
    makeChatRequest(raceMembers[0], raceMembers[1]).then(readResponse),
    makeChatRequest(raceMembers[0], raceMembers[1]).then(readResponse),
  ]);
  assert.deepEqual(
    concurrent.map((response) => response.status).sort(),
    [200, 201],
    "duplicate-key race returns the winner to both requests",
  );
  assert.equal(
    String(concurrent[0].body.data._id),
    String(concurrent[1].body.data._id),
  );
  assert.equal(chatsByPair.get(concurrentPairKey).members.length, 2);

  knownUsers.add(ids.rateCreator);
  knownUsers.add(ids.rateRecipient);
  for (let count = 0; count < 20; count += 1) {
    const response = await makeChatRequest(ids.rateCreator, ids.rateRecipient, {
      userId: ids.otherRateCreator,
    });
    assert.ok([200, 201].includes(response.status), "first 20 create attempts allowed");
  }
  const rateLimited = await makeChatRequest(ids.rateCreator, ids.rateRecipient, {
    userId: ids.otherRateCreator,
  });
  assert.equal(rateLimited.status, 429, "21st request is limited by authenticated user");

  knownUsers.add(ids.otherRateCreator);
  const independentUser = await makeChatRequest(
    ids.otherRateCreator,
    ids.rateRecipient,
    { userId: ids.rateCreator },
  );
  assert.ok(
    [200, 201].includes(independentUser.status),
    "spoofed body identity does not share another user's limiter bucket",
  );

  const unauthenticatedMessage = await request("/api/v1/message/send-message", {
    body: {
      chatId: ids.chat,
      type: "gif",
      mediaUrl: "https://media.giphy.com/media/example/giphy.gif",
    },
  });
  assert.equal(unauthenticatedMessage.status, 401);

  const validGiphyUrls = [
    "https://media.giphy.com/media/example/giphy.gif",
    "https://media2.giphy.com/media/example/200w.gif",
  ];
  const invalidGiphyUrls = [
    "http://media.giphy.com/media/example/giphy.gif",
    "https://arbitrary.example/media/example.gif",
    "https://media.giphy.com.attacker.example/media/example.gif",
    "not-a-url",
  ];

  for (const url of validGiphyUrls) {
    assert.equal(isAllowedGiphyMediaUrl(url), true);
  }
  for (const url of invalidGiphyUrls) {
    assert.equal(isAllowedGiphyMediaUrl(url), false);
  }

  activeMessageChat = {
    _id: ids.chat,
    members: [ids.creator, ids.recipient],
  };
  let expectedMessageCount = messageCreateCalls;

  for (const url of validGiphyUrls) {
    const accepted = await runSendMessage({
      chatId: ids.chat,
      type: "gif",
      mediaUrl: url,
    });
    assert.equal(accepted.status, 201);
    expectedMessageCount += 1;
    assert.equal(messageCreateCalls, expectedMessageCount);
  }

  for (const url of invalidGiphyUrls) {
    const rejected = await runSendMessage({
      chatId: ids.chat,
      type: "gif",
      mediaUrl: url,
    });
    assert.equal(rejected.status, 400);
    assert.equal(messageCreateCalls, expectedMessageCount);
  }

  activeMessageChat = null;
  const unauthorizedChatMessage = await runSendMessage({
    chatId: ids.chat,
    type: "gif",
    mediaUrl: "https://arbitrary.example/media/example.gif",
  });
  assert.equal(unauthorizedChatMessage.status, 404);
  assert.equal(messageCreateCalls, expectedMessageCount);

  activeMessageChat = {
    _id: ids.chat,
    members: [ids.creator, ids.recipient],
  };
  const nonGif = await runSendMessage({
    chatId: ids.chat,
    type: "text",
    text: "Text messages are unchanged.",
  });
  assert.equal(nonGif.status, 201);
  assert.equal(messageCreateCalls, expectedMessageCount + 1);

  console.log(
    "SEC-15 chat creation and GIPHY URL smoke checks passed",
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
  Chat.findOne = originals.chatFindOne;
  Chat.create = originals.chatCreate;
  Chat.findByIdAndUpdate = originals.chatFindByIdAndUpdate;
  User.findById = originals.userFindById;
  User.countDocuments = originals.userCountDocuments;
  Message.create = originals.messageCreate;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
}
