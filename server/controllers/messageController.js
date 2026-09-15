import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import {
  uploadImage,
  uploadGif,
  uploadVideo,
  uploadDocument,
} from "../services/cloudinaryService.js";

// SEND MESSAGES
export const sendMessage = async (req, res) => {
  try {
    const {
      chatId,
      text,
      type = "text",
      mediaUrl: incomingMediaUrl,
      replyTo,
      location,
    } = req.body;

    const uploadedFile = req.file;

    console.log("📨 SEND MESSAGE REQUEST:", {
      chatId,
      type,
      text,
      hasFile: Boolean(uploadedFile),
      fileName: uploadedFile?.originalname,
      fileMimeType: uploadedFile?.mimetype,
      fileSize: uploadedFile?.size,
      location,
    });

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    if (type === "text" && !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    if (type === "gif" && !incomingMediaUrl && !uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "GIF file or GIF URL is required.",
      });
    }

    // LOCATION
    if (type === "location") {
      const latitude = Number(location?.latitude);
      const longitude = Number(location?.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res.status(400).json({
          success: false,
          message: "Valid location coordinates are required.",
        });
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Location coordinates are out of range.",
        });
      }
    }

    const senderId = String(req.user.userId);

    const chat = await Chat.findOne({
      _id: chatId,
      members: senderId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    const receiver = chat.members.find((member) => String(member) !== senderId);

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Message receiver not found.",
      });
    }

    let finalMediaUrl = null;

    // IMAGE
    if (type === "image") {
      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "Image file is required.",
        });
      }

      console.log("🖼️ UPLOADING IMAGE:", {
        size: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
      });

      const uploadResult = await uploadImage(
        uploadedFile.buffer,
        "aetherion/chat-images",
      );

      finalMediaUrl = uploadResult.secure_url;

      console.log("🖼️ IMAGE UPLOADED:", finalMediaUrl);
    }

    // GIF
    if (type === "gif") {
      if (uploadedFile) {
        console.log("🎞️ EDITED GIF REACHED CONTROLLER:", {
          size: uploadedFile.size,
          sizeInMB: (uploadedFile.size / 1024 / 1024).toFixed(2),
          mimetype: uploadedFile.mimetype,
        });

        const uploadResult = await uploadGif(
          uploadedFile.buffer,
          "aetherion/chat-gifs",
        );

        finalMediaUrl = uploadResult.secure_url;

        console.log("🎞️ GIF UPLOADED:", finalMediaUrl);
      } else if (incomingMediaUrl) {
        finalMediaUrl = incomingMediaUrl;
      } else {
        return res.status(400).json({
          success: false,
          message: "GIF file or GIF URL is required.",
        });
      }
    }

    // VIDEO
    if (type === "video") {
      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "Video file is required.",
        });
      }

      console.log("🎥 UPLOADING VIDEO:", {
        size: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
        originalName: uploadedFile.originalname,
      });

      const uploadResult = await uploadVideo(
        uploadedFile.buffer,
        "aetherion/chat-videos",
      );

      finalMediaUrl = uploadResult.secure_url;

      console.log("🎥 VIDEO UPLOADED:", finalMediaUrl);
    }

    // DOCUMENT
    if (type === "document") {
      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "Document file is required.",
        });
      }

      console.log("📄 UPLOADING DOCUMENT:", {
        size: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
        originalName: uploadedFile.originalname,
      });

      const uploadResult = await uploadDocument(
        uploadedFile.buffer,
        "aetherion/chat-documents",
      );

      finalMediaUrl = uploadResult.secure_url;

      console.log("📄 DOCUMENT UPLOADED:", finalMediaUrl);
    }

    console.log("💾 SAVING MESSAGE:", {
      chatId,
      senderId,
      type,
      mediaUrl: finalMediaUrl,
      location,
    });

    const savedMessage = await Message.create({
      chatId,
      sender: senderId,
      type,
      text: text?.trim() || "",
      mediaUrl: finalMediaUrl,

      document:
        type === "document" && uploadedFile
          ? {
              name: uploadedFile.originalname,
              mimeType: uploadedFile.mimetype,
              size: uploadedFile.size,
            }
          : undefined,

      location:
        type === "location"
          ? {
              latitude: Number(location.latitude),
              longitude: Number(location.longitude),
              address:
                typeof location.address === "string" && location.address.trim()
                  ? location.address.trim()
                  : null,
            }
          : undefined,

      replyTo: replyTo || null,
      read: false,
    });

    await savedMessage.populate({
      path: "replyTo",
      select: "text sender type mediaUrl document poll location",
    });

    const receiverId = String(receiver);

    const unreadField = `unreadMessageCount.${receiverId}`;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $set: {
          lastMessage: savedMessage._id,
        },

        $inc: {
          [unreadField]: 1,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
      .populate("members")
      .populate("lastMessage");

    console.log("✅ MESSAGE SAVED:", {
      messageId: savedMessage._id,
      type: savedMessage.type,
      mediaUrl: savedMessage.mediaUrl,
      location: savedMessage.location,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: savedMessage,
      chat: updatedChat,
    });
  } catch (error) {
    console.error(" Send message error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// GET ALL MESSAGES
export const getAllMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      members: req.user.userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    const messages = await Message.find({
      chatId,
    })
      .populate({
        path: "replyTo",
        select: "text sender type mediaUrl document poll location",
      })
      .populate({
        path: "poll",
      })
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully!",
      data: messages,
    });
  } catch (error) {
    console.error("Get all messages error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
