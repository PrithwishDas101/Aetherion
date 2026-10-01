import { createServer } from "node:http";
import {
  messageUpload,
  profileBannerUpload,
  profilePictureUpload,
  signupUpload,
} from "./middleware/uploadMiddleware.js";

const uploadMiddleware = new Map([
  ["/signup", signupUpload.single("profilePic")],
  ["/profile-picture", profilePictureUpload.single("profilePic")],
  ["/profile-banner", profileBannerUpload.single("profileBanner")],
  ["/send-message", messageUpload.single("media")],
]);

const server = createServer((request, response) => {
  const middleware = uploadMiddleware.get(request.url);

  if (!middleware) {
    response.writeHead(404).end();
    return;
  }

  middleware(request, response, (error) => {
    response.writeHead(error ? 400 : 200);
    response.end(error?.code || error?.message || "accepted");
  });
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
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
  signup.append("profilePic", new Blob(["x"], { type: "image/webp" }), "profile.webp");
  await check("/signup", signup, 200);

  const profilePicture = new FormData();
  profilePicture.append("profilePic", new Blob(["x"], { type: "image/png" }), "profile.png");
  await check("/profile-picture", profilePicture, 200);

  const profileBanner = new FormData();
  profileBanner.append("profileBanner", new Blob(["x"], { type: "image/jpeg" }), "banner.jpg");
  await check("/profile-banner", profileBanner, 200);

  const message = new FormData();
  message.append("chatId", "chat");
  message.append("type", "document");
  message.append("text", "attachment");
  message.append("replyTo", "");
  message.append("media", new Blob(["x"], { type: "application/pdf" }), "file.pdf");
  await check("/send-message", message, 200);

  const mismatchedMime = new FormData();
  mismatchedMime.append("profilePic", new Blob(["x"], { type: "image/jpeg" }), "profile.png");
  await check("/profile-picture", mismatchedMime, 400);

  const extraProfileField = new FormData();
  extraProfileField.append("profilePic", new Blob(["x"], { type: "image/png" }), "profile.png");
  extraProfileField.append("unexpected", "extra");
  await check("/profile-picture", extraProfileField, 400);
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
