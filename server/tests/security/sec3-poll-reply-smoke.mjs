import assert from "node:assert/strict";

import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";
import Poll from "../../models/Poll.js";
import { createPoll } from "../../controllers/pollController.js";

const ids = {
  sender: "000000000000000000000001",
  receiver: "000000000000000000000002",
  chatA: "00000000000000000000000a",
  chatB: "00000000000000000000000b",
  sameChatMessage: "000000000000000000000011",
  otherChatMessage: "000000000000000000000022",
  missingMessage: "000000000000000000000033",
};

const originals = {
  chatFindOne: Chat.findOne,
  chatFindByIdAndUpdate: Chat.findByIdAndUpdate,
  messageFindOne: Message.findOne,
  messageCreate: Message.create,
  pollCreate: Poll.create,
};

const runCreatePoll = async (replyTo, { omitReplyTo = false, foundMessage = null } = {}) => {
  let messageCreateCalls = 0;
  let pollCreateCalls = 0;
  let messageLookup = null;
  let messagePayload = null;

  const chat = {
    _id: ids.chatA,
    members: [ids.sender, ids.receiver],
  };

  Chat.findOne = async (query) => {
    assert.equal(String(query._id), ids.chatA);
    assert.equal(String(query.members), ids.sender);
    return chat;
  };

  Message.findOne = async (query) => {
    messageLookup = query;
    return foundMessage;
  };

  Message.create = async (payload) => {
    messageCreateCalls += 1;
    messagePayload = payload;
    return {
      ...payload,
      _id: "000000000000000000000044",
      async save() {},
      async populate() {
        return this;
      },
    };
  };

  Poll.create = async (payload) => {
    pollCreateCalls += 1;
    return { ...payload, _id: "000000000000000000000055" };
  };

  Chat.findByIdAndUpdate = () => ({
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve({ ...chat, members: chat.members }).then(resolve, reject);
    },
  });

  const req = {
    body: {
      chatId: ids.chatA,
      question: "A question?",
      options: ["Yes", "No"],
      ...(omitReplyTo ? {} : { replyTo }),
    },
    user: { userId: ids.sender },
  };

  const res = {
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
  };

  await createPoll(req, res);

  return { ...res, messageCreateCalls, pollCreateCalls, messageLookup, messagePayload };
};

try {
  for (const [label, replyTo, options, expectedReplyTo] of [
    ["omitted reply", undefined, { omitReplyTo: true }, null],
    ["null reply", null, {}, null],
    ["empty reply", "", {}, null],
  ]) {
    const result = await runCreatePoll(replyTo, options);
    assert.equal(result.statusCode, 201, label);
    assert.equal(result.messagePayload.replyTo, expectedReplyTo, label);
    assert.equal(result.messageCreateCalls, 1, label);
    assert.equal(result.pollCreateCalls, 1, label);
    assert.equal(result.messageLookup, null, label);
    console.log(`${label}: accepted`);
  }

  const sameChat = await runCreatePoll(ids.sameChatMessage, {
    foundMessage: { _id: ids.sameChatMessage, chatId: ids.chatA },
  });
  assert.equal(sameChat.statusCode, 201, "same-chat reply");
  assert.equal(String(sameChat.messageLookup.chatId), ids.chatA);
  assert.equal(sameChat.messageCreateCalls, 1);
  assert.equal(sameChat.pollCreateCalls, 1);
  console.log("same-chat reply: accepted with chat-scoped lookup");

  for (const [label, replyTo] of [
    ["malformed reply", "not-an-object-id"],
    ["cross-chat reply", ids.otherChatMessage],
    ["nonexistent reply", ids.missingMessage],
  ]) {
    const result = await runCreatePoll(replyTo);
    assert.equal(result.statusCode, 400, label);
    assert.equal(result.messageCreateCalls, 0, label);
    assert.equal(result.pollCreateCalls, 0, label);
    if (label === "malformed reply") {
      assert.equal(result.messageLookup, null, label);
      assert.equal(result.body.message, "Invalid reply message ID.");
    } else {
      assert.equal(String(result.messageLookup.chatId), ids.chatA, label);
      assert.equal(result.body.message, "Reply message not found in this chat.");
    }
    console.log(`${label}: rejected before persistence`);
  }
} finally {
  Chat.findOne = originals.chatFindOne;
  Chat.findByIdAndUpdate = originals.chatFindByIdAndUpdate;
  Message.findOne = originals.messageFindOne;
  Message.create = originals.messageCreate;
  Poll.create = originals.pollCreate;
}
