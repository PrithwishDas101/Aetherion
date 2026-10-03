import User from "../models/User.js";
import Contact from "../models/Contact.js";
import ContactRequest from "../models/ContactRequest.js";
import {
  uploadImage,
  deleteImage,
  uploadProfileBanner,
} from "../services/cloudinaryService.js";
import { emitPublicPresenceUpdated } from "../socket/profileEvents.js";
import { logSafeError } from "../utils/safeLogging.js";
import { MAX_USERS_PER_LIST } from "../utils/queryLimits.js";

// GET LOGGED-IN USER
export const getLoggedUser = async (req, res) => {
  try {
    // req.user.userId comes from protectRoute
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    logSafeError("Get logged user", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL USERS EXCEPT LOGGED-IN USER
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const users = await User.find({
      _id: {
        $ne: currentUserId,
      },
    })
      .sort({ _id: -1 })
      .limit(MAX_USERS_PER_LIST)
      .select(
        "_id firstName lastName profilePic avatarDecoration publicPresenceStatus lastSeen",
      );

    const userIds = users.map((user) => user._id);

    const [contacts, contactRequests] = await Promise.all([
      Contact.find({
        owner: currentUserId,
        contact: {
          $in: userIds,
        },
      })
        .select("contact")
        .lean(),
      ContactRequest.find({
        $or: [
          {
            requester: currentUserId,
            recipient: {
              $in: userIds,
            },
          },
          {
            recipient: currentUserId,
            requester: {
              $in: userIds,
            },
          },
        ],
      })
        .select("requester recipient")
        .lean(),
    ]);

    const contactIds = new Set(
      contacts.map((relationship) => String(relationship.contact)),
    );
    const outgoingPendingIds = new Set();
    const incomingPendingIds = new Set();

    for (const request of contactRequests) {
      const requesterId = String(request.requester);
      const recipientId = String(request.recipient);

      if (requesterId === currentUserId) {
        outgoingPendingIds.add(recipientId);
      } else if (recipientId === currentUserId) {
        incomingPendingIds.add(requesterId);
      }
    }

    const usersWithRelationshipStatus = users.map((user) => {
      const userObject = user.toObject();
      const userId = String(user._id);

      const relationshipStatus = contactIds.has(userId)
        ? "contact"
        : outgoingPendingIds.has(userId)
          ? "outgoing_pending"
          : incomingPendingIds.has(userId)
            ? "incoming_pending"
            : "none";

      return {
        ...userObject,
        relationshipStatus,
      };
    });

    return res.status(200).json({
      success: true,
      users: usersWithRelationshipStatus,
    });
  } catch (error) {
    logSafeError("Get all users", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE PROFILE PICTURE
export const updateProfilePicture = async (req, res) => {
  let newProfilePicPublicId = "";

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Keeping the old image until the new image has been successfully saved to MongoDB.
    const oldPublicId = user.profilePicPublicId;

    // Upload new image
    console.time("Cloudinary profile upload");

    const uploadResult = await uploadImage(
      req.file.buffer,
      "aetherion/profile-pictures",
    );

    console.timeEnd("Cloudinary profile upload");

    newProfilePicPublicId = uploadResult.public_id;

    // Update user with new image
    user.profilePic = uploadResult.secure_url;
    user.profilePicPublicId = uploadResult.public_id;

    console.time("MongoDB profile save");

    await user.save();

    console.timeEnd("MongoDB profile save");

    // MongoDB succeeded.
    // NOW it is safe to delete the old image.
    if (oldPublicId) {
      try {
        console.time("Old Cloudinary image delete");

        await deleteImage(oldPublicId);

        console.timeEnd("Old Cloudinary image delete");
      } catch (deleteError) {
        logSafeError("Old profile picture deletion", deleteError);
      }
    }

    // New image is now safely stored in MongoDB,
    // so don't delete it in the catch block.
    newProfilePicPublicId = "";

    const updatedUser = user.toObject();

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    logSafeError("Update profile picture", error);

    // If Cloudinary upload succeeded but
    // MongoDB save failed, remove the NEW image.
    if (newProfilePicPublicId) {
      try {
        await deleteImage(newProfilePicPublicId);

        console.log("New Cloudinary image cleanup completed.");
      } catch (cleanupError) {
        logSafeError("New profile picture cleanup", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile picture.",
    });
  }
};

// REMOVE PROFILE PICTURE
export const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Nothing to remove
    if (!user.profilePicPublicId) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to remove.",
      });
    }

    const oldPublicId = user.profilePicPublicId;

    // Clear the database reference first. If MongoDB fails, the Cloudinary
    // asset remains available and the existing profile picture keeps working.
    user.profilePic = "";
    user.profilePicPublicId = "";

    await user.save();

    // MongoDB succeeded. It is now safe to remove the old Cloudinary asset.
    // A failed Cloudinary deletion leaves an orphaned asset, not a broken DB URL.
    try {
      await deleteImage(oldPublicId);
    } catch (deleteError) {
      logSafeError("Profile picture deletion", deleteError);
    }

    const updatedUser = user.toObject();

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile picture removed successfully.",
      data: updatedUser,
    });
  } catch (error) {
    logSafeError("Remove profile picture", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove profile picture.",
    });
  }
};

