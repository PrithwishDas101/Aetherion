import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";
import Poll from "../../models/Poll.js";
import User from "../../models/User.js";
import { authenticateSocket } from "../../socket/socket.js";
import { registerSocketHandlers } from "../../socket/socketHandlers.js";

const ids = {
  member: "000000000000000000000001",
  recipient: "000000000000000000000002",
  chatA: "00000000000000000000000a",
  chatB: "00000000000000000000000b",
  messageA: "000000000000000000000011",
  messageB: "000000000000000000000022",
  missingMessage: "000000000000000000000033",
  pollA: "000000000000000000000044",
  pollB: "000000000000000000000055",
  missingPoll: "000000000000000000000066",
};

const originals = {
  chatFindOne: Chat.findOne,
  messageFindOne: Message.findOne,
  pollFindOne: Poll.findOne,
  userFindById: User.findById,
  jwtSecret: process.env.JWT_SECRET,
};

const chatRecord = {
  _id: ids.chatA,
  members: [ids.member, ids.recipient],
};

const broadcastChat = {
  _id: ids.chatA,
  members: [{ _id: ids.member }, { _id: ids.recipient }],
  lastMessage: { _id: ids.messageA },
};

const persistedMessage = {
  _id: ids.messageA,
  chatId: ids.chatA,
  sender: ids.member,
  type: "text",
  text: "trusted persisted message",
};

const persistedPoll = {
  _id: ids.pollA,
  chatId: ids.chatA,
  question: "trusted persisted poll",
  options: [
    { _id: "option-a", text: "Yes", votes: [ids.member] },
    { _id: "option-b", text: "No", votes: [] },
  ],
};

const makeQuery = (value) => ({
  populate() {
    return this;
  },
  lean() {
    return Promise.resolve(value);
  },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const createSocketHarness = ({
  userId = ids.member,
  isMember = true,
  messageRecord = persistedMessage,
  pollRecord = persistedPoll,
} = {}) => {
  const emitted = [];
  const listeners = {};
  let connectionHandler;
  let chatLookupCount = 0;
  let messageLookup;
  let pollLookup;
  let disconnected = false;

  const io = {
    on(event, handler) {
      if (event === "connection") {
        connectionHandler = handler;
      }
    },
  };

  const socket = {
    data: userId ? { userId } : {},
    on(event, handler) {
      listeners[event] = handler;
    },
    to(recipientId) {
      return {
        emit(event, payload) {
          emitted.push({ recipientId, event, payload });
        },
      };
    },
    disconnect(force) {
      disconnected = force;
    },
  };

  Chat.findOne = (query) => {
    chatLookupCount += 1;
    if (
      String(query._id) !== ids.chatA ||
      String(query.members) !== String(userId) ||
      !isMember
    ) {
      return makeQuery(null);
    }

    return makeQuery(chatLookupCount === 1 ? chatRecord : broadcastChat);
  };

  Message.findOne = (query) => {
    messageLookup = query;
    const resourceExists =
      messageRecord &&
      String(query._id) === String(messageRecord._id) &&
      String(query.chatId) === String(messageRecord.chatId) &&
      String(query.sender) === String(messageRecord.sender);

    return makeQuery(resourceExists ? messageRecord : null);
  };

  Poll.findOne = (query) => {
    pollLookup = query;
    const resourceExists =
      pollRecord &&
      String(query._id) === String(pollRecord._id) &&
      String(query.chatId) === String(pollRecord.chatId);

    return makeQuery(resourceExists ? pollRecord : null);
  };

  registerSocketHandlers(io);
  connectionHandler(socket);

  return {
    emitted,
    listeners,
    get disconnected() {
      return disconnected;
    },
    get messageLookup() {
      return messageLookup;
    },
    get pollLookup() {
      return pollLookup;
    },
    get chatLookupCount() {
      return chatLookupCount;
    },
  };
};

const emitFromClient = async (harness, event, payload) => {
  await harness.listeners[event](payload);
};

try {
  process.env.JWT_SECRET = "sec4-socket-integrity-smoke-secret";
  User.findById = (userId) => ({
    select(selection) {
      assert.ok(selection.includes("+authVersion"));
      return {
        lean: async () => ({ _id: String(userId), authVersion: 0 }),
      };
    },
  });

  let missingTokenError;
  await authenticateSocket(
    { handshake: { auth: {} }, data: {} },
    (error) => {
      missingTokenError = error;
    },
  );
  assert.equal(missingTokenError?.message, "Authentication required");

  const token = jwt.sign(
    { userId: ids.member, authVersion: 0 },
    process.env.JWT_SECRET,
  );
  const authenticatedSocket = {
    handshake: { auth: { token } },
    data: {},
  };
  let authenticationError;
  await authenticateSocket(authenticatedSocket, (error) => {
    authenticationError = error;
  });
  assert.equal(authenticationError, undefined);
  assert.equal(authenticatedSocket.data.userId, ids.member);
  console.log("socket auth: unauthenticated rejected, valid member authenticated");

  const unauthenticated = createSocketHarness({ userId: null });
  assert.equal(unauthenticated.disconnected, true);
  assert.equal(unauthenticated.listeners["send-message"], undefined);
  console.log("unauthenticated connection: disconnected before event handlers");

  const nonMember = createSocketHarness({ isMember: false });
  await emitFromClient(nonMember, "send-message", {
    message: { _id: ids.messageA, chatId: ids.chatA },
    chat: { _id: ids.chatA },
  });
  assert.equal(nonMember.emitted.length, 0);
  console.log("non-member targeting chat: message event rejected");

  const legitimateMessage = createSocketHarness();
  await emitFromClient(legitimateMessage, "send-message", {
    message: {
      ...persistedMessage,
      sender: ids.recipient,
      text: "forged text",
      poll: { options: [{ text: "forged" }] },
    },
    chat: { _id: ids.chatA, members: [ids.member], lastMessage: "forged" },
  });
  assert.deepEqual(legitimateMessage.messageLookup, {
    _id: ids.messageA,
    chatId: ids.chatA,
    sender: ids.member,
  });
  assert.equal(legitimateMessage.emitted.length, 1);
  assert.equal(legitimateMessage.emitted[0].recipientId, ids.recipient);
  assert.equal(legitimateMessage.emitted[0].event, "receive-message");
  assert.equal(legitimateMessage.emitted[0].payload.message, persistedMessage);
  assert.equal(legitimateMessage.emitted[0].payload.chat, broadcastChat);
  console.log("member message: database message/chat broadcast; forged fields ignored");

  for (const [label, messageId, chatId, senderId, messageRecord] of [
    ["forged sender", ids.messageA, ids.chatA, ids.recipient, { ...persistedMessage, sender: ids.recipient }],
    ["wrong-chat resource", ids.messageB, ids.chatB, ids.member, { ...persistedMessage, _id: ids.messageB, chatId: ids.chatB }],
    ["nonexistent resource", ids.missingMessage, ids.chatA, ids.member, null],
  ]) {
    const harness = createSocketHarness({ messageRecord });
    await emitFromClient(harness, "send-message", {
      message: { _id: messageId, chatId, sender: senderId, text: "forged" },
      chat: { _id: ids.chatA },
    });
    assert.equal(harness.emitted.length, 0, label);
    console.log(`${label}: message event rejected`);
  }

  const legitimatePoll = createSocketHarness();
  await emitFromClient(legitimatePoll, "poll-updated", {
    poll: {
      ...persistedPoll,
      question: "forged question",
      options: [{ _id: "option-a", text: "Yes", votes: [ids.recipient, ids.recipient], voteCount: 900 }],
    },
    chatId: ids.chatA,
    sender: ids.recipient,
  });
  assert.deepEqual(legitimatePoll.pollLookup, {
    _id: ids.pollA,
    chatId: ids.chatA,
  });
  assert.equal(legitimatePoll.emitted.length, 1);
  assert.equal(legitimatePoll.emitted[0].event, "poll-updated");
  assert.equal(legitimatePoll.emitted[0].payload.poll, persistedPoll);
  assert.equal(legitimatePoll.emitted[0].payload.chatId, ids.chatA);
  console.log("member poll update: persisted counts/votes broadcast; forged fields ignored");

  for (const [label, pollId, chatId, pollRecord] of [
    ["wrong-chat poll", ids.pollB, ids.chatA, { ...persistedPoll, _id: ids.pollB, chatId: ids.chatB }],
    ["nonexistent poll", ids.missingPoll, ids.chatA, null],
  ]) {
    const harness = createSocketHarness({ pollRecord });
    await emitFromClient(harness, "poll-updated", {
      poll: { _id: pollId, options: [{ votes: [ids.recipient] }] },
      chatId,
    });
    assert.equal(harness.emitted.length, 0, label);
    console.log(`${label}: poll event rejected`);
  }

  const legitimateTyping = createSocketHarness();
  await emitFromClient(legitimateTyping, "typing", {
    chatId: ids.chatA,
    sender: ids.recipient,
  });
  assert.deepEqual(legitimateTyping.emitted[0], {
    recipientId: ids.recipient,
    event: "typing",
    payload: { sender: ids.member, chatId: ids.chatA },
  });
  console.log("typing: authorized transient event still broadcasts server identity");

  const legitimateStopTyping = createSocketHarness();
  await emitFromClient(legitimateStopTyping, "stop-typing", {
    chatId: ids.chatA,
    sender: ids.recipient,
  });
  assert.deepEqual(legitimateStopTyping.emitted[0], {
    recipientId: ids.recipient,
    event: "stop-typing",
    payload: { sender: ids.member, chatId: ids.chatA },
  });
  console.log("stop-typing: authorized transient event still broadcasts server identity");

  const assertMalformedTypingHandled = async (event, payload, label) => {
    const harness = createSocketHarness();
    let unhandledRejection;
    const observeUnhandledRejection = (error) => {
      unhandledRejection = error;
    };

    process.on("unhandledRejection", observeUnhandledRejection);

    try {
      harness.listeners[event](payload);
      await new Promise((resolve) => setImmediate(resolve));
    } finally {
      process.off("unhandledRejection", observeUnhandledRejection);
    }

    assert.equal(unhandledRejection, undefined, `${event} ${label}`);
    assert.equal(harness.chatLookupCount, 0, `${event} ${label} queried chat`);
    assert.equal(harness.emitted.length, 0, `${event} ${label} emitted`);
  };

  for (const event of ["typing", "stop-typing"]) {
    for (const [label, payload] of [
      ["undefined payload", undefined],
      ["null payload", null],
      ["empty payload", {}],
      ["missing chatId", { sender: ids.member }],
      ["invalid chatId", { chatId: "not-a-chat-id" }],
      ["non-string chatId", { chatId: 42 }],
      ["non-object payload", "invalid payload"],
    ]) {
      await assertMalformedTypingHandled(event, payload, label);
    }
  }
  console.log("typing events: malformed payloads are ignored without rejection or database lookup");

  const nonMemberTyping = createSocketHarness({ isMember: false });
  await emitFromClient(nonMemberTyping, "typing", { chatId: ids.chatA });
  assert.equal(nonMemberTyping.emitted.length, 0);

  const nonMemberStopTyping = createSocketHarness({ isMember: false });
  await emitFromClient(nonMemberStopTyping, "stop-typing", { chatId: ids.chatA });
  assert.equal(nonMemberStopTyping.emitted.length, 0);
  console.log("typing events: non-members remain unable to broadcast");
} finally {
  Chat.findOne = originals.chatFindOne;
  Message.findOne = originals.messageFindOne;
  Poll.findOne = originals.pollFindOne;
  User.findById = originals.userFindById;

  if (originals.jwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originals.jwtSecret;
  }
}