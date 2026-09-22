import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // PROFILE PICTURE
    profilePic: {
      type: String,
      default: null,
    },

    profilePicPublicId: {
      type: String,
      default: null,
    },

    avatarDecoration: {
      type: String,
      enum: [
        "none",
        "aether-orbit",
        "initial",
        "moonlit"
      ],
      default: "none",
    },

    // PROFILE BANNER
    profileBanner: {
      type: String,
      default: null,
    },

    profileBannerPublicId: {
      type: String,
      default: null,
    },

    // PERSONAL PROFILE
    pronouns: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50, "Pronouns cannot exceed 50 characters"],
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [250, "Bio cannot exceed 250 characters"],
    },

    customStatus: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Custom status cannot exceed 100 characters"],
    },

    connections: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
          },
          url: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2048,
          },
        },
      ],
      default: [],
      validate: {
        validator: (connections) => connections.length <= 20,
        message: "You can have a maximum of 20 connections.",
      },
    },

    publicPresenceStatus: {
      type: String,
      enum: ["automatic", "online", "off_planet", "idle", "dnd"],
      default: "automatic",
    },

    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