// UPDATE PERSONAL PROFILE
export const updatePersonalProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const previousPublicPresenceStatus =
      user.publicPresenceStatus || "automatic";

    const {
      firstName,
      lastName,
      pronouns,
      bio,
      customStatus,
      publicPresenceStatus,
      avatarDecoration,
    } = req.body;

    // Update only fields that are actually provided.
    if (firstName !== undefined) {
      user.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      user.lastName = lastName.trim();
    }

    if (pronouns !== undefined) {
      user.pronouns = pronouns.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (customStatus !== undefined) {
      user.customStatus = customStatus.trim();
    }

    if (publicPresenceStatus !== undefined) {
      const allowedPresenceStatuses = [
        "automatic",
        "online",
        "off_planet",
        "idle",
        "dnd",
      ];

      if (!allowedPresenceStatuses.includes(publicPresenceStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid public presence status.",
        });
      }

      user.publicPresenceStatus = publicPresenceStatus;
    }

    if (avatarDecoration !== undefined) {
      const allowedDecorations = [
        "none",
        "aether-orbit",
        "initial",
        "moonlit"
      ];

      if (!allowedDecorations.includes(avatarDecoration)) {
        return res.status(400).json({
          success: false,
          message: "Invalid avatar decoration.",
        });
      }

      user.avatarDecoration = avatarDecoration;
    }

    await user.save();

    if (
      publicPresenceStatus !== undefined &&
      publicPresenceStatus !== previousPublicPresenceStatus
    ) {
      const io = req.app.get("io");

      emitPublicPresenceUpdated(io, user._id, user.publicPresenceStatus);
    }

    const updatedUser = user.toObject();

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    logSafeError("Update personal profile", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

// UPDATE PROFILE BANNER
export const updateProfileBanner = async (req, res) => {
  let newProfileBannerPublicId = "";

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile banner is required.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const oldPublicId = user.profileBannerPublicId;

    const uploadResult = await uploadProfileBanner(
      req.file.buffer,
      "aetherion/profile-banners",
    );

    newProfileBannerPublicId = uploadResult.public_id;

    user.profileBanner = uploadResult.secure_url;

    user.profileBannerPublicId = uploadResult.public_id;

    await user.save();

    // MongoDB succeeded. Now it is safe to delete the old banner.
    if (oldPublicId) {
      try {
        await deleteImage(oldPublicId);
      } catch (deleteError) {
        logSafeError("Old profile banner deletion", deleteError);
      }
    }

    newProfileBannerPublicId = "";

    const updatedUser = user.toObject();

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile banner updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    logSafeError("Update profile banner", error);

    // If Cloudinary succeeded but MongoDB failed,
    if (newProfileBannerPublicId) {
      try {
        await deleteImage(newProfileBannerPublicId);
      } catch (cleanupError) {
        logSafeError("New profile banner cleanup", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile banner.",
    });
  }
};

// UPDATE PROFILE CONNECTIONS
export const updateConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { connections } = req.body;

    if (!Array.isArray(connections)) {
      return res.status(400).json({
        success: false,
        message: "Connections must be an array.",
      });
    }

    if (connections.length > 20) {
      return res.status(400).json({
        success: false,
        message: "You can have a maximum of 20 connections.",
      });
    }

    const cleanedConnections = [];

    for (const connection of connections) {
      if (!connection || typeof connection.url !== "string") {
        return res.status(400).json({
          success: false,
          message: "Each connection must contain a valid URL.",
        });
      }

      const url = connection.url.trim();

      if (!url) {
        continue;
      }

      let parsedUrl;

      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({
          success: false,
          message: `Invalid connection URL: ${url}`,
        });
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).json({
          success: false,
          message: "Connections must use http or https URLs.",
        });
      }

      const name =
        typeof connection.name === "string" && connection.name.trim()
          ? connection.name.trim().slice(0, 50)
          : parsedUrl.hostname.replace(/^www\./, "").slice(0, 50);

      cleanedConnections.push({
        name,
        url: url.slice(0, 2048),
      });
    }

    user.connections = cleanedConnections;

    await user.save();

    const updatedUser = user.toObject();

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: "Connections updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    logSafeError("Update connections", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update connections.",
    });
  }
};
