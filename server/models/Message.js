import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "gif", "image", "video", "document", "poll"],
      default: "text",
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    mediaUrl: {
      type: String,
      trim: true,
      default: null,
    },

    document: {
      name: {
        type: String,
        trim: true,
        default: null,
      },

      mimeType: {
        type: String,
        trim: true,
        default: null,
      },

      size: {
        type: Number,
        default: null,
      },
    },

    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      default: null,
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
