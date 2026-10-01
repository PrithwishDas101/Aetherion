import assert from "node:assert/strict";
import { createServer } from "node:http";
import express from "express";
import jwt from "jsonwebtoken";

import {
  messageUpload,
  profilePictureUpload,
  singleUpload,
  signupUpload,
  validateMessageUpload,
  validateProfileImageUpload,
} from "../../middleware/uploadMiddleware.js";
import User from "../../models/User.js";
import { protectRoute } from "../../middleware/authMiddleware.js";
import {
  jpegFixture,
  mp4VideoFixture,
  oggAudioFixture,
  pdfFixture,
  pngFixture,
  webpFixture,
  zipFixture,
} from "./sec12-upload-fixtures.mjs";

const secret = "sec12-upload-validation-smoke-secret";
const userId = "000000000000000000000012";
const originalJwtSecret = process.env.JWT_SECRET;
const originalUserFindById = User.findById;
const app = express();

const accepted = (_req, res) => res.status(201).json({ accepted: true });

app.post(
  "/signup",
  singleUpload(signupUpload, "profilePic"),
  validateProfileImageUpload,
  accepted,
);
app.post(
  "/profile-picture",
  protectRoute,
  singleUpload(profilePictureUpload, "profilePic"),
  validateProfileImageUpload,
  accepted,
);
app.post(
  "/message",
  protectRoute,
  singleUpload(messageUpload, "media"),
  validateMessageUpload,
  accepted,
);

const server = createServer(app);

const createForm = ({ field, bytes, mime, filename, type, extraField } = {}) => {
  const form = new FormData();
  form.append(field, new Blob([bytes], { type: mime }), filename);

  if (type) {
    form.append("type", type);
  }

  if (extraField) {
    form.append("unexpected", "field");
  }

  return form;
};

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

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const token = jwt.sign({ userId, authVersion: 0 }, secret);

  const send = async (path, form, { authenticated = true } = {}) => {
    const headers = {};
    if (authenticated) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers,
      body: form,
    });
  };

  for (const [path, form] of [
    ["/profile-picture", createForm({
      field: "profilePic",
      bytes: jpegFixture,
      mime: "image/jpeg",
      filename: "avatar.jpg",
    })],
    ["/message", createForm({
      field: "media",
      bytes: pngFixture,
      mime: "image/png",
      filename: "image.png",
      type: "image",
    })],
    ["/message", createForm({
      field: "media",
      bytes: webpFixture,
      mime: "image/webp",
      filename: "image.webp",
      type: "image",
    })],
    ["/message", createForm({
      field: "media",
      bytes: mp4VideoFixture,
      mime: "video/mp4",
      filename: "clip.mp4",
      type: "video",
    })],
    ["/message", createForm({
      field: "media",
      bytes: pdfFixture,
      mime: "application/pdf",
      filename: "document.pdf",
      type: "document",
    })],
    ["/message", createForm({
      field: "media",
      bytes: zipFixture,
      mime: "application/x-zip-compressed",
      filename: "archive.zip",
      type: "document",
    })],
  ]) {
    const response = await send(path, form);
    assert.equal(response.status, 201, `${path} valid signature`);
    assert.deepEqual(await response.json(), { accepted: true });
  }
  console.log("accepted signatures: profile JPEG, message PNG/WebP, MP4 video, and PDF document");

  const spoofedForms = [
    createForm({
      field: "media",
      bytes: jpegFixture,
      mime: "image/png",
      filename: "spoof.png",
      type: "image",
    }),
    createForm({
      field: "media",
      bytes: jpegFixture,
      mime: "image/jpeg",
      filename: "spoof.png",
      type: "image",
    }),
    createForm({
      field: "media",
      bytes: pngFixture,
      mime: "image/jpeg",
      filename: "spoof.jpg",
      type: "image",
    }),
    createForm({
      field: "media",
      bytes: mp4VideoFixture,
      mime: "image/jpeg",
      filename: "spoof.jpg",
      type: "image",
    }),
    createForm({
      field: "media",
      bytes: pdfFixture,
      mime: "image/jpeg",
      filename: "spoof.jpg",
      type: "image",
    }),
    createForm({
      field: "media",
      bytes: oggAudioFixture,
      mime: "video/ogg",
      filename: "audio.ogg",
      type: "video",
    }),
    createForm({
      field: "media",
      bytes: jpegFixture,
      mime: "image/jpeg",
      filename: "image.jpg",
      type: "video",
    }),
    createForm({
      field: "media",
      bytes: Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8]),
      mime: "image/png",
      filename: "random.png",
      type: "image",
    }),
    createForm({
      field: "profilePic",
      bytes: pdfFixture,
      mime: "application/pdf",
      filename: "document.pdf",
    }),
  ];

  for (const form of spoofedForms) {
    const response = await send(
      form.get("profilePic") ? "/profile-picture" : "/message",
      form,
    );
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.message, "Unsupported or invalid file type.");
    assert.equal(JSON.stringify(body).includes("spoof"), false);
  }
  console.log("spoofing: MIME/extension mismatches, binary masquerading as image, and random bytes rejected");

  const unauthenticated = await send(
    "/profile-picture",
    createForm({
      field: "profilePic",
      bytes: jpegFixture,
      mime: "image/jpeg",
      filename: "avatar.jpg",
    }),
    { authenticated: false },
  );
  assert.equal(unauthenticated.status, 401);

  const extraField = await send(
    "/profile-picture",
    createForm({
      field: "profilePic",
      bytes: pngFixture,
      mime: "image/png",
      filename: "avatar.png",
      extraField: true,
    }),
  );
  assert.equal(extraField.status, 400);

  const oversized = await send(
    "/message",
    createForm({
      field: "media",
      bytes: Buffer.alloc(50 * 1024 * 1024 + 1),
      mime: "application/pdf",
      filename: "oversized.pdf",
      type: "document",
    }),
  );
  assert.equal(oversized.status, 400);
  assert.deepEqual(await oversized.json(), {
    success: false,
    message: "Upload rejected.",
  });
  console.log("existing protections: unauthenticated requests, extra fields, and oversize files rejected");

  console.log("SEC-12 upload validation smoke checks passed");
} finally {
  User.findById = originalUserFindById;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}