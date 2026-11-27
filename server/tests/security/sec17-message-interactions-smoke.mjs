import assert from "node:assert/strict";
import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";
import { editMessage, deleteMessage, reactToMessage } from "../../controllers/messageController.js";

const ids = {
  sender: "000000000000000000000001",
  recipient: "000000000000000000000002",
  outsider: "000000000000000000000003",
  chat: "00000000000000000000000a",
  message: "000000000000000000000011",
};
const originals = { findById: Message.findById, findOne: Message.findOne, chatFindOne: Chat.findOne };
const response = () => ({
  statusCode: null, body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const makeMessage = () => ({
  _id: ids.message, chatId: ids.chat, sender: ids.sender, type: "text",
  text: "before", editedAt: null, deletedFor: [], deletedForEveryone: false, reactions: [],
  async save() {},
  async populate() { return this; },
});
let message = makeMessage();
Chat.findOne = async (query) => (
  String(query._id) === ids.chat &&
  [ids.sender, ids.recipient].includes(String(query.members))
    ? { _id: ids.chat }
    : null
);
Message.findOne = async (query) => String(query._id) === ids.message &&
  String(query.sender) === ids.sender && !message.deletedForEveryone ? message : null;
Message.findById = async (id) => String(id) === ids.message ? message : null;

try {
  const invalidId = response();
  await editMessage({ params: { messageId: "bad" }, body: { text: "new" }, user: { userId: ids.sender } }, invalidId);
  assert.equal(invalidId.statusCode, 400);

  const edited = response();
  await editMessage({ params: { messageId: ids.message }, body: { text: "  after  " }, user: { userId: ids.sender } }, edited);
  assert.equal(edited.statusCode, 200);
  assert.equal(message.text, "after");
  assert.ok(message.editedAt instanceof Date);

  const nonOwner = response();
  await editMessage({ params: { messageId: ids.message }, body: { text: "forged" }, user: { userId: ids.recipient } }, nonOwner);
  assert.equal(nonOwner.statusCode, 404);

  const blankEdit = response();
  await editMessage({ params: { messageId: ids.message }, body: { text: "   " }, user: { userId: ids.sender } }, blankEdit);
  assert.equal(blankEdit.statusCode, 400);

  const outsiderDelete = response();
  await deleteMessage({ params: { messageId: ids.message }, body: { scope: "me" }, user: { userId: ids.outsider } }, outsiderDelete);
  assert.equal(outsiderDelete.statusCode, 404);

  const invalidScope = response();
  await deleteMessage({ params: { messageId: ids.message }, body: { scope: "all" }, user: { userId: ids.sender } }, invalidScope);
  assert.equal(invalidScope.statusCode, 400);

  const deleteMe = response();
  await deleteMessage({ params: { messageId: ids.message }, body: { scope: "me" }, user: { userId: ids.recipient } }, deleteMe);
  assert.equal(deleteMe.statusCode, 200);
  assert.ok(message.deletedFor.some((id) => String(id) === ids.recipient));

  const forbiddenGlobalDelete = response();
  await deleteMessage({ params: { messageId: ids.message }, body: { scope: "everyone" }, user: { userId: ids.recipient } }, forbiddenGlobalDelete);
  assert.equal(forbiddenGlobalDelete.statusCode, 403);

  message = makeMessage();
  const reaction = response();
  await reactToMessage({ params: { messageId: ids.message }, body: { emoji: "🔥" }, user: { userId: ids.recipient } }, reaction);
  assert.equal(reaction.statusCode, 200);
  assert.equal(message.reactions[0].emoji, "🔥");

  const removeReaction = response();
  await reactToMessage({ params: { messageId: ids.message }, body: { emoji: "🔥" }, user: { userId: ids.recipient } }, removeReaction);
  assert.equal(removeReaction.statusCode, 200);
  assert.equal(message.reactions.length, 0);

  const invalidReaction = response();
  await reactToMessage({ params: { messageId: ids.message }, body: { emoji: "💣" }, user: { userId: ids.recipient } }, invalidReaction);
  assert.equal(invalidReaction.statusCode, 400);

  message = makeMessage();
  const deleteEveryone = response();
  await deleteMessage({ params: { messageId: ids.message }, body: { scope: "everyone" }, user: { userId: ids.sender } }, deleteEveryone);
  assert.equal(deleteEveryone.statusCode, 200);
  assert.equal(message.deletedForEveryone, true);
  assert.equal(message.text, "");
  console.log("message interactions smoke: edit ownership, deletion scopes, reactions and validation passed");
} finally {
  Message.findById = originals.findById;
  Message.findOne = originals.findOne;
  Chat.findOne = originals.chatFindOne;
}
