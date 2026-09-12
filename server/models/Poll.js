import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    _id: true,
  },
);

const pollSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
      index: true,
    },

    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    options: {
      type: [pollOptionSchema],
      required: true,
      validate: {
        validator: (options) =>
          Array.isArray(options) && options.length >= 2 && options.length <= 10,

        message: "A poll must have between 2 and 10 options.",
      },
    },

    allowMultipleAnswers: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
