import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";

import Chat from "../../models/Chat.js";
import Poll from "../../models/Poll.js";
import User from "../../models/User.js";
import contactRequestRoutes from "../../routes/contactRequestRoute.js";
import messageRoutes from "../../routes/MessageRoute.js";
import pollRoutes from "../../routes/pollRoute.js";
import { pdfFixture } from "./sec12-upload-fixtures.mjs";
import {
  authLimiter,
  profilePictureLimiter,
  removeProfilePictureLimiter,
} from "../../middleware/rateLimiter.js";

const secret = "sec8b-http-rate-limit-smoke-secret";
const originalJwtSecret = process.env.JWT_SECRET;
const originalConsoleLog = console.log;
const originals = {
  userFindById: User.findById,
  chatFindOne: Chat.findOne,
  pollFindById: Poll.findById,
};

const userId = (number) => String(number).padStart(24, "0");
const tokenFor = (id) =>
  jwt.sign({ userId: id, authVersion: 0 }, secret);

const app = express();
app.set("trust proxy", "loopback");
app.use(express.json());
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/contact-request", contactRequestRoutes);
app.use("/api/v1/poll", pollRoutes);

app.post("/__smoke/auth/signup", authLimiter, (_req, res) => {
  res.sendStatus(204);
});
app.post("/__smoke/auth/login", authLimiter, (_req, res) => {
  res.sendStatus(204);
});
app.post("/__smoke/profile-picture", profilePictureLimiter, (_req, res) => {
  res.sendStatus(204);
});
app.post("/__smoke/profile-banner", profilePictureLimiter, (_req, res) => {
  res.sendStatus(204);
});
app.delete("/__smoke/remove-profile-picture", removeProfilePictureLimiter, (_req, res) => {
  res.sendStatus(204);
});

process.env.JWT_SECRET = secret;
console.log = (...args) => {
  if (args[0] === "SEC-8B HTTP rate-limit smoke checks passed") {
    originalConsoleLog(...args);
  }
};
User.findById = (id) => ({
  select(selection) {
    assert.ok(selection.includes("+authVersion"));
    return {
      lean: async () => ({ _id: String(id), authVersion: 0 }),
    };
  },
});
Chat.findOne = async () => null;
Poll.findById = async () => null;

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

