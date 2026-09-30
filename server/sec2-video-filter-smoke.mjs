import { createServer } from "node:http";
import { messageUpload } from "./middleware/uploadMiddleware.js";

const server = createServer((request, response) => {
  messageUpload.single("media")(request, response, (error) => {
    response.writeHead(error ? 400 : 200, {
      "content-type": "application/json",
    });
    response.end(JSON.stringify({
      code: error?.code || null,
      message: error?.message || null,
      mime: request.file?.mimetype || null,
      filename: request.file?.originalname || null,
    }));
  });
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

try {
  const form = new FormData();
  form.append("chatId", "chat1");
  form.append("type", "video");
  form.append("text", "doodle");
  form.append("replyTo", "");
  const exportedBlob = new Blob(["video"], {
    type: "video/webm;codecs=vp8,opus",
  });
  const uploadBlob = new Blob([exportedBlob], {
    type: exportedBlob.type.split(";")[0],
  });
  form.append(
    "media",
    uploadBlob,
    "processed.webm",
  );

  const response = await fetch(`http://127.0.0.1:${server.address().port}`, {
    method: "POST",
    body: form,
  });
  console.log(response.status, await response.text());
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
