import express from "express";
import {
  messageUpload,
  singleUpload,
  validateMessageUpload,
} from "./middleware/uploadMiddleware.js";
import { mp4VideoFixture } from "./sec12-upload-fixtures.mjs";

const app = express();
app.post(
  "/upload",
  singleUpload(messageUpload, "media"),
  validateMessageUpload,
  (_req, res) => res.status(200).json({ accepted: true }),
);
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));

try {
  const form = new FormData();
  form.append("chatId", "chat1");
  form.append("type", "video");
  form.append("text", "doodle");
  form.append("replyTo", "");
  form.append("media", new Blob([mp4VideoFixture], { type: "video/mp4" }), "processed.mp4");

  const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
    method: "POST",
    body: form,
  });
  if (response.status !== 200) {
    throw new Error(
      `Valid video signature was not accepted: ${response.status} ${await response.text()}`,
    );
  }

  console.log("Video upload signature smoke status:", response.status);
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
