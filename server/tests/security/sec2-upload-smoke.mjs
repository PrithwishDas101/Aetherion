import express from "express";
import {
  messageUpload,
  profileBannerUpload,
  profilePictureUpload,
  singleUpload,
  signupUpload,
  validateMessageUpload,
  validateProfileImageUpload,
} from "../../middleware/uploadMiddleware.js";
import {
  jpegFixture,
  pdfFixture,
  pngFixture,
  webpFixture,
} from "./sec12-upload-fixtures.mjs";

const app = express();
const accepted = (_req, res) => res.status(200).send("accepted");
const rejected = (_error, _req, res, _next) =>
  res.status(400).json({ success: false, message: "Upload rejected." });

app.post(
  "/signup",
  singleUpload(signupUpload, "profilePic"),
  validateProfileImageUpload,
  accepted,
);
app.post(
  "/profile-picture",
  singleUpload(profilePictureUpload, "profilePic"),
  validateProfileImageUpload,
  accepted,
);
app.post(
  "/profile-banner",
  singleUpload(profileBannerUpload, "profileBanner"),
  validateProfileImageUpload,
  accepted,
);
app.post(
  "/send-message",
  singleUpload(messageUpload, "media"),
  validateMessageUpload,
  accepted,
);
app.use(rejected);

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));

const url = `http://127.0.0.1:${server.address().port}`;

const check = async (path, form, expectedStatus) => {
  const response = await fetch(`${url}${path}`, { method: "POST", body: form });

  if (response.status !== expectedStatus) {
    throw new Error(`${path}: expected ${expectedStatus}, got ${response.status}`);
  }

  console.log(`${path}: ${response.status}`);
};

try {
  const signup = new FormData();
  signup.append("firstName", "Aether");
  signup.append("lastName", "User");
  signup.append("email", "aether@example.test");
  signup.append("password", "password123");
  signup.append("profilePic", new Blob([webpFixture], { type: "image/webp" }), "profile.webp");
  await check("/signup", signup, 200);

  const profilePicture = new FormData();
  profilePicture.append("profilePic", new Blob([pngFixture], { type: "image/png" }), "profile.png");
  await check("/profile-picture", profilePicture, 200);

  const profileBanner = new FormData();
  profileBanner.append("profileBanner", new Blob([jpegFixture], { type: "image/jpeg" }), "banner.jpg");
  await check("/profile-banner", profileBanner, 200);

  const message = new FormData();
  message.append("chatId", "chat");
  message.append("type", "document");
  message.append("text", "attachment");
  message.append("replyTo", "");
  message.append("media", new Blob([pdfFixture], { type: "application/pdf" }), "file.pdf");
  await check("/send-message", message, 200);

  const mismatchedMime = new FormData();
  mismatchedMime.append("profilePic", new Blob([jpegFixture], { type: "image/jpeg" }), "profile.png");
  await check("/profile-picture", mismatchedMime, 400);

  const extraProfileField = new FormData();
  extraProfileField.append("profilePic", new Blob([pngFixture], { type: "image/png" }), "profile.png");
  extraProfileField.append("unexpected", "extra");
  await check("/profile-picture", extraProfileField, 400);
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
