import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { clearUnreadMessages } from "../../controllers/chatController.js";
import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";
import Poll from "../../models/Poll.js";
import User from "../../models/User.js";
import { authenticateSocket } from "../../socket/socket.js";
import { registerSocketHandlers } from "../../socket/socketHandlers.js";
import registerPresenceHandlers from "../../socket/presenceHandlers.js";
import { createSocketEventLimiter } from "../../socket/socketEventLimiter.js";

const secret = "sec8c-socket-rate-limit-smoke-secret";
const ids = {
  userA: "000000000000000000000001",
  userB: "000000000000000000000002",
  userC: "000000000000000000000003",
  userD: "000000000000000000000004",
  recipient: "000000000000000000000099",
  chat: "00000000000000000000000a",
  message: "000000000000000000000011",
  missingMessage: "000000000000000000000033",
  poll: "000000000000000000000044",
};

const originalJwtSecret = process.env.JWT_SECRET;
const originals = {
  chatFindOne: Chat.findOne,
  chatFindByIdAndUpdate: Chat.findByIdAndUpdate,
  messageFindOne: Message.findOne,
  messageUpdateMany: Message.updateMany,
  pollFindOne: Poll.findOne,
  userFindById: User.findById,
};

const authenticatedUsers = new Set();
let chatLookups = 0;
let messageLookups = 0;
let pollLookups = 0;

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

const authenticateUser = async (userId) => {
  authenticatedUsers.add(userId);
  const socket = {
    handshake: {
      auth: {
        token: jwt.sign({ userId, authVersion: 0 }, secret),
      },
    },
    data: {},
  };
  let authenticationError;

  await authenticateSocket(socket, (error) => {
    authenticationError = error;
  });

  assert.equal(authenticationError, undefined);
  assert.equal(socket.data.userId, userId);

  return socket.data.userId;
};

const createSocketHarness = (userId, eventLimiter) => {
  const listeners = {};
  const emitted = [];
  const directEmitted = [];
  const serverEmitted = [];
  const connectionHandlers = [];
  let disconnected = false;

  const io = {
    on(event, handler) {
      if (event === "connection") {
        connectionHandlers.push(handler);
      }
    },
    emit(event, payload) {
      serverEmitted.push({ event, payload });
    },
  };

  const socket = {
    data: { userId },
    on(event, handler) {
      listeners[event] = handler;
    },
    emit(event, payload) {
      directEmitted.push({ event, payload });
    },
    join() {},
    to(room) {
      return {
        emit(event, payload) {
          emitted.push({ room, event, payload });
        },
      };
    },
    disconnect(force) {
      disconnected = force;
    },
  };

  registerSocketHandlers(io, eventLimiter);
  registerPresenceHandlers(io, eventLimiter);
  connectionHandlers.forEach((handler) => handler(socket));

  return {
    emitted,
    directEmitted,
    listeners,
    serverEmitted,
    get disconnected() {
      return disconnected;
    },
  };
};

const emit = async (harness, event, payload) => {
  await harness.listeners[event](payload);
};

const makeResponse = () => ({
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

try {
  process.env.JWT_SECRET = secret;

  User.findById = (userId) => ({
    select(selection) {
      assert.ok(selection.includes("+authVersion"));
      return {
        lean: async () =>
          authenticatedUsers.has(String(userId))
            ? { _id: String(userId), authVersion: 0 }
            : null,
      };
    },
  });

  Chat.findOne = (query) => {
    chatLookups += 1;
    const userId = String(query.members);
    const isAuthorized =
      String(query._id) === ids.chat && authenticatedUsers.has(userId);

    return makeQuery(
      isAuthorized
        ? {
            _id: ids.chat,
            members: [userId, ids.recipient],
          }
        : null,
    );
  };

  Message.findOne = (query) => {
    messageLookups += 1;
    const validRecord =
      String(query._id) === ids.message &&
      String(query.chatId) === ids.chat &&
      authenticatedUsers.has(String(query.sender));

    return makeQuery(
      validRecord
        ? {
            _id: ids.message,
            chatId: ids.chat,
            sender: String(query.sender),
            type: "text",
            text: "persisted message",
            populate() {
              return this;
            },
          }
        : null,
    );
  };

  Poll.findOne = async (query) => {
    pollLookups += 1;

    if (
      String(query._id) !== ids.poll ||
      String(query.chatId) !== ids.chat
    ) {
      return null;
    }

    return {
      _id: ids.poll,
      chatId: ids.chat,
      question: "persisted poll",
      options: [{ _id: "option-a", votes: [] }],
    };
  };

  const userA = await authenticateUser(ids.userA);
  const userB = await authenticateUser(ids.userB);
  const userC = await authenticateUser(ids.userC);
  const userD = await authenticateUser(ids.userD);
  const limiter = createSocketEventLimiter();
  const userASocketOne = createSocketHarness(userA, limiter);
  const userASocketTwo = createSocketHarness(userA, limiter);
  const userBSocket = createSocketHarness(userB, limiter);

  for (let count = 0; count < 20; count += 1) {
    await emit(
      count % 2 === 0 ? userASocketOne : userASocketTwo,
      "typing",
      { chatId: ids.chat, sender: userB },
    );
  }
  const typingLookupsAtLimit = chatLookups;
  await emit(userASocketTwo, "typing", {
    chatId: ids.chat,
    sender: userB,
  });
  assert.equal(userASocketOne.emitted.length + userASocketTwo.emitted.length, 20);
  assert.equal(chatLookups, typingLookupsAtLimit);
  assert.equal(userASocketOne.emitted[0].payload.sender, userA);
  await emit(userBSocket, "typing", {
    chatId: ids.chat,
    sender: userA,
  });
  assert.equal(userBSocket.emitted.length, 1);
  assert.equal(userBSocket.emitted[0].payload.sender, userB);
  console.log("typing: 20/10s shared across sockets; identities remain isolated and server-derived");

  for (const payload of [undefined, null, {}, { chatId: "invalid" }, { chatId: 42 }]) {
    await emit(userASocketOne, "stop-typing", payload);
  }
  assert.equal(userASocketOne.emitted.length, 10);

  for (let count = 0; count < 20; count += 1) {
    await emit(
      count % 2 === 0 ? userASocketOne : userASocketTwo,
      "stop-typing",
      { chatId: ids.chat },
    );
  }
  const stopTypingEmitted =
    userASocketOne.emitted.filter((item) => item.event === "stop-typing").length +
    userASocketTwo.emitted.filter((item) => item.event === "stop-typing").length;
  await emit(userASocketTwo, "stop-typing", { chatId: ids.chat });
  assert.equal(
    userASocketOne.emitted.filter((item) => item.event === "stop-typing").length +
      userASocketTwo.emitted.filter((item) => item.event === "stop-typing").length,
    stopTypingEmitted,
  );
  assert.equal(stopTypingEmitted, 20);
  console.log("stop-typing: malformed inputs return safely; 20/10s shared across sockets");

  const messageSocketOne = createSocketHarness(userC, limiter);
  const messageSocketTwo = createSocketHarness(userC, limiter);
  for (let count = 0; count < 30; count += 1) {
    await emit(
      count % 2 === 0 ? messageSocketOne : messageSocketTwo,
      "send-message",
      {
        message: {
          _id: ids.message,
          chatId: ids.chat,
          sender: userD,
          text: "fabricated message",
        },
        chat: { _id: ids.chat },
      },
    );
  }
  const messageLookupsAtLimit = messageLookups;
  await emit(messageSocketTwo, "send-message", {
    message: { _id: ids.message, chatId: ids.chat },
    chat: { _id: ids.chat },
  });
  assert.equal(messageLookups, messageLookupsAtLimit);
  assert.equal(messageSocketOne.emitted.length + messageSocketTwo.emitted.length, 30);
  assert.equal(messageSocketOne.emitted[0].payload.message.text, "persisted message");
  assert.equal(messageSocketOne.emitted[0].payload.message.sender, userC);

  const missingMessageSocket = createSocketHarness(userD, limiter);
  await emit(missingMessageSocket, "send-message", {
    message: { _id: ids.missingMessage, chatId: ids.chat },
    chat: { _id: ids.chat },
  });
  assert.equal(missingMessageSocket.emitted.length, 0);
  console.log("send-message: 30/10s shared across sockets; only persisted sender-owned data relays");

  const pollSocketOne = createSocketHarness(userD, limiter);
  const pollSocketTwo = createSocketHarness(userD, limiter);
  for (let count = 0; count < 20; count += 1) {
    await emit(count % 2 === 0 ? pollSocketOne : pollSocketTwo, "poll-updated", {
      poll: { _id: ids.poll, question: "fabricated poll" },
      chatId: ids.chat,
    });
  }
  const pollLookupsAtLimit = pollLookups;
  await emit(pollSocketTwo, "poll-updated", {
    poll: { _id: ids.poll },
    chatId: ids.chat,
  });
  assert.equal(pollLookups, pollLookupsAtLimit);
  assert.equal(pollSocketOne.emitted.length + pollSocketTwo.emitted.length, 20);
  assert.equal(pollSocketOne.emitted[0].payload.poll.question, "persisted poll");
  console.log("poll-updated: 20/10s shared across sockets; persisted poll remains authoritative");

  const presenceSocket = createSocketHarness(userB, limiter);
  for (let count = 0; count < 10; count += 1) {
    presenceSocket.listeners["get-presence"]();
  }
  presenceSocket.listeners["get-presence"]();
  assert.equal(
    presenceSocket.directEmitted.filter((item) => item.event === "presence-state").length,
    10,
  );
  console.log("get-presence: 10/10s response limit enforced");

  let readEvents = 0;
  let readMessageUpdates = 0;
  const readUser = userA;
  let activeReadUser = readUser;
  const getReadChat = (requesterId) => ({
    _id: ids.chat,
    members: [{ _id: requesterId }, { _id: ids.recipient }],
  });
  Chat.findOne = async (query) => {
    const matchesChat = String(query._id) === ids.chat;
    activeReadUser = String(query.members);
    assert.equal(matchesChat, true);
    assert.ok([userA, userB].includes(activeReadUser));
    return getReadChat(activeReadUser);
  };
  Message.updateMany = async () => {
    readMessageUpdates += 1;
  };
  Chat.findByIdAndUpdate = () => ({
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(getReadChat(activeReadUser)).then(resolve, reject);
    },
  });

  const clearUnread = async (requesterId) => {
    const req = {
      body: { chatId: ids.chat },
      user: { userId: requesterId },
      app: {
        get() {
          return {
            to() {
              return {
                emit(event) {
                  if (event === "messages-read") {
                    readEvents += 1;
                  }
                },
              };
            },
          };
        },
      },
    };
    const res = makeResponse();
    await clearUnreadMessages(req, res);
    assert.equal(res.statusCode, 200);
  };

  for (let count = 0; count < 31; count += 1) {
    await clearUnread(readUser);
  }
  assert.equal(readEvents, 30);
  assert.equal(readMessageUpdates, 31);
  await clearUnread(userB);
  assert.equal(readEvents, 31);
  console.log("messages-read: 30/10s outbound events limited per authenticated HTTP user");

  let now = 0;
  const boundedLimiter = createSocketEventLimiter({
    maxTrackedUsers: 2,
    staleUserMs: 1000,
    now: () => now,
  });
  assert.equal(boundedLimiter.allow("old-user-a", "typing"), true);
  now = 100;
  assert.equal(boundedLimiter.allow("old-user-b", "typing"), true);
  now = 1200;
  assert.equal(boundedLimiter.allow("new-user", "typing"), true);
  assert.equal(boundedLimiter.trackedUsers, 1);
  boundedLimiter.allow("next-user-a", "typing");
  boundedLimiter.allow("next-user-b", "typing");
  assert.equal(boundedLimiter.trackedUsers, 2);
  console.log("limiter state: stale users removed and tracked-user map remains bounded");

  console.log("SEC-8C socket rate-limit smoke checks passed");
} finally {
  Chat.findOne = originals.chatFindOne;
  Chat.findByIdAndUpdate = originals.chatFindByIdAndUpdate;
  Message.findOne = originals.messageFindOne;
  Message.updateMany = originals.messageUpdateMany;
  Poll.findOne = originals.pollFindOne;
  User.findById = originals.userFindById;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
}
