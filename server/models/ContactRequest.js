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

    // Canonical unordered pair.
    // This prevents A -> B and B -> A from existing simultaneously.
    pairKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Only one pending request can exist for a user pair,
// regardless of which direction the request was sent.
contactRequestSchema.index(
  {
    pairKey: 1,
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
