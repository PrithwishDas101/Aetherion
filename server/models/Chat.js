import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    pairKey: {
      type: String,
      select: false,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Message",

      default: null,
    },

    unreadMessageCount: {
      type: Map,

      of: Number,

      default: () => new Map(),
    },
  },
  {
    timestamps: true,
  },
);

chatSchema.index({ members: 1, updatedAt: -1, _id: -1 });
chatSchema.index(
  { pairKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      pairKey: { $type: "string" },
    },
  },
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
