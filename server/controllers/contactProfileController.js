import mongoose from "mongoose";

import User from "../models/User.js";
import Contact from "../models/Contact.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import { isOnline } from "../socket/presenceStore.js";

const PUBLIC_PROFILE_PROJECTION = [
  "_id",
  "firstName",
  "lastName",
  "email",
  "pronouns",
  "bio",
  "profilePic",
  "profileBanner",
  "avatarDecoration",
  "publicPresenceStatus",
  "customStatus",
  "lastSeen",
  "connections",
  "createdAt",
].join(" ");

const CONTACT_PROJECTION = [
  "_id",
  "firstName",
  "lastName",
  "profilePic",
  "avatarDecoration",
  "publicPresenceStatus",
  "lastSeen",
].join(" ");

const MEDIA_TYPES = ["image", "video", "gif", "document"];

const MEDIA_PROJECTION = [
  "_id",
  "sender",
  "type",
  "text",
  "mediaUrl",
  "document",
  "createdAt",
].join(" ");

// GET CONTACT PROFILE
export const getContactProfile = async (req, res) => {
  try {
    const viewerId = String(req.user.userId);
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (viewerId === String(userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot open your own profile as a contact profile.",
      });
    }

    const targetUserId = new mongoose.Types.ObjectId(userId);
    const viewerObjectId = new mongoose.Types.ObjectId(viewerId);

    // PROFILE
    const profile = await User.findById(targetUserId)
      .select(PUBLIC_PROFILE_PROJECTION)
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // PRESENCE
    const currentlyOnline = isOnline(targetUserId);

    const effectivePresenceStatus =
      profile.publicPresenceStatus === "automatic"
        ? currentlyOnline
          ? "online"
          : "off_planet"
        : profile.publicPresenceStatus;

    const publicProfile = {
      ...profile,
      effectivePresenceStatus,
    };

    // CONTACT RELATIONSHIP
    const contactRelationship = await Contact.exists({
      owner: viewerObjectId,
      contact: targetUserId,
    });

    const isContact = Boolean(contactRelationship);

    // VIEWED USER'S CONTACTS
    const contactDocuments = await Contact.find({
      owner: targetUserId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate({
        path: "contact",
        select: CONTACT_PROJECTION,
      })
      .lean();

    const contacts = contactDocuments
      .filter((item) => item.contact)
      .map((item) => ({
        ...item.contact,
        addedAt: item.createdAt,
      }));

    // ONE-TO-ONE CHAT
    const chat = await Chat.findOne({
      members: {
        $all: [viewerObjectId, targetUserId],
      },
      $expr: {
        $eq: [
          {
            $size: "$members",
          },
          2,
        ],
      },
    })
      .select("_id")
      .lean();

    // LATEST 20 MEDIA / DOCUMENT MESSAGES
    let media = [];

    if (chat?._id) {
      media = await Message.find({
        chatId: chat._id,
        type: {
          $in: MEDIA_TYPES,
        },
      })
        .select(MEDIA_PROJECTION)
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();
    }

    return res.status(200).json({
      success: true,
      message: "Contact profile fetched successfully.",
      data: {
        profile: publicProfile,
        isContact,
        contacts,
        media,
      },
    });
  } catch (error) {
    console.error("Get contact profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch contact profile.",
    });
  }
};
