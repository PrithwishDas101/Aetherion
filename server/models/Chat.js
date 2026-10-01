import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
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

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
