import assert from "node:assert/strict";

import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";
import Poll from "../../models/Poll.js";
import { createPoll } from "../../controllers/pollController.js";

const ids = {
  sender: "000000000000000000000001",
  receiver: "000000000000000000000002",
  chat: "00000000000000000000000a",
};

const originals = {
  chatFindOne: Chat.findOne,
  chatFindByIdAndUpdate: Chat.findByIdAndUpdate,
  messageCreate: Message.create,
  pollCreate: Poll.create,
};

const runCreatePoll = async ({ question = "A question?", options = ["Yes", "No"] } = {}) => {
  let result;
  let messageCreateCalls = 0;
  let pollCreateCalls = 0;
  let savedMessage = null;
  let createdPoll = null;

  Chat.findOne = async (query) => {
    assert.equal(String(query._id), ids.chat);
    assert.equal(String(query.members), ids.sender);
    return {
      _id: ids.chat,
      members: [ids.sender, ids.receiver],
    };
  };

  Message.create = async (payload) => {
    messageCreateCalls += 1;
    savedMessage = {
      ...payload,
      _id: "000000000000000000000011",
      async save() {},
      async populate() {
        return this;
      },
    };
    return savedMessage;
  };

  Poll.create = async (payload) => {
    pollCreateCalls += 1;
    createdPoll = {
      ...payload,
      _id: "000000000000000000000022",
    };
    return createdPoll;
  };

  Chat.findByIdAndUpdate = () => ({
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve({
        _id: ids.chat,
        members: [ids.sender, ids.receiver],
      }).then(resolve, reject);
    },
  });

  const req = {
    body: { chatId: ids.chat, question, options },
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
  result = {
    statusCode: res.statusCode,
    body: res.body,
    messageCreateCalls,
    pollCreateCalls,
    savedMessage,
    createdPoll,
  };
  return result;
};

try {
  const valid = await runCreatePoll({
    question: "  Favorite color?  ",
    options: ["  Red  ", "Blue"],
  });
  assert.equal(valid.statusCode, 201);
  assert.equal(valid.messageCreateCalls, 1);
  assert.equal(valid.pollCreateCalls, 1);
  assert.equal(valid.savedMessage.text, "Favorite color?");
  assert.deepEqual(
    valid.createdPoll.options.map((option) => option.text),
    ["Red", "Blue"],
  );
  console.log("valid poll: accepted");

  const longQuestion = await runCreatePoll({
    question: "q".repeat(501),
  });
  assert.equal(longQuestion.statusCode, 400);
  assert.equal(longQuestion.messageCreateCalls, 0);
  assert.equal(longQuestion.pollCreateCalls, 0);
  console.log("question > 500: rejected before persistence");

  const tooManyOptions = await runCreatePoll({
    options: Array.from({ length: 11 }, (_, index) => `Option ${index + 1}`),
  });
  assert.equal(tooManyOptions.statusCode, 400);
  assert.equal(tooManyOptions.messageCreateCalls, 0);
  assert.equal(tooManyOptions.pollCreateCalls, 0);
  console.log("11 options: rejected before persistence");

  const longOption = await runCreatePoll({
    options: ["a".repeat(201), "Valid"],
  });
  assert.equal(longOption.statusCode, 400);
  assert.equal(longOption.messageCreateCalls, 0);
  assert.equal(longOption.pollCreateCalls, 0);
  console.log("option > 200: rejected before persistence");

  const invalidOptionTypes = await runCreatePoll({
    options: ["Valid", 123],
  });
  assert.equal(invalidOptionTypes.statusCode, 400);
  assert.equal(invalidOptionTypes.messageCreateCalls, 0);
  assert.equal(invalidOptionTypes.pollCreateCalls, 0);
  console.log("non-string option: rejected before persistence");

  const blankAfterTrim = await runCreatePoll({
    options: ["Valid", "   "],
  });
  assert.equal(blankAfterTrim.statusCode, 400);
  assert.equal(blankAfterTrim.messageCreateCalls, 0);
  assert.equal(blankAfterTrim.pollCreateCalls, 0);
  console.log("blank option after trim: rejected before persistence");
} finally {
  Chat.findOne = originals.chatFindOne;
  Chat.findByIdAndUpdate = originals.chatFindByIdAndUpdate;
  Message.create = originals.messageCreate;
  Poll.create = originals.pollCreate;
}
