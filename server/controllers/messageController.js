import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { uploadImage, uploadVideo } from "../services/cloudinaryService.js";

// SEND MESSAGES
export const sendMessage = async (req, res) => {
  try {
    const {
      chatId,
      text,
      type = "text",
      mediaUrl: incomingMediaUrl,
      replyTo,
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

    if (type === "gif" && !incomingMediaUrl) {
      return res.status(400).json({
        success: false,
        message: "GIF URL is required.",
      });
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

    const receiver = chat.members.find(
      (member) => String(member) !== senderId,
    );

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Message receiver not found.",
      });
    }

    /*
     * MEDIA UPLOAD
     *
     * Images -> Cloudinary image upload
     * Videos -> Cloudinary video upload
     * GIFs -> already supplied URL
     * Text -> no media
     */

    let finalMediaUrl = null;

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

    if (type === "gif") {
      finalMediaUrl = incomingMediaUrl;
    }

    console.log("💾 SAVING MESSAGE:", {
      chatId,
      senderId,
      type,
      mediaUrl: finalMediaUrl,
    });

    const savedMessage = await Message.create({
      chatId,
      sender: senderId,

      type,

      text: text?.trim() || "",

      mediaUrl: finalMediaUrl,

      replyTo: replyTo || null,

      read: false,
    });

    await savedMessage.populate({
      path: "replyTo",
      select: "text sender type mediaUrl",
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
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: savedMessage,
      chat: updatedChat,
    });
  } catch (error) {
    console.error("❌ Send message error:", error);

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
        select: "text sender type mediaUrl",
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
