import assert from "node:assert/strict";
import { createServer } from "node:http";
import jwt from "jsonwebtoken";

import app from "./app.js";
import { profilePictureUpload } from "./middleware/uploadMiddleware.js";
import initializeSocket from "./socket/socket.js";
import User from "./models/User.js";
import { pngFixture } from "./sec12-upload-fixtures.mjs";

const secret = "sec9-security-headers-smoke-secret";
const userId = "000000000000000000000009";
const allowedOrigin = "http://localhost:5173";
const originalJwtSecret = process.env.JWT_SECRET;
const originalUserFindById = User.findById;
const originalUserFindByIdAndUpdate = User.findByIdAndUpdate;

app.post(
  "/__sec9/upload",
  profilePictureUpload.single("profilePic"),
  (req, res) => {
    res.status(201).json({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
    });
  },
);

const server = createServer(app);
const io = initializeSocket(server);

try {
  process.env.JWT_SECRET = secret;
  User.findById = (id) => ({
    select(selection) {
      assert.ok(selection.includes("+authVersion"));
      return {
        lean: async () => ({ _id: String(id), authVersion: 0 }),
      };
    },
  });
  User.findByIdAndUpdate = async () => ({});

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const apiResponse = await fetch(`${baseUrl}/api/v1/user/get-logged-user`, {
    headers: { Origin: allowedOrigin },
  });

  assert.equal(apiResponse.status, 401);
  assert.equal(apiResponse.headers.get("access-control-allow-origin"), allowedOrigin);
  assert.equal(apiResponse.headers.get("x-content-type-options"), "nosniff");
  assert.equal(apiResponse.headers.get("x-frame-options"), "DENY");
  assert.equal(
    apiResponse.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.equal(apiResponse.headers.get("content-security-policy"), null);
  assert.equal(apiResponse.headers.get("strict-transport-security"), null);
  assert.equal(apiResponse.headers.get("x-dns-prefetch-control"), "off");
  assert.equal(apiResponse.headers.get("x-download-options"), "noopen");
  assert.equal(apiResponse.headers.get("x-permitted-cross-domain-policies"), "none");
  assert.equal(apiResponse.headers.get("origin-agent-cluster"), "?1");
  console.log("headers: nosniff, DENY framing, referrer policy, and compatible Helmet defaults present");
  console.log("CSP/HSTS: intentionally absent; CORS-allowed API request retains its existing 401 response");

  const originalConsoleError = console.error;
  let blockedCorsResponse;
  try {
    console.error = () => {};
    blockedCorsResponse = await fetch(
      `${baseUrl}/api/v1/user/get-logged-user`,
      { headers: { Origin: "https://untrusted.example" } },
    );
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(blockedCorsResponse.status, 500);
  assert.equal(blockedCorsResponse.headers.get("access-control-allow-origin"), null);
  console.log("CORS: configured frontend origin remains allowed; unconfigured origin receives no allow header");

  const upload = new FormData();
  upload.append(
    "profilePic",
    new Blob([pngFixture], { type: "image/png" }),
    "profile.png",
  );
  const uploadResponse = await fetch(`${baseUrl}/__sec9/upload`, {
    method: "POST",
    headers: { Origin: allowedOrigin },
    body: upload,
  });
  assert.equal(uploadResponse.status, 201);
  assert.equal(uploadResponse.headers.get("x-content-type-options"), "nosniff");
  assert.equal(uploadResponse.headers.get("access-control-allow-origin"), allowedOrigin);
  assert.deepEqual(await uploadResponse.json(), {
    filename: "profile.png",
    mimetype: "image/png",
  });
  console.log("uploads: existing multipart middleware still accepts a legitimate profile image");

  const engineUrl = `${baseUrl}/socket.io/?EIO=4&transport=polling&t=${Date.now()}`;
  const engineResponse = await fetch(engineUrl, {
    headers: { Origin: allowedOrigin },
  });
  assert.equal(engineResponse.status, 200);
  assert.equal(engineResponse.headers.get("access-control-allow-origin"), allowedOrigin);
  const enginePacket = await engineResponse.text();
  assert.equal(enginePacket[0], "0");
  const { sid } = JSON.parse(enginePacket.slice(1));

  const token = jwt.sign({ userId, authVersion: 0 }, secret);
  const socketConnectResponse = await fetch(
    `${baseUrl}/socket.io/?EIO=4&transport=polling&sid=${encodeURIComponent(sid)}`,
    {
      method: "POST",
      headers: {
        Origin: allowedOrigin,
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: `40${JSON.stringify({ token })}`,
    },
  );
  assert.equal(socketConnectResponse.status, 200);
  assert.equal(await socketConnectResponse.text(), "ok");

  const socketAckResponse = await fetch(
    `${baseUrl}/socket.io/?EIO=4&transport=polling&sid=${encodeURIComponent(sid)}`,
    { headers: { Origin: allowedOrigin } },
  );
  assert.equal(socketAckResponse.status, 200);
  assert.match(await socketAckResponse.text(), /^40\{"sid":/);
  console.log("Socket.IO: allowed-origin polling handshake and authenticated namespace connection succeed");

  await fetch(
    `${baseUrl}/socket.io/?EIO=4&transport=polling&sid=${encodeURIComponent(sid)}`,
    {
      method: "POST",
      headers: {
        Origin: allowedOrigin,
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: "41",
    },
  );

  console.log("SEC-9 security headers smoke checks passed");
} finally {
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }

  await new Promise((resolve) => io.close(resolve));
  User.findById = originalUserFindById;
  User.findByIdAndUpdate = originalUserFindByIdAndUpdate;
}