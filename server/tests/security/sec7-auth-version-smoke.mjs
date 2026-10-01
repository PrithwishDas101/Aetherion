import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { login, logout, signup } from "../../controllers/authController.js";
import { protectRoute } from "../../middleware/authMiddleware.js";
import User from "../../models/User.js";
import { authenticateSocket } from "../../socket/socket.js";

const secret = "sec7-smoke-secret";
const userId = "507f1f77bcf86cd799439011";
process.env.JWT_SECRET = secret;

const originals = {
  findById: User.findById,
  findByIdAndUpdate: User.findByIdAndUpdate,
  findOne: User.findOne,
  create: User.create,
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

const createToken = (claims, signingSecret = secret, options = {}) =>
  jwt.sign(claims, signingSecret, { expiresIn: "7d", ...options });

let storedAuthVersion;
let userExists = true;
let selectedAuthVersion = false;

User.findById = (id) => {
  assert.equal(String(id), userId);

  return {
    select(selection) {
      selectedAuthVersion = selection.includes("+authVersion");
      return {
        lean: async () => {
          if (!userExists) {
            return null;
          }

          return storedAuthVersion === undefined
            ? { _id: userId }
            : { _id: userId, authVersion: storedAuthVersion };
        },
      };
    },
  };
};

const runHttpAuth = async (token) => {
  const req = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
  const res = createResponse();
  let nextCalled = false;

  await protectRoute(req, res, () => {
    nextCalled = true;
  });

  return { req, res, nextCalled };
};

const runSocketAuth = async (token) => {
  const socket = {
    handshake: { auth: token ? { token } : {} },
    data: {},
  };
  let authError;

  await authenticateSocket(socket, (error) => {
    authError = error;
  });

  return { socket, authError };
};

try {
  const passwordHash = await bcrypt.hash("smoke-password", 4);
  const loginUser = User.hydrate({
    _id: userId,
    firstName: "Smoke",
    lastName: "User",
    email: "smoke@example.test",
    password: passwordHash,
  });

  User.findOne = () => ({
    select(selection) {
      assert.ok(selection.includes("+password"));
      assert.ok(selection.includes("+authVersion"));
      return Promise.resolve(loginUser);
    },
  });

  const loginRes = createResponse();
  await login(
    { body: { email: "smoke@example.test", password: "smoke-password" } },
    loginRes,
  );
  assert.equal(loginRes.statusCode, 200);
  const loginClaims = jwt.verify(loginRes.body.token, secret);
  assert.equal(loginClaims.userId, userId);
  assert.equal(loginClaims.authVersion, 0);
  assert.equal(typeof loginClaims.authVersion, "number");

  User.findOne = async () => null;
  User.create = async (values) =>
    new User({ ...values, _id: userId });

  const signupRes = createResponse();
  await signup(
    {
      body: {
        firstName: "Smoke",
        lastName: "User",
        email: "new-smoke@example.test",
        password: "smoke-password",
      },
    },
    signupRes,
  );
  assert.equal(signupRes.statusCode, 200);
  const signupClaims = jwt.verify(signupRes.body.token, secret);
  assert.equal(signupClaims.authVersion, 0);
  assert.equal(typeof signupClaims.authVersion, "number");

  storedAuthVersion = undefined;
  const versionZeroToken = createToken({ userId, authVersion: 0 });
  const legacyDatabaseUser = await runHttpAuth(versionZeroToken);
  assert.equal(selectedAuthVersion, true);
  assert.equal(legacyDatabaseUser.nextCalled, true);
  assert.equal(legacyDatabaseUser.req.user.userId, userId);

  storedAuthVersion = 0;
  const matchingHttp = await runHttpAuth(versionZeroToken);
  assert.equal(matchingHttp.nextCalled, true);

  const staleHttp = await runHttpAuth(createToken({ userId, authVersion: 1 }));
  assert.equal(staleHttp.nextCalled, false);
  assert.equal(staleHttp.res.statusCode, 401);

  const missingClaimHttp = await runHttpAuth(createToken({ userId }));
  assert.equal(missingClaimHttp.nextCalled, false);
  assert.equal(missingClaimHttp.res.statusCode, 401);

  for (const malformedVersion of [null, "0", Number.NaN, -1, 0.5]) {
    const malformed = await runHttpAuth(
      createToken({ userId, authVersion: malformedVersion }),
    );
    assert.equal(malformed.nextCalled, false);
    assert.equal(malformed.res.statusCode, 401);
  }

  const invalidSignature = await runHttpAuth(
    createToken({ userId, authVersion: 0 }, "wrong-secret"),
  );
  assert.equal(invalidSignature.nextCalled, false);
  assert.equal(invalidSignature.res.statusCode, 401);

  const expiredToken = createToken({ userId, authVersion: 0 }, secret, {
    expiresIn: -1,
  });
  const expiredHttp = await runHttpAuth(expiredToken);
  assert.equal(expiredHttp.nextCalled, false);
  assert.equal(expiredHttp.res.statusCode, 401);

  userExists = false;
  const missingUserHttp = await runHttpAuth(versionZeroToken);
  assert.equal(missingUserHttp.nextCalled, false);
  assert.equal(missingUserHttp.res.statusCode, 401);
  userExists = true;

  const matchingSocket = await runSocketAuth(versionZeroToken);
  assert.equal(matchingSocket.authError, undefined);
  assert.equal(matchingSocket.socket.data.userId, userId);

  const staleSocket = await runSocketAuth(
    createToken({ userId, authVersion: 1 }),
  );
  assert.equal(staleSocket.authError.message, "Invalid or expired authentication token");

  const missingClaimSocket = await runSocketAuth(createToken({ userId }));
  assert.equal(missingClaimSocket.authError.message, "Invalid or expired authentication token");

  for (const malformedVersion of [null, "0", Number.NaN, -1, 0.5]) {
    const malformed = await runSocketAuth(
      createToken({ userId, authVersion: malformedVersion }),
    );
    assert.equal(malformed.authError.message, "Invalid or expired authentication token");
  }

  const invalidSocket = await runSocketAuth(
    createToken({ userId, authVersion: 0 }, "wrong-secret"),
  );
  assert.equal(invalidSocket.authError.message, "Invalid or expired authentication token");

  const expiredSocket = await runSocketAuth(expiredToken);
  assert.equal(expiredSocket.authError.message, "Invalid or expired authentication token");

  let disconnectRoom;
  let forceDisconnect;
  User.findByIdAndUpdate = async (id, update, options) => {
    assert.equal(String(id), userId);
    assert.deepEqual(update, { $inc: { authVersion: 1 } });
    assert.equal(options.new, true);
    storedAuthVersion = (storedAuthVersion ?? 0) + 1;
    return { _id: userId };
  };

  const logoutRes = createResponse();
  await logout(
    {
      user: { userId },
      app: {
        get(name) {
          assert.equal(name, "io");
          return {
            in(room) {
              disconnectRoom = room;
              return {
                disconnectSockets(force) {
                  forceDisconnect = force;
                },
              };
            },
          };
        },
      },
    },
    logoutRes,
  );

  assert.equal(logoutRes.statusCode, 200);
  assert.equal(storedAuthVersion, 1);
  assert.equal(disconnectRoom, userId);
  assert.equal(forceDisconnect, true);

  const oldTokenAfterLogout = await runHttpAuth(versionZeroToken);
  assert.equal(oldTokenAfterLogout.nextCalled, false);
  assert.equal(oldTokenAfterLogout.res.statusCode, 401);

  const versionOneToken = createToken({ userId, authVersion: 1 });
  const newTokenAfterLogout = await runHttpAuth(versionOneToken);
  assert.equal(newTokenAfterLogout.nextCalled, true);

  const newSocketAfterLogout = await runSocketAuth(versionOneToken);
  assert.equal(newSocketAfterLogout.authError, undefined);
  assert.equal(newSocketAfterLogout.socket.data.userId, userId);

  const oldSocketAfterLogout = await runSocketAuth(versionZeroToken);
  assert.equal(oldSocketAfterLogout.authError.message, "Invalid or expired authentication token");

  const logoutWithoutIoRes = createResponse();
  await logout(
    {
      user: { userId },
      app: {
        get() {
          return undefined;
        },
      },
    },
    logoutWithoutIoRes,
  );
  assert.equal(logoutWithoutIoRes.statusCode, 200);
  assert.equal(storedAuthVersion, 2);

  console.log("SEC-7 authVersion smoke checks passed");
} finally {
  User.findById = originals.findById;
  User.findByIdAndUpdate = originals.findByIdAndUpdate;
  User.findOne = originals.findOne;
  User.create = originals.create;
}