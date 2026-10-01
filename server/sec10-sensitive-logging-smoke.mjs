import assert from "node:assert/strict";
import { createServer } from "node:http";
import express from "express";

import { login } from "./controllers/authController.js";
import { sendMessage } from "./controllers/messageController.js";
import Chat from "./models/Chat.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import { messageUpload } from "./middleware/uploadMiddleware.js";
import { registerSocketHandlers } from "./socket/socketHandlers.js";
import {
  logSafeClientDiagnostic,
  logSafeClientError,
} from "../client/src/utils/safeLogging.js";

const ids = {
  chat: "00000000000000000000000a",
  sender: "000000000000000000000001",
  recipient: "000000000000000000000002",
  message: "00000000000000000000000b",
};
const sentinels = [
  "SECRET_MESSAGE_SENTINEL",
  "SECRET_LOCATION_SENTINEL",
  "SECRET_FILENAME_SENTINEL.pdf",
  "SECRET_CLOUDINARY_URL_SENTINEL",
  "SECRET_EMAIL_SENTINEL@example.test",
  "SECRET_TOKEN_SENTINEL",
  "SECRET_PASSWORD_SENTINEL",
  "SECRET_ERROR_NAME_SENTINEL",
  "SECRET_ERROR_CODE_SENTINEL",
];

const originals = {
  chatFindOne: Chat.findOne,
  chatFindByIdAndUpdate: Chat.findByIdAndUpdate,
  messageCreate: Message.create,
  userFindOne: User.findOne,
  consoleLog: console.log,
  consoleError: console.error,
};

const capturedLogs = [];
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

const uploadApp = express();
uploadApp.post("/upload", messageUpload.single("media"), (_req, res) => {
  res.status(201).json({ success: true });
});
const uploadServer = createServer(uploadApp);

try {
  console.log = (...args) => capturedLogs.push(args);
  console.error = (...args) => capturedLogs.push(args);

  Chat.findOne = async () => ({
    _id: ids.chat,
    members: [ids.sender, ids.recipient],
  });
  Message.create = async () => {
    throw new Error(
      `${sentinels[0]} ${sentinels[1]} ${sentinels[3]}`,
    );
  };

  const messageResponse = createResponse();
  await sendMessage(
    {
      user: { userId: ids.sender },
      body: {
        chatId: ids.chat,
        text: sentinels[0],
        type: "text",
        mediaUrl: sentinels[3],
        location: { address: sentinels[1] },
        contact: { email: sentinels[4] },
      },
      file: {
        originalname: sentinels[2],
        mimetype: "application/pdf",
        size: 100,
        buffer: Buffer.from("private file"),
      },
    },
    messageResponse,
  );
  assert.equal(messageResponse.statusCode, 500);
  assert.ok(
    capturedLogs.some(
      ([operation, context]) =>
        operation === "Message request received" &&
        context.chatId === ids.chat &&
        context.type === "text" &&
        context.hasFile === true,
    ),
  );

  const savedMessage = {
    _id: ids.message,
    type: "text",
    async populate() {
      return this;
    },
  };
  Message.create = async () => savedMessage;
  Chat.findByIdAndUpdate = () => ({
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve({ _id: ids.chat }).then(resolve, reject);
    },
  });
  const successfulMessageResponse = createResponse();
  await sendMessage(
    {
      user: { userId: ids.sender },
      body: { chatId: ids.chat, text: sentinels[0], type: "text" },
    },
    successfulMessageResponse,
  );
  assert.equal(successfulMessageResponse.statusCode, 201);
  assert.ok(
    capturedLogs.some(
      ([operation, context]) =>
        operation === "Message saved" &&
        context.chatId === ids.chat &&
        context.messageId === ids.message &&
        context.type === "text",
    ),
  );

  User.findOne = () => ({
    select: async () => {
      throw new Error(
        `${sentinels[4]} ${sentinels[5]} ${sentinels[6]}`,
      );
    },
  });
  const loginResponse = createResponse();
  await login(
    {
      body: {
        email: sentinels[4],
        password: sentinels[6],
      },
    },
    loginResponse,
  );
  assert.equal(loginResponse.statusCode, 500);

  const socketListeners = new Map();
  let connectionHandler;
  const socket = {
    data: { userId: ids.sender },
    on(event, handler) {
      socketListeners.set(event, handler);
    },
    to() {
      return { emit() {} };
    },
  };
  const socketIo = {
    on(event, handler) {
      if (event === "connection") {
        connectionHandler = handler;
      }
    },
  };
  Chat.findOne = () => ({
    lean: () =>
      Promise.reject(
        Object.assign(new Error(`${sentinels[0]} ${sentinels[3]}`), {
          name: sentinels[7],
          code: sentinels[8],
        }),
      ),
  });
  registerSocketHandlers(socketIo, { allow: () => true });
  connectionHandler(socket);
  await socketListeners.get("send-message")({
    message: { _id: ids.message, chatId: ids.chat },
    chat: { _id: ids.chat },
  });

  const clientError = Object.assign(new Error(sentinels[0]), {
    code: "ERR_NETWORK",
    name: sentinels[7],
    config: { headers: { Authorization: sentinels[5] } },
    response: { status: 502, data: sentinels[0] },
  });
  logSafeClientError("Client request", clientError);
  logSafeClientError(
    "Untrusted client error",
    Object.assign(new Error("private error"), {
      name: sentinels[7],
      code: sentinels[8],
    }),
  );
  logSafeClientDiagnostic("Client media upload", {
    chatId: ids.chat,
    type: "document",
    filename: sentinels[2],
    email: sentinels[4],
    url: sentinels[3],
  });

  await new Promise((resolve) =>
    uploadServer.listen(0, "127.0.0.1", resolve),
  );
  const form = new FormData();
  form.append(
    "media",
    new Blob(["private upload"], { type: "application/pdf" }),
    sentinels[2],
  );
  const uploadResponse = await fetch(
    `http://127.0.0.1:${uploadServer.address().port}/upload`,
    { method: "POST", body: form },
  );
  assert.equal(uploadResponse.status, 201);
  assert.deepEqual(await uploadResponse.json(), { success: true });

  const serializedLogs = JSON.stringify(capturedLogs);
  for (const sentinel of sentinels) {
    assert.equal(serializedLogs.includes(sentinel), false, sentinel);
  }
  assert.ok(serializedLogs.includes("Login failed"));
  assert.ok(serializedLogs.includes("Send message failed"));
  assert.ok(serializedLogs.includes("Socket send-message failed"));
  assert.ok(serializedLogs.includes("ERR_NETWORK"));
  assert.ok(serializedLogs.includes("502"));
  assert.ok(serializedLogs.includes(ids.chat));
  originals.consoleLog("SEC-10 message/auth/upload logging checks passed");
} finally {
  Chat.findOne = originals.chatFindOne;
  Chat.findByIdAndUpdate = originals.chatFindByIdAndUpdate;
  Message.create = originals.messageCreate;
  User.findOne = originals.userFindOne;

  await new Promise((resolve, reject) => {
    uploadServer.close((error) => (error ? reject(error) : resolve()));
  });

  console.log = originals.consoleLog;
  console.error = originals.consoleError;
}