import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiSmile } from "react-icons/fi";
import { MdKeyboard } from "react-icons/md";
import { FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

import {
  createMessage,
  createMediaMessage,
  getAllMessages,
} from "../apiCalls/messageApi.js";
import {
  createPoll,
  voteOnPoll,
} from "../apiCalls/pollApi.js";
import { clearUnreadMessage } from "../apiCalls/chatApi.js";
import { showLoader, hideLoader } from "../redux/sliceLoader.js";
import { setAllChats, setSelectedChat } from "../redux/userSlice.js";

import {
  formatDateLabel,
  shouldShowDateSeparator,
  formatLastSeen,
} from "../utils/messageDate.js";

import MessageBubble from "./MessageBubble.jsx";
import DateSeparator from "./DateSeparator.jsx";
import ReplyPreview from "./ReplyPreview.jsx";
import MessageMediaPicker from "./MessageMediaPicker.jsx";
import MessageComposer from "./MessageComposer/MessageComposer.jsx";
import CameraModal from "./Camera/CameraModal.jsx";
import NewMessageDivider from "./NewMessageDivider.jsx";
import MediaViewer from "./Camera/MediaViewer.jsx";
import GalleryModal from "./Gallery/GalleryModal.jsx";
import DocumentModal from "./Documents/DocumentModal.jsx";
import PollModal from "./Poll/PollModal.jsx";

import {
  sendMessage as emitSendMessage,
  sendTyping,
  sendStopTyping,
} from "../sockets/socketEmitters.js";

import registerSocketListeners from "../sockets/socketListeners.js";

const Chat = ({ socket }) => {
  const dispatch = useDispatch();

  const { selectedChat, user, allChats, typingChats, presence } = useSelector(
    (state) => state.userReducer,
  );

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [mediaViewerMessageId, setMediaViewerMessageId] = useState(null);

  // NEW MESSAGE DIVIDER
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [firstNewMessageId, setFirstNewMessageId] = useState(null);
  const [dividerVisible, setDividerVisible] = useState(false);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const messageInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const typingTimeout = useRef(null);
  const highlightTimeoutRef = useRef(null);

  const messageRefs = useRef({});

  // SCROLL STATE
  const hasInitialScrolledRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const previousMessageCountRef = useRef(0);

  const newMessageCountRef = useRef(0);
  const dividerVisibleRef = useRef(false);

  // Capture the unread count BEFORE it gets cleared in Redux.
  const initialUnreadCountRef = useRef(0);

  // Prevent duplicate read requests while scrolling.
  const isClearingUnreadRef = useRef(false);

  const isTyping =
    !!selectedChat?._id &&
    !!typingChats[selectedChat._id] &&
    String(typingChats[selectedChat._id]) !== String(user._id);

  const selectedUser = selectedChat?.members?.find(
    (member) => String(member._id) !== String(user._id),
  );

  const selectedUserPresence = selectedUser?._id
    ? presence[String(selectedUser._id)]
    : null;

  const isSelectedUserOnline = !!selectedUserPresence?.online;

  const selectedUserLastSeen = selectedUser?._id
    ? presence[String(selectedUser._id)]?.lastSeen
    : null;

  const unreadMessageCount =
    Number(selectedChat?.unreadMessageCount?.[String(user._id)]) || 0;

  // SCROLL HELPERS
  const scrollToBottom = (behavior = "auto") => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  const setNewMessagesState = (count, firstMessageId = null) => {
    newMessageCountRef.current = count;

    setNewMessageCount(count);
    setFirstNewMessageId(firstMessageId);
  };

  // CLEAR UNREAD MESSAGES
  const clearUnreadMessages = async () => {
    if (!selectedChat?._id || isClearingUnreadRef.current) {
      return;
    }

    isClearingUnreadRef.current = true;

    try {
      const response = await clearUnreadMessage(selectedChat._id);

      if (!response?.success) {
        console.error(response?.message || "Unable to clear unread messages.");
        return;
      }

      if (response?.data) {
        updateChatWithoutReordering(response.data);
      }
    } catch (error) {
      console.error("Clear unread messages error:", error);
    } finally {
      isClearingUnreadRef.current = false;
    }
  };

  const leaveChat = async () => {
    const chatId = selectedChat?._id;

    if (!chatId) {
      dispatch(setSelectedChat(null));
      return;
    }

    try {
      const response = await clearUnreadMessage(chatId);

      console.log("🔥 LEAVE CLEAR RESPONSE:", {
        success: response?.success,
        unread: response?.data?.unreadMessageCount,
      });

      if (response?.success && response?.data) {
        updateChatWithoutReordering(response.data);
      }
    } catch (error) {
      console.error("Leave chat unread clear error:", error);
    } finally {
      dividerVisibleRef.current = false;
      setDividerVisible(false);

      newMessageCountRef.current = 0;
      setNewMessageCount(0);
      setFirstNewMessageId(null);

      dispatch(setSelectedChat(null));
    }
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isNearBottom = distanceFromBottom <= 120;

    isNearBottomRef.current = isNearBottom;

    setShowScrollToBottom(!isNearBottom);
  };

  // CAMERA
  const openCamera = () => {
    setShowMediaPicker(false);
    setShowCameraModal(true);
  };

  const closeCamera = () => {
    setShowCameraModal(false);
  };

  // GALLERY
  const openGallery = () => {
    setShowMediaPicker(false);
    setShowCameraModal(false);
    setShowGalleryModal(true);
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
  };

  // DOCUMENT
  const openDocument = () => {
    setShowMediaPicker(false);
    setShowCameraModal(false);
    setShowGalleryModal(false);

    setShowDocumentModal(true);
  };

  const closeDocument = () => {
    setShowDocumentModal(false);
  };

  // SEND DOCUMENTS
  const handleSendDocuments = async (documentData) => {
    const items = documentData?.items || [];

    if (
      !items.length ||
      !selectedChat?._id ||
      isSending
    ) {
      return false;
    }

    isNearBottomRef.current = true;

    try {
      setIsSending(true);

      const uploadResults = await Promise.all(
        items.map(async (item) => {
          const file = item?.file;

          if (!file) {
            return null;
          }

          const localPreviewUrl =
            URL.createObjectURL(file);

          const temporaryMessageId =
            `temp-document-${Date.now()}-${item.id}`;

          const temporaryMessage = {
            _id: temporaryMessageId,
            chatId: selectedChat._id,
            sender: user._id,
            type: "document",
            text: documentData.caption?.trim() || "",
            mediaUrl: localPreviewUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            replyTo: replyingTo || null,
            read: false,
            createdAt: new Date().toISOString(),
            isUploading: true,
          };

          setAllMessages((previousMessages) => [
            ...previousMessages,
            temporaryMessage,
          ]);

          try {
            const formData = new FormData();

            formData.append(
              "chatId",
              selectedChat._id,
            );

            formData.append(
              "type",
              "document",
            );

            formData.append(
              "text",
              documentData.caption?.trim() || "",
            );

            formData.append(
              "media",
              file,
              file.name,
            );

            formData.append(
              "replyTo",
              replyingTo?._id || "",
            );

            const response =
              await createMediaMessage(formData);

            if (!response?.success) {
              throw new Error(
                response?.message ||
                "Unable to send document.",
              );
            }

            setAllMessages(
              (previousMessages) =>
                previousMessages.map(
                  (currentMessage) => {
                    if (
                      String(
                        currentMessage._id,
                      ) !==
                      String(
                        temporaryMessageId,
                      )
                    ) {
                      return currentMessage;
                    }

                    if (
                      currentMessage.mediaUrl?.startsWith(
                        "blob:",
                      )
                    ) {
                      URL.revokeObjectURL(
                        currentMessage.mediaUrl,
                      );
                    }

                    return response.data;
                  },
                ),
            );

            emitSendMessage(socket, {
              message: response.data,
              chat: response.chat,
              members:
                selectedChat.members.map(
                  (member) =>
                    String(member._id),
                ),
            });

            if (response?.chat) {
              updateChatInRedux(
                response.chat,
              );
            }

            return true;
          } catch (error) {
            console.error(
              "Document upload error:",
              error,
            );

            setAllMessages(
              (previousMessages) =>
                previousMessages.filter(
                  (currentMessage) => {
                    if (
                      String(
                        currentMessage._id,
                      ) !==
                      String(
                        temporaryMessageId,
                      )
                    ) {
                      return true;
                    }

                    if (
                      currentMessage.mediaUrl?.startsWith(
                        "blob:",
                      )
                    ) {
                      URL.revokeObjectURL(
                        currentMessage.mediaUrl,
                      );
                    }

                    return false;
                  },
                ),
            );

            throw error;
          }
        }),
      );

      const successfulUploads =
        uploadResults.filter(Boolean);

      if (!successfulUploads.length) {
        toast.error(
          "Unable to send document.",
        );

        return false;
      }

      setReplyingTo(null);

      setNewMessagesState(0, null);

      return true;
    } catch (error) {
      console.error(
        "Document sending error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send document.",
      );

      return false;
    } finally {
      setIsSending(false);
    }
  };

  // POLL
  // POLL
  const openPoll = () => {
    setShowMediaPicker(false);
    setShowCameraModal(false);
    setShowGalleryModal(false);
    setShowDocumentModal(false);

    setShowPollModal(true);
  };

  const closePoll = () => {
    setShowPollModal(false);
  };

  // CREATE POLL
  const handleCreatePoll = async (pollData) => {
    if (
      !selectedChat?._id ||
      !pollData?.question?.trim() ||
      !Array.isArray(pollData?.options) ||
      pollData.options.length < 2 ||
      isSending
    ) {
      return false;
    }

    const cleanedOptions = pollData.options
      .map((option) => option?.trim())
      .filter(Boolean);

    if (cleanedOptions.length < 2) {
      toast.error("A poll needs at least two options.");

      return false;
    }

    if (cleanedOptions.length > 10) {
      toast.error("A poll can have a maximum of 10 options.");

      return false;
    }

    isNearBottomRef.current = true;

    try {
      setIsSending(true);

      const response = await createPoll({
        chatId: selectedChat._id,
        question: pollData.question.trim(),
        options: cleanedOptions,
        allowMultipleAnswers:
          Boolean(pollData.allowMultipleAnswers),
        replyTo: replyingTo?._id || null,
      });

      if (!response?.success) {
        toast.error(
          response?.message ||
          "Unable to create poll.",
        );

        return false;
      }

      const createdMessage =
        response.data?.message || null;

      const createdPoll =
        response.data?.poll || null;

      const updatedChat =
        response.chat || response.data?.chat || null;

      if (!createdMessage) {
        console.error(
          "Poll created but no message was returned:",
          response,
        );

        toast.error(
          "Poll was created, but the message could not be loaded.",
        );

        return false;
      }

      const pollMessage = {
        ...createdMessage,
        type: "poll",

        poll:
          createdMessage.poll ||
          createdPoll ||
          createdMessage.pollData ||
          null,
      };

      setAllMessages(
        (previousMessages) => {
          const alreadyExists =
            previousMessages.some(
              (currentMessage) =>
                String(currentMessage._id) ===
                String(pollMessage._id),
            );

          if (alreadyExists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            pollMessage,
          ];
        },
      );

      emitSendMessage(socket, {
        message: pollMessage,
        chat: updatedChat,
        members:
          selectedChat.members.map(
            (member) =>
              String(member._id),
          ),
      });

      if (updatedChat) {
        updateChatInRedux(updatedChat);
      }

      setReplyingTo(null);

      setNewMessagesState(0, null);

      return true;
    } catch (error) {
      console.error(
        "Create poll error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create poll.",
      );

      return false;
    } finally {
      setIsSending(false);
    }
  };

  // VOTE ON POLL
  const handlePollVote = async (
    pollId,
    optionIds,
  ) => {
    if (
      !pollId ||
      !Array.isArray(optionIds) ||
      optionIds.length === 0
    ) {
      return false;
    }

    try {
      const response =
        await voteOnPoll(
          pollId,
          optionIds,
        );

      if (!response?.success) {
        toast.error(
          response?.message ||
          "Unable to update poll vote.",
        );

        return false;
      }

      const updatedPoll =
        response.data;

      if (!updatedPoll?._id) {
        console.error(
          "Poll vote succeeded but no updated poll was returned:",
          response,
        );

        toast.error(
          "Vote was saved, but the poll could not be updated.",
        );

        return false;
      }

      // UPDATE ONLY THE POLL INSIDE THE MATCHING MESSAGE
      setAllMessages(
        (previousMessages) =>
          previousMessages.map(
            (currentMessage) => {
              if (
                String(
                  currentMessage.poll?._id,
                ) !==
                String(
                  updatedPoll._id,
                )
              ) {
                return currentMessage;
              }

              return {
                ...currentMessage,
                poll: updatedPoll,
              };
            },
          ),
      );

      return true;
    } catch (error) {
      console.error(
        "Vote on poll error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update poll vote.",
      );

      return false;
    }
  };

  // REPLY
  const startReply = (selectedMessage) => {
    setReplyingTo(selectedMessage);

    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  };

  const cancelReply = () => {
    setReplyingTo(null);

    messageInputRef.current?.focus();
  };

  const scrollToMessage = (messageId) => {
    if (!messageId) {
      return;
    }

    const targetMessage = messageRefs.current[String(messageId)];

    if (!targetMessage) {
      return;
    }

    clearTimeout(highlightTimeoutRef.current);

    setHighlightedMessageId(null);

    targetMessage.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHighlightedMessageId(String(messageId));
      });
    });

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedMessageId(null);
    }, 1200);
  };

  const mediaMessages = allMessages.filter(
    (currentMessage) =>
      (currentMessage.type === "image" ||
        currentMessage.type === "video" ||
        currentMessage.type === "gif") &&
      !!currentMessage.mediaUrl,
  );

  const openMediaViewer = (selectedMessage) => {
    if (!selectedMessage?._id) {
      return;
    }

    setMediaViewerMessageId(String(selectedMessage._id));
  };

  const closeMediaViewer = () => {
    setMediaViewerMessageId(null);
  };

  const mediaViewerIndex = mediaMessages.findIndex(
    (currentMessage) =>
      String(currentMessage._id) === String(mediaViewerMessageId),
  );

  // JUMP TO NEW MESSAGES
  const jumpToNewMessages = () => {
    scrollToBottom("smooth");
  };

  // REDUX CHAT UPDATES
  const updateChatInRedux = (updatedChat) => {
    if (!updatedChat) {
      return;
    }

    const existingChats = allChats || [];

    const updatedChats = [
      updatedChat,
      ...existingChats.filter(
        (chat) => String(chat._id) !== String(updatedChat._id),
      ),
    ];

    dispatch(setAllChats(updatedChats));
    dispatch(setSelectedChat(updatedChat));
  };

  const updateChatWithoutReordering = (updatedChat) => {
    if (!updatedChat) {
      return;
    }

    const updatedChats = (allChats || []).map((chat) =>
      String(chat._id) === String(updatedChat._id) ? updatedChat : chat,
    );

    dispatch(setAllChats(updatedChats));
    dispatch(setSelectedChat(updatedChat));
  };

  // SEND TEXT MESSAGE
  const sendMessage = async () => {
    const messageText = message.trim();

    if (!messageText || !selectedChat?._id || isSending) {
      return;
    }

    isNearBottomRef.current = true;

    try {
      setIsSending(true);

      const response = await createMessage({
        chatId: selectedChat._id,
        text: messageText,
        replyTo: replyingTo?._id || null,
      });

      if (!response?.success) {
        toast.error(response?.message || "Unable to send message.");
        return;
      }

      emitSendMessage(socket, {
        message: response.data,
        chat: response.chat,
        members: selectedChat.members.map((member) => String(member._id)),
      });

      setAllMessages((previousMessages) => [
        ...previousMessages,
        response.data,
      ]);

      if (response?.chat) {
        updateChatInRedux(response.chat);
      }

      setMessage("");

      clearTimeout(typingTimeout.current);

      sendStopTyping(socket, {
        sender: user._id,
        chatId: selectedChat._id,
        members: selectedChat.members.map((member) => String(member._id)),
      });

      setReplyingTo(null);

      if (messageInputRef.current) {
        messageInputRef.current.style.height = "48px";
      }

      // We are the sender and therefore already at the latest message.
      setNewMessagesState(0, null);
    } catch (error) {
      console.error("Send message error:", error);

      toast.error(error.response?.data?.message || "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  };

  // SEND GIF
  const sendGifMessage = async (gif) => {
    if (!gif || !selectedChat?._id || isSending) {
      return;
    }

    const gifUrl = gif.images?.original?.url || gif.images?.fixed_width?.url;

    if (!gifUrl) {
      toast.error("Unable to send this GIF.");
      return;
    }

    isNearBottomRef.current = true;

    try {
      setIsSending(true);

      const response = await createMessage({
        chatId: selectedChat._id,
        type: "gif",
        text: "",
        mediaUrl: gifUrl,
        replyTo: replyingTo?._id || null,
      });

      if (!response?.success) {
        toast.error(response?.message || "Unable to send GIF.");
        return;
      }

      emitSendMessage(socket, {
        message: response.data,
        chat: response.chat,
        members: selectedChat.members.map((member) => String(member._id)),
      });

      setAllMessages((previousMessages) => [
        ...previousMessages,
        response.data,
      ]);

      if (response?.chat) {
        updateChatInRedux(response.chat);
      }

      setReplyingTo(null);

      setNewMessagesState(0, null);
    } catch (error) {
      console.error("Send GIF error:", error);

      toast.error(error.response?.data?.message || "Unable to send GIF.");
    } finally {
      setIsSending(false);
    }
  };

  // SEND CAMERA PHOTO
  const sendCameraPhoto = async (photoData) => {

    if (!photoData?.blob || !selectedChat?._id || isSending) {
      console.log("📸 PHOTO SEND REJECTED:", {
        hasBlob: !!photoData?.blob,
        chatId: selectedChat?._id,
        isSending,
      });

      return false;
    }

    isNearBottomRef.current = true;

    const localPreviewUrl = URL.createObjectURL(photoData.blob);

    const temporaryMessageId = `temp-image-${Date.now()}`;

    const mediaType =
      photoData.type === "gif" || photoData.blob.type === "image/gif"
        ? "gif"
        : "image";

    const temporaryMessage = {
      _id: temporaryMessageId,
      chatId: selectedChat._id,
      sender: user._id,
      type: mediaType,
      text: photoData.caption?.trim() || "",
      mediaUrl: localPreviewUrl,
      replyTo: replyingTo || null,
      read: false,
      createdAt: new Date().toISOString(),
      isUploading: true,
    };

    setAllMessages((previousMessages) => [
      ...previousMessages,
      temporaryMessage,
    ]);

    try {
      setIsSending(true);

      const formData = new FormData();

      const mediaType =
        photoData.type === "gif" || photoData.blob.type === "image/gif"
          ? "gif"
          : "image";

      formData.append("chatId", selectedChat._id);
      formData.append("type", mediaType);
      formData.append("text", photoData.caption?.trim() || "");

      const extension =
        photoData.blob.type === "image/gif"
          ? "gif"
          : photoData.blob.type === "image/png"
            ? "png"
            : photoData.blob.type === "image/webp"
              ? "webp"
              : "jpg";

      formData.append(
        "media",
        photoData.blob,
        `aetherion-${mediaType}-${Date.now()}.${extension}`,
      );

      formData.append("replyTo", replyingTo?._id || "");

      console.log("📸 UPLOADING THIS EXACT BLOB:", {
        blob: photoData.blob,
        size: photoData.blob.size,
        type: photoData.blob.type,
      });

      const response = await createMediaMessage(formData);

      if (!response?.success) {
        setAllMessages((previousMessages) =>
          previousMessages.filter(
            (currentMessage) =>
              String(currentMessage._id) !== String(temporaryMessageId),
          ),
        );

        URL.revokeObjectURL(localPreviewUrl);

        toast.error(response?.message || "Unable to send photo.");

        return false;
      }

      setAllMessages((previousMessages) =>
        previousMessages.map((currentMessage) =>
          String(currentMessage._id) === String(temporaryMessageId)
            ? response.data
            : currentMessage,
        ),
      );

      URL.revokeObjectURL(localPreviewUrl);

      emitSendMessage(socket, {
        message: response.data,
        chat: response.chat,
        members: selectedChat.members.map((member) => String(member._id)),
      });

      if (response?.chat) {
        updateChatInRedux(response.chat);
      }

      setReplyingTo(null);

      setNewMessagesState(0, null);

      return true;
    } catch (error) {
      console.error("Send camera photo error:", error);

      setAllMessages((previousMessages) =>
        previousMessages.filter(
          (currentMessage) =>
            String(currentMessage._id) !== String(temporaryMessageId),
        ),
      );

      URL.revokeObjectURL(localPreviewUrl);

      toast.error("Unable to send photo.");

      return false;
    } finally {
      setIsSending(false);
    }
  };

  // SEND CAMERA VIDEO
  const startVideoProcessing = async (videoData) => {
    if (!videoData?.blob || !selectedChat?._id) {
      return null;
    }

    isNearBottomRef.current = true;

    const localPreviewUrl = URL.createObjectURL(videoData.blob);

    const temporaryMessageId = `temp-video-${Date.now()}`;

    const temporaryMessage = {
      _id: temporaryMessageId,
      chatId: selectedChat._id,
      sender: user._id,
      type: "video",
      text: videoData.caption?.trim() || "",
      mediaUrl: localPreviewUrl,
      replyTo: replyingTo || null,
      read: false,
      createdAt: new Date().toISOString(),
      isUploading: true,
    };

    // Add to chat immediately.
    setAllMessages((previousMessages) => [
      ...previousMessages,
      temporaryMessage,
    ]);

    // We are the sender, so follow the message.
    isNearBottomRef.current = true;

    setNewMessagesState(0, null);

    return temporaryMessageId;
  };

  const sendCameraVideo = async (videoData) => {
    if (
      !videoData?.blob ||
      !videoData?.temporaryMessageId ||
      !selectedChat?._id
    ) {
      return false;
    }

    const temporaryMessageId =
      videoData.temporaryMessageId;

    try {

      setIsSending(true);

      const formData = new FormData();

      formData.append("chatId", selectedChat._id);
      formData.append("type", "video");
      formData.append(
        "text",
        videoData.caption?.trim() || "",
      );

      formData.append(
        "media",
        videoData.blob,
        `aetherion-video-${Date.now()}.webm`,
      );

      formData.append(
        "replyTo",
        replyingTo?._id || "",
      );

      console.log("🎥 UPLOADING FINAL VIDEO:", {
        temporaryMessageId,
        blobType: videoData.blob.type,
        blobSize: videoData.blob.size,
      });

      const response = await createMediaMessage(formData);

      if (!response?.success) {

        setAllMessages((previousMessages) => {
          const failedMessage = previousMessages.find(
            (currentMessage) =>
              String(currentMessage._id) ===
              String(temporaryMessageId),
          );

          if (failedMessage?.mediaUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(failedMessage.mediaUrl);
          }

          return previousMessages.filter(
            (currentMessage) =>
              String(currentMessage._id) !==
              String(temporaryMessageId),
          );
        });

        toast.error(
          response?.message ||
          "Unable to send video.",
        );

        return false;
      }

      setAllMessages((previousMessages) =>
        previousMessages.map((currentMessage) => {
          if (
            String(currentMessage._id) !==
            String(temporaryMessageId)
          ) {
            return currentMessage;
          }

          // Removing local preview URL now that the
          if (
            currentMessage.mediaUrl?.startsWith(
              "blob:",
            )
          ) {
            URL.revokeObjectURL(
              currentMessage.mediaUrl,
            );
          }

          return response.data;
        }),
      );

      emitSendMessage(socket, {
        message: response.data,
        chat: response.chat,
        members: selectedChat.members.map(
          (member) => String(member._id),
        ),
      });

      if (response?.chat) {
        updateChatInRedux(response.chat);
      }

      setReplyingTo(null);

      setNewMessagesState(0, null);

      return true;
    } catch (error) {
      console.error("🔥 SEND VIDEO FAILED", {
        error,
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        status: error?.response?.status,
      });

      setAllMessages((previousMessages) => {
        const failedMessage = previousMessages.find(
          (currentMessage) =>
            String(currentMessage._id) ===
            String(temporaryMessageId),
        );

        if (failedMessage?.mediaUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(
            failedMessage.mediaUrl,
          );
        }

        return previousMessages.filter(
          (currentMessage) =>
            String(currentMessage._id) !==
            String(temporaryMessageId),
        );
      });

      toast.error(
        error?.response?.data?.message ||
        "Unable to send video.",
      );

      return false;
    } finally {
      setIsSending(false);
    }
  };

  // SEND GALLERY MEDIA
  const sendGalleryMedia = async ({ items = [], caption = "" }) => {
    if (!items.length || !selectedChat?._id) {
      return false;
    }

    isNearBottomRef.current = true;

    const temporaryMessages = items.map((item, index) => {
      const temporaryMessageId = `temp-gallery-${Date.now()}-${index}`;

      return {
        _id: temporaryMessageId,
        chatId: selectedChat._id,
        sender: user._id,
        type: item.type === "video" ? "video" : "image",
        text: index === 0 ? caption.trim() : "",
        mediaUrl: item.previewUrl,
        replyTo: index === 0 ? replyingTo || null : null,
        read: false,
        createdAt: new Date().toISOString(),
        isUploading: true,

        // Keep the original file temporarily so we can upload it.
        _galleryFile: item.file,
      };
    });

    // SHOW ALL SELECTED MEDIA IN CHAT IMMEDIATELY
    setAllMessages((previousMessages) => [
      ...previousMessages,
      ...temporaryMessages,
    ]);

    setNewMessagesState(0, null);

    try {
      setIsSending(true);

      // Upload each selected item.
      for (let index = 0; index < temporaryMessages.length; index++) {
        const temporaryMessage = temporaryMessages[index];

        const file = temporaryMessage._galleryFile;

        if (!file) {
          continue;
        }

        const formData = new FormData();

        const isVideo = file.type.startsWith("video/");

        formData.append("chatId", selectedChat._id);

        formData.append(
          "type",
          isVideo ? "video" : "image",
        );

        // Caption and reply only belong to the first item.
        formData.append(
          "text",
          index === 0 ? caption.trim() : "",
        );

        formData.append(
          "replyTo",
          index === 0
            ? replyingTo?._id || ""
            : "",
        );

        formData.append(
          "media",
          file,
          file.name ||
          `aetherion-gallery-${Date.now()}-${index}`,
        );

        console.log("🖼️ UPLOADING GALLERY MEDIA:", {
          index,
          name: file.name,
          type: file.type,
          size: file.size,
        });

        const response = await createMediaMessage(formData);

        if (!response?.success) {
          // Remove only the failed temporary message.
          setAllMessages((previousMessages) =>
            previousMessages.filter(
              (currentMessage) => {
                if (
                  String(currentMessage._id) ===
                  String(temporaryMessage._id)
                ) {
                  if (
                    currentMessage.mediaUrl?.startsWith(
                      "blob:",
                    )
                  ) {
                    URL.revokeObjectURL(
                      currentMessage.mediaUrl,
                    );
                  }

                  return false;
                }

                return true;
              },
            ),
          );

          toast.error(
            response?.message ||
            `Unable to send ${file.name || "media"}.`,
          );

          continue;
        }

        // Replace temporary loader message with real message.
        setAllMessages((previousMessages) =>
          previousMessages.map(
            (currentMessage) => {
              if (
                String(currentMessage._id) !==
                String(temporaryMessage._id)
              ) {
                return currentMessage;
              }

              if (
                currentMessage.mediaUrl?.startsWith(
                  "blob:",
                )
              ) {
                URL.revokeObjectURL(
                  currentMessage.mediaUrl,
                );
              }

              return response.data;
            },
          ),
        );

        // Emit each successfully uploaded message.
        emitSendMessage(socket, {
          message: response.data,
          chat: response.chat,
          members: selectedChat.members.map(
            (member) => String(member._id),
          ),
        });

        if (response?.chat) {
          updateChatInRedux(response.chat);
        }
      }

      setReplyingTo(null);

      setNewMessagesState(0, null);

      return true;
    } catch (error) {
      console.error("Gallery send error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Unable to send selected media.",
      );

      // Remove any remaining uploading messages.
      setAllMessages((previousMessages) =>
        previousMessages.filter((currentMessage) => {
          if (!currentMessage.isUploading) {
            return true;
          }

          const isGalleryTemporaryMessage =
            String(currentMessage._id).startsWith(
              "temp-gallery-",
            );

          if (!isGalleryTemporaryMessage) {
            return true;
          }

          if (
            currentMessage.mediaUrl?.startsWith("blob:")
          ) {
            URL.revokeObjectURL(
              currentMessage.mediaUrl,
            );
          }

          return false;
        }),
      );

      return false;
    } finally {
      setIsSending(false);
    }
  };

  // FETCH MESSAGES
  const getMessages = async () => {
    if (!selectedChat?._id) {
      return;
    }

    try {
      dispatch(showLoader());

      const response = await getAllMessages(selectedChat._id);

      if (response?.success) {
        setAllMessages(response.data || []);
      } else {
        toast.error(response?.message || "Unable to fetch messages.");
      }
    } catch (error) {
      console.error("Get messages error:", error);

      toast.error("Unable to fetch messages.");
    } finally {
      dispatch(hideLoader());
    }
  };

  // TYPING
  const handleMessageChange = (event) => {
    const value = event.target.value;

    setMessage(value);

    if (!selectedChat?._id) {
      return;
    }

    sendTyping(socket, {
      sender: user._id,
      chatId: selectedChat._id,
      members: selectedChat.members.map((member) => String(member._id)),
    });

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      sendStopTyping(socket, {
        sender: user._id,
        chatId: selectedChat._id,
        members: selectedChat.members.map((member) => String(member._id)),
      });
    }, 1000);

    const textarea = event.target;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((previousMessage) => previousMessage + emojiData.emoji);
  };

  const toggleMediaPicker = () => {
    setShowMediaPicker((previous) => !previous);

    if (!showMediaPicker) {
      messageInputRef.current?.blur();
    } else {
      requestAnimationFrame(() => {
        messageInputRef.current?.focus();
      });
    }
  };

  // RESET WHEN CHAT CHANGES
  useEffect(() => {
    hasInitialScrolledRef.current = false;
    isNearBottomRef.current = true;
    previousMessageCountRef.current = 0;
    isClearingUnreadRef.current = false;

    dividerVisibleRef.current = false;
    setDividerVisible(false);

    initialUnreadCountRef.current = unreadMessageCount;

    setAllMessages([]);
    setNewMessagesState(0, null);
    setReplyingTo(null);
  }, [selectedChat?._id]);

  // LOAD CHAT
  useEffect(() => {
    if (!selectedChat?._id) {
      return;
    }

    getMessages();
  }, [selectedChat?._id]);

  useEffect(() => {
    if (
      isSending ||
      showMediaPicker ||
      showCameraModal ||
      showGalleryModal ||
      showDocumentModal
    ) {
      return;
    }

    if (!selectedChat?._id) {
      return;
    }

    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  }, [
    isSending,
    selectedChat?._id,
    showMediaPicker,
    showCameraModal,
    showGalleryModal,
  ]);

  // INITIAL POSITION
  useEffect(() => {
    if (
      !selectedChat?._id ||
      hasInitialScrolledRef.current ||
      allMessages.length === 0
    ) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;

        if (!container) {
          return;
        }

        const initialUnreadCount = Number(initialUnreadCountRef.current) || 0;

        // NORMAL CHAT: No unread messages → go directly to bottom.
        if (initialUnreadCount <= 0) {
          scrollToBottom("auto");

          hasInitialScrolledRef.current = true;
          previousMessageCountRef.current = allMessages.length;
          isNearBottomRef.current = true;

          return;
        }

        const firstUnreadIndex = Math.max(
          0,
          allMessages.length - initialUnreadCount,
        );

        const firstUnreadMessage = allMessages[firstUnreadIndex];

        if (firstUnreadMessage?._id) {
          const firstUnreadElement =
            messageRefs.current[String(firstUnreadMessage._id)];

          dividerVisibleRef.current = true;
          setDividerVisible(true);

          setNewMessagesState(
            Math.min(initialUnreadCount, allMessages.length),
            String(firstUnreadMessage._id),
          );

          if (firstUnreadElement) {
            firstUnreadElement.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          } else {
            container.scrollTop = container.scrollHeight;
          }

          isNearBottomRef.current = false;
        } else {
          scrollToBottom("auto");
          isNearBottomRef.current = true;
        }

        hasInitialScrolledRef.current = true;
        previousMessageCountRef.current = allMessages.length;
      });
    });
  }, [selectedChat?._id, allMessages.length]);

  // KEEP BOTTOM STABLE WHEN MEDIA LOADS
  useEffect(() => {
    if (
      !selectedChat?._id ||
      !hasInitialScrolledRef.current ||
      !isNearBottomRef.current
    ) {
      return;
    }

    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [allMessages]);

  // HANDLE NEW MESSAGES + SCROLLING
  useEffect(() => {
    if (!hasInitialScrolledRef.current) {
      return;
    }

    const currentMessageCount = allMessages.length;
    const previousMessageCount = previousMessageCountRef.current;

    if (currentMessageCount <= previousMessageCount) {
      previousMessageCountRef.current = currentMessageCount;

      return;
    }

    const newlyAddedMessages = allMessages.slice(previousMessageCount);

    previousMessageCountRef.current = currentMessageCount;

    const latestNewMessage = newlyAddedMessages[newlyAddedMessages.length - 1];

    if (!latestNewMessage) {
      return;
    }

    const latestSenderId =
      typeof latestNewMessage.sender === "object"
        ? latestNewMessage.sender?._id
        : latestNewMessage.sender;

    const isMyLatestMessage = String(latestSenderId) === String(user._id);

    if (isMyLatestMessage) {
      setNewMessagesState(0, null);

      isNearBottomRef.current = true;

      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });

      return;
    }

    if (isNearBottomRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });

      clearUnreadMessages();

      return;
    }

    const incomingCount = newlyAddedMessages.length;

    setNewMessageCount((previousCount) => {
      const nextCount = previousCount + incomingCount;

      newMessageCountRef.current = nextCount;

      if (previousCount === 0) {
        const firstNewMessage = newlyAddedMessages[0];

        if (firstNewMessage?._id) {
          dividerVisibleRef.current = true;
          setDividerVisible(true);

          setFirstNewMessageId(String(firstNewMessage._id));
        }
      }

      return nextCount;
    });
  }, [allMessages, user?._id]);

  // SOCKET: RECEIVE MESSAGE
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (
        !data?.message ||
        String(data.message.chatId) !== String(selectedChat?._id)
      ) {
        return;
      }

      setAllMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (currentMessage) =>
            String(currentMessage._id) === String(data.message._id),
        );

        console.log("📨 SOCKET CHAT:", {
          unread: data.chat?.unreadMessageCount,
        });

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, data.message];
      });

      if (data.chat) {
        updateChatInRedux(data.chat);
      }
    };

    return registerSocketListeners(socket, {
      onReceiveMessage: handleReceiveMessage,
    });
  }, [socket, selectedChat?._id]);

  // SOCKET: MESSAGES READ
  useEffect(() => {
    const handleMessagesRead = (data) => {
      if (String(data.chatId) !== String(selectedChat?._id)) {
        return;
      }

      setAllMessages((previousMessages) =>
        previousMessages.map((currentMessage) => {
          const senderId =
            typeof currentMessage.sender === "object"
              ? currentMessage.sender?._id
              : currentMessage.sender;

          if (String(senderId) === String(user._id)) {
            return {
              ...currentMessage,
              read: true,
            };
          }

          return currentMessage;
        }),
      );
    };

    return registerSocketListeners(socket, {
      onMessagesRead: handleMessagesRead,
    });
  }, [socket, selectedChat?._id, user?._id]);

  // CLEANUP
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
      clearTimeout(highlightTimeoutRef.current);

      if (selectedChat?._id) {
        sendStopTyping(socket, {
          sender: user._id,
          chatId: selectedChat._id,
          members: selectedChat.members.map((member) => String(member._id)),
        });
      }

      dividerVisibleRef.current = false;
      setDividerVisible(false);
      newMessageCountRef.current = 0;
    };
  }, [selectedChat?._id, socket, user?._id]);

  if (!selectedChat) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#d8f45a]/15 bg-[#0b100c] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      {/* CHAT HEADER */}
      <div className="mb-4 flex shrink-0 items-center border-b border-[#d8f45a]/15 px-2 py-3 sm:mb-5 sm:px-4">
        <button
          type="button"
          onClick={leaveChat}
          className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#f9fbf2] transition hover:bg-[#d8f45a]/10 md:hidden"
          aria-label="Back to chats"
        >
          <FiArrowLeft className="text-xl" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-right">
            <p className="truncate font-bold text-[#edefe5]">
              {selectedUser
                ? `${selectedUser.firstName} ${selectedUser.lastName}`
                : "Chat"}
            </p>

            <p className="flex items-center justify-end gap-1 text-xs text-[#8a9385]">
              {isSelectedUserOnline && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8f45a]" />
              )}

              {isSelectedUserOnline
                ? "online"
                : formatLastSeen(selectedUserLastSeen)}
            </p>
          </div>

          {isTyping && (
            <p className="text-right text-xs text-[#f1eee8]">typing...</p>
          )}
        </div>
      </div>

      {/* CHAT MESSAGES */}

      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="scrollbar-aetherion min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-1 py-3 sm:px-2"
      >
        <div className="flex min-h-full min-w-0 flex-col gap-2">
          {/* EMPTY CHAT */}

          {allMessages.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-[#70786f]">No messages yet.</p>
            </div>
          )}

          {/* MESSAGES */}

          {allMessages.map((currentMessage, index) => {
            const previousMessage = allMessages[index - 1];

            const senderId =
              typeof currentMessage.sender === "object"
                ? currentMessage.sender?._id
                : currentMessage.sender;

            const isMyMessage = String(senderId) === String(user._id);

            const showDate = shouldShowDateSeparator(
              currentMessage,
              previousMessage,
            );

            const showNewMessagesDivider =
              dividerVisible &&
              firstNewMessageId &&
              String(currentMessage._id) === String(firstNewMessageId);

            return (
              <div
                key={currentMessage._id}
                ref={(element) => {
                  if (element) {
                    messageRefs.current[String(currentMessage._id)] = element;
                  } else {
                    delete messageRefs.current[String(currentMessage._id)];
                  }
                }}
                className={
                  highlightedMessageId === String(currentMessage._id)
                    ? "reply-target"
                    : ""
                }
              >
                {/* NEW MESSAGE DIVIDER */}

                {showNewMessagesDivider && (
                  <NewMessageDivider
                    count={newMessageCount}
                    onClick={jumpToNewMessages}
                  />
                )}

                {/* DATE */}

                {showDate && (
                  <DateSeparator
                    label={formatDateLabel(currentMessage.createdAt)}
                  />
                )}

                {/* MESSAGE */}

                <MessageBubble
                  message={currentMessage}
                  isMyMessage={isMyMessage}
                  onReply={startReply}
                  onReplyClick={scrollToMessage}
                  onMediaClick={openMediaViewer}
                  onPollVote={handlePollVote}
                  isHighlighted={
                    highlightedMessageId ===
                    String(currentMessage._id)
                  }
                  currentUserId={user._id}
                  otherUserName={
                    selectedUser
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : "User"
                  }
                />
              </div>
            );
          })}

          {showScrollToBottom && (
            <div className="pointer-events-none sticky bottom-3 z-20 flex justify-end px-2">
              <button
                type="button"
                onClick={jumpToNewMessages}
                aria-label={
                  newMessageCount > 0
                    ? `Jump to latest messages, ${newMessageCount} new messages`
                    : "Jump to latest messages"
                }
                className="pointer-events-auto relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full backdrop-blur-md transition-all duration-200 hover:bg-[#202b21] active:scale-90"
              >
                {/* SCROLL ICON */}
                <img
                  src="/images/scroll-down-icon.png"
                  alt="scroll down icon"
                  draggable="false"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />

                {/* NUMBER IN THE OPENING OF THE CIRCLE */}
                {newMessageCount > 0 && (
                  <span className="pointer-events-none absolute left-[7px] top-1/4 z-10 flex -translate-y-1/2 items-center justify-center text-[13px] font-bold leading-none text-[#ffffff] drop-shadow-[0_1px_5px_rgba(216,244,90,0.55)]">
                    {newMessageCount > 99 ? "99+" : newMessageCount}
                  </span>
                )}

                {/* SUBTLE SHINE */}
                <span
                  className="pointer-events-none absolute -left-8 top-0 h-full w-5 rotate-[20deg] bg-white/20 blur-md transition-transform duration-700 group-hover:translate-x-24"
                  aria-hidden="true"
                />

                {/* SMALL INNER GLOW */}
                <span
                  className="pointer-events-none absolute inset-[3px] rounded-full border border-white/[0.035]"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}

          {/* TYPING INDICATOR */}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-fit rounded-2xl bg-[#171d17] px-3 py-2 shadow-sm transition-all duration-200">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d8f45a]" />

                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d8f45a]"
                    style={{
                      animationDelay: "0.15s",
                    }}
                  />

                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d8f45a]"
                    style={{
                      animationDelay: "0.3s",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE INPUT */}
      <div className="mt-4 shrink-0 sm:mt-5">
        <ReplyPreview
          message={replyingTo}
          isMyMessage={
            String(replyingTo?.sender?._id || replyingTo?.sender) ===
            String(user._id)
          }
          otherUserName={
            selectedUser
              ? `${selectedUser.firstName} ${selectedUser.lastName}`
              : "User"
          }
          onCancel={cancelReply}
        />

        <div className="relative">
          <div className="relative flex items-end gap-2 sm:gap-3">
            {/* EMOJI / GIF / STICKER */}
            <button
              type="button"
              onClick={toggleMediaPicker}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#83b47b] transition hover:bg-[#2a2a29] hover:text-[#bcf66b]"
              aria-label={
                showMediaPicker ? "Show keyboard" : "Open emojis and media"
              }
            >
              {showMediaPicker ? (
                <MdKeyboard className="text-xl" />
              ) : (
                <FiSmile className="text-xl" />
              )}
            </button>

            {/* COMPOSER */}
            <MessageComposer
              message={message}
              messageInputRef={messageInputRef}
              isSending={isSending}
              onMessageChange={handleMessageChange}
              onSendMessage={sendMessage}
              onCamera={openCamera}
              onGallery={openGallery}
              onDocument={openDocument}
              onPoll={openPoll}
            />

            {/* CAMERA */}
            <CameraModal
              isOpen={showCameraModal}
              onClose={closeCamera}
              onGallery={openGallery}
              recipientName={
                selectedUser
                  ? `${selectedUser.firstName} ${selectedUser.lastName}`
                  : "User"
              }
              onPhotoCaptured={sendCameraPhoto}
              onVideoCaptured={sendCameraVideo}
            />

            {/* GALLERY */}
            <GalleryModal
              isOpen={showGalleryModal}
              onClose={closeGallery}
              onSend={sendGalleryMedia}
              source="chat"
            />

            {/* DOCUMENT */}
            <DocumentModal
              isOpen={showDocumentModal}
              onClose={closeDocument}
              onSend={handleSendDocuments}
              source="chat"
            />

            {/* POLL */}
            <PollModal
              isOpen={showPollModal}
              onClose={closePoll}
              onSend={handleCreatePoll}
            />

            {mediaViewerMessageId && mediaViewerIndex >= 0 ? (
              <MediaViewer
                mediaItems={mediaMessages}
                initialIndex={mediaViewerIndex}
                onClose={closeMediaViewer}
                onReply={startReply}
                onSendEditedPhoto={sendCameraPhoto}
                onSendEditedVideo={sendCameraVideo}
                onVideoProcessingStart={startVideoProcessing}
                currentUser={user}
                otherUser={selectedChat?.members?.find(
                  (member) => String(member._id) !== String(user?._id),
                )}
              />
            ) : null}

            {/* SEND */}

            <button
              type="button"
              onClick={sendMessage}
              disabled={isSending || !message.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <FaPaperPlane className="ml-0.5 text-xl" />
            </button>
          </div>

          {/* MEDIA PICKER */}

          <div className="mt-2 md:relative">
            <MessageMediaPicker
              isOpen={showMediaPicker}
              onClose={() => setShowMediaPicker(false)}
              onEmojiClick={handleEmojiClick}
              onGifClick={sendGifMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