const request = async (
  path,
  {
    method = "POST",
    user = null,
    body = {},
    headers = {},
  } = {},
) => {
  const requestHeaders = { ...headers };

  if (user) {
    requestHeaders.Authorization = `Bearer ${tokenFor(user)}`;
  }

  if (!(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  return fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
};

const checkThreshold = async ({
  path,
  method = "POST",
  body,
  user,
  limit,
  expectedStatus,
  headers = {},
}) => {
  for (let count = 0; count < limit; count += 1) {
    const response = await request(path, {
      method,
      body,
      user,
      headers,
    });
    assert.equal(response.status, expectedStatus, `${path} request ${count + 1}`);
  }

  const limited = await request(path, {
    method,
    body,
    user,
    headers,
  });
  assert.equal(limited.status, 429, `${path} over limit`);
  const payload = await limited.json();
  assert.equal(payload.success, false);
  assert.equal(payload.message, "Too many requests. Please try again later.");
};

try {
  const authFailure = await request("/api/v1/message/send-message");
  assert.equal(authFailure.status, 401);
  console.log("authentication still runs before message limiters");

  const messageUser = userId(101);
  await checkThreshold({
    path: "/api/v1/message/send-message",
    body: {},
    user: messageUser,
    limit: 60,
    expectedStatus: 400,
  });
  const otherMessageUser = await request("/api/v1/message/send-message", {
    user: userId(102),
    body: {},
  });
  assert.equal(otherMessageUser.status, 400);
  const spoofedMessageUser = await request("/api/v1/message/send-message", {
    user: messageUser,
    body: {},
    headers: { "x-user-id": userId(102) },
  });
  assert.equal(spoofedMessageUser.status, 429);
  console.log("message: 60/user/minute enforced; users independent; client ID ignored");

  const contactUser = userId(201);
  await checkThreshold({
    path: "/api/v1/contact-request/not-an-object-id",
    body: {},
    user: contactUser,
    limit: 10,
    expectedStatus: 400,
  });
  const otherContactUser = await request(
    "/api/v1/contact-request/not-an-object-id",
    { user: userId(202), body: {} },
  );
  assert.equal(otherContactUser.status, 400);
  const spoofedContactUser = await request(
    "/api/v1/contact-request/not-an-object-id",
    {
      user: contactUser,
      body: {},
      headers: { "x-user-id": userId(202) },
    },
  );
  assert.equal(spoofedContactUser.status, 429);
  console.log("contact requests: 10/user/5 minutes enforced; user identity comes from auth");

  await checkThreshold({
    path: "/api/v1/poll",
    body: {},
    user: userId(301),
    limit: 10,
    expectedStatus: 400,
  });
  console.log("poll creation: 10/user/10 minutes enforced");

  await checkThreshold({
    path: "/api/v1/poll/000000000000000000000401/vote",
    method: "PUT",
    body: {},
    user: userId(401),
    limit: 20,
    expectedStatus: 400,
  });
  console.log("poll voting: 20/user/minute enforced");

  for (let count = 0; count < 300; count += 1) {
    const response = await request("/api/v1/message/send-message", {
      user: userId(1000 + count),
      body: {},
      headers: { "x-forwarded-for": "192.0.2.88" },
    });
    assert.equal(response.status, 400, `message IP request ${count + 1}`);
  }
  const messageIpLimited = await request("/api/v1/message/send-message", {
    user: userId(2000),
    body: {},
    headers: { "x-forwarded-for": "192.0.2.88" },
  });
  assert.equal(messageIpLimited.status, 429);
  console.log("message IP ceiling: 300/minute enforced across authenticated users");

  const messageAuthorization = await request("/api/v1/message/send-message", {
    user: userId(501),
    body: {
      chatId: "000000000000000000000501",
      text: "hello",
    },
  });
  assert.equal(messageAuthorization.status, 404);

  Poll.findById = async () => ({
    chatId: "000000000000000000000601",
    allowMultipleAnswers: false,
    options: [{ _id: "valid-option", votes: [] }],
  });
  const pollAuthorization = await request(
    "/api/v1/poll/000000000000000000000601/vote",
    {
      method: "PUT",
      user: userId(601),
      body: { optionIds: ["valid-option"] },
    },
  );
  assert.equal(pollAuthorization.status, 403);
  console.log("message and poll membership failures retain their existing status codes");

  const upload = new FormData();
  upload.append("chatId", "000000000000000000000701");
  upload.append("type", "document");
  upload.append("text", "attachment");
  upload.append("replyTo", "");
  upload.append("media", new Blob([pdfFixture], { type: "application/pdf" }), "file.pdf");
  const uploadedMessage = await request("/api/v1/message/send-message", {
    user: userId(701),
    body: upload,
    headers: { "x-forwarded-for": "192.0.2.89" },
  });
  assert.equal(uploadedMessage.status, 404);
  console.log("message upload: SEC-2 Multer accepts valid file before existing membership rejection");

  for (let count = 0; count < 100; count += 1) {
    const path = count % 2 === 0
      ? "/__smoke/auth/signup"
      : "/__smoke/auth/login";
    assert.equal((await request(path)).status, 204);
  }
  assert.equal((await request("/__smoke/auth/login")).status, 429);

  for (let count = 0; count < 5; count += 1) {
    const path = count < 3 ? "/__smoke/profile-picture" : "/__smoke/profile-banner";
    assert.equal((await request(path)).status, 204);
  }
  assert.equal((await request("/__smoke/profile-picture")).status, 429);

  for (let count = 0; count < 10; count += 1) {
    assert.equal(
      (await request("/__smoke/remove-profile-picture", { method: "DELETE" })).status,
      204,
    );
  }
  assert.equal(
    (await request("/__smoke/remove-profile-picture", { method: "DELETE" })).status,
    429,
  );
  console.log("existing auth/profile-image limiters retain their configured thresholds");
  console.log("SEC-8B HTTP rate-limit smoke checks passed");
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  User.findById = originals.userFindById;
  Chat.findOne = originals.chatFindOne;
  Poll.findById = originals.pollFindById;
  console.log = originalConsoleLog;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
}