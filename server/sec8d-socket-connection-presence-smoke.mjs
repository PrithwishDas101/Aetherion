import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { updatePersonalProfile } from "./controllers/userController.js";
import User from "./models/User.js";
import { authenticateSocket } from "./socket/socket.js";
import registerPresenceHandlers from "./socket/presenceHandlers.js";
import {
  createSocketConnectionLimiter,
  MAX_SOCKETS_PER_USER,
} from "./socket/socketConnectionLimiter.js";

const secret = "sec8d-socket-connection-presence-smoke-secret";
const ids = {
  userA: "000000000000000000000001",
  userB: "000000000000000000000002",
};

const originalJwtSecret = process.env.JWT_SECRET;
const originals = {
  userFindById: User.findById,
  userFindByIdAndUpdate: User.findByIdAndUpdate,
};

const users = new Map();
const lastSeenUpdates = [];
const createUser = (userId) => {
  const user = {
    _id: userId,
    authVersion: 0,
    publicPresenceStatus: "automatic",
    async save() {},
    toObject() {
      return { ...this };
    },
    select(selection) {
      assert.ok(selection.includes("+authVersion"));
      return {
        lean: async () => ({
          _id: userId,
          authVersion: this.authVersion,
        }),
      };
    },
  };

  users.set(userId, user);
  return user;
};

const createSocket = (userId, clientUserId = userId) => {
  const listeners = new Map();
  const emitted = [];

  return {
    data: {},
    handshake: {
      auth: {
        token: jwt.sign({ userId, authVersion: 0 }, secret),
        userId: clientUserId,
      },
    },
    emitted,
    joinedRooms: [],
    on(event, handler) {
      const eventListeners = listeners.get(event) || [];
      eventListeners.push(handler);
      listeners.set(event, eventListeners);
    },
    async trigger(event, payload) {
      const eventListeners = listeners.get(event) || [];
      await Promise.all(eventListeners.map((handler) => handler(payload)));
    },
    emit(event, payload) {
      emitted.push({ event, payload });
    },
    join(room) {
      this.joinedRooms.push(room);
    },
  };
};

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

try {
  process.env.JWT_SECRET = secret;
  createUser(ids.userA);
  createUser(ids.userB);

  User.findById = (userId) => users.get(String(userId)) || null;
  User.findByIdAndUpdate = async (userId, update) => {
    lastSeenUpdates.push({ userId: String(userId), update });
    return users.get(String(userId)) || null;
  };

  const connectionLimiter = createSocketConnectionLimiter();
  assert.equal(MAX_SOCKETS_PER_USER, 5);

  const authenticateAndLimit = async (socket) => {
    let connectionError;
    await authenticateSocket(socket, (error) => {
      if (error) {
        connectionError = error;
        return;
      }

      connectionLimiter.middleware(socket, (limiterError) => {
        connectionError = limiterError;
      });
    });
    return connectionError;
  };

  const connectionHandlers = [];
  const broadcasts = [];
  const io = {
    on(event, handler) {
      if (event === "connection") {
        connectionHandlers.push(handler);
      }
    },
    emit(event, payload) {
      broadcasts.push({ event, payload });
    },
  };
  registerPresenceHandlers(io, { allow: () => true });

  const connectPresence = (socket) => {
    connectionHandlers.forEach((handler) => handler(socket));
  };
  const makeAcceptedSocket = async (userId, clientUserId = userId) => {
    const socket = createSocket(userId, clientUserId);
    const error = await authenticateAndLimit(socket);
    assert.equal(error, undefined);
    assert.equal(socket.data.userId, userId);
    connectPresence(socket);
    return socket;
  };

  const userASockets = [];
  for (let count = 0; count < MAX_SOCKETS_PER_USER; count += 1) {
    userASockets.push(await makeAcceptedSocket(ids.userA));
  }

  assert.equal(connectionLimiter.getConnectionCount(ids.userA), 5);
  assert.equal(
    broadcasts.filter((event) => event.event === "user-online" && event.payload.userId === ids.userA).length,
    1,
  );
  assert.ok(userASockets.every((socket) => socket.joinedRooms.includes(ids.userA)));
  console.log("connection cap: five authenticated sockets accepted; one online transition emitted");

  const rejectedUserASocket = createSocket(ids.userA);
  const rejectedError = await authenticateAndLimit(rejectedUserASocket);
  assert.equal(rejectedError?.message, "Maximum active socket connections reached");
  assert.equal(connectionLimiter.getConnectionCount(ids.userA), 5);
  assert.deepEqual(rejectedUserASocket.joinedRooms, []);
  assert.equal(
    broadcasts.filter((event) => event.event === "user-online" && event.payload.userId === ids.userA).length,
    1,
  );
  console.log("connection cap: sixth socket rejected without affecting active sockets or presence");

  const userBSockets = [];
  for (let count = 0; count < MAX_SOCKETS_PER_USER; count += 1) {
    userBSockets.push(await makeAcceptedSocket(ids.userB));
  }
  assert.equal(connectionLimiter.getConnectionCount(ids.userB), 5);
  assert.equal(
    broadcasts.filter((event) => event.event === "user-online" && event.payload.userId === ids.userB).length,
    1,
  );
  console.log("identity buckets: another authenticated user receives an independent five-socket cap");

  await userASockets[0].trigger("disconnect", "client namespace disconnect");
  await userASockets[0].trigger("disconnect", "duplicate cleanup");
  assert.equal(connectionLimiter.getConnectionCount(ids.userA), 4);
  assert.equal(
    broadcasts.filter((event) => event.event === "user-offline" && event.payload.userId === ids.userA).length,
    0,
  );
  console.log("cleanup: duplicate disconnect is idempotent and a freed slot does not mark the user offline");

  const spoofedSocket = await makeAcceptedSocket(ids.userA, ids.userB);
  assert.equal(spoofedSocket.data.userId, ids.userA);
  assert.deepEqual(spoofedSocket.joinedRooms, [ids.userA]);
  assert.equal(connectionLimiter.getConnectionCount(ids.userA), 5);
  assert.equal(connectionLimiter.getConnectionCount(ids.userB), 5);
  console.log("identity integrity: client-supplied user ID cannot select the cap bucket or presence room");

  for (const socket of [...userASockets.slice(1), spoofedSocket]) {
    await socket.trigger("disconnect", "client namespace disconnect");
  }
  await userASockets[0].trigger("disconnect", "duplicate cleanup after offline");
  assert.equal(connectionLimiter.getConnectionCount(ids.userA), 0);
  assert.equal(
    broadcasts.filter((event) => event.event === "user-offline" && event.payload.userId === ids.userA).length,
    1,
  );
  assert.equal(lastSeenUpdates.filter((entry) => entry.userId === ids.userA).length, 1);
  console.log("presence: only the final disconnect emits offline and updates lastSeen once");

  const reconnectedUserA = await makeAcceptedSocket(ids.userA);
  assert.equal(connectionLimiter.getConnectionCount(ids.userA), 1);
  assert.equal(
    broadcasts.filter((event) => event.event === "user-online" && event.payload.userId === ids.userA).length,
    2,
  );
  await reconnectedUserA.trigger("disconnect", "client namespace disconnect");
  await userBSockets[0].trigger("get-presence");
  const presenceState = userBSockets[0].emitted.find((entry) => entry.event === "presence-state");
  assert.deepEqual(presenceState.payload.userIds, [ids.userB]);
  assert.equal(connectionLimiter.getConnectionCount(ids.userB), 5);
  console.log("presence: offline reconnect emits one new online transition; other users stay online");

  const profileEvents = [];
  const profileIo = {
    emit(event, payload) {
      profileEvents.push({ event, payload });
    },
  };
  const updatePresenceStatus = async (status) => {
    const response = createResponse();
    await updatePersonalProfile(
      {
        user: { userId: ids.userA },
        body: { publicPresenceStatus: status },
        app: { get: () => profileIo },
      },
      response,
    );
    assert.equal(response.statusCode, 200);
  };

  await updatePresenceStatus("automatic");
  await updatePresenceStatus("online");
  await updatePresenceStatus("online");
  assert.equal(profileEvents.length, 1);
  assert.equal(profileEvents[0].payload.publicPresenceStatus, "online");
  await updatePresenceStatus("dnd");
  assert.equal(profileEvents.length, 2);
  assert.equal(profileEvents[1].payload.publicPresenceStatus, "dnd");
  console.log("public presence: same effective status is suppressed; changed status still broadcasts");

  for (const socket of userBSockets) {
    await socket.trigger("disconnect", "client namespace disconnect");
  }
  assert.equal(connectionLimiter.getConnectionCount(ids.userB), 0);

  console.log("SEC-8D socket connection/presence smoke checks passed");
} finally {
  User.findById = originals.userFindById;
  User.findByIdAndUpdate = originals.userFindByIdAndUpdate;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
}