import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Only one pending request in the same direction.
contactRequestSchema.index(
  {
    requester: 1,
    recipient: 1,
  },
  {
    unique: true,
  },
);

// Fast incoming-request queries.
contactRequestSchema.index({
  recipient: 1,
  createdAt: -1,
});

// Fast outgoing-request queries.
contactRequestSchema.index({
  requester: 1,
  createdAt: -1,
});

const ContactRequest = mongoose.model("ContactRequest", contactRequestSchema);

export default ContactRequest;
