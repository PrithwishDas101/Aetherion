import toast from "react-hot-toast";

import { createChat } from "../apiCalls/chatApi.js";
import { hideLoader, showLoader } from "../redux/sliceLoader.js";
import { setAllChats, setSelectedChat } from "../redux/userSlice.js";

// Creates a chat if necessary and selects it. Used by: UserList, Contacts
export const startChatWithUser = async ({
  currentUserId,
  targetUserId,
  allChats,
  dispatch,
}) => {
  if (!currentUserId || !targetUserId) {
    return false;
  }

  if (String(currentUserId) === String(targetUserId)) {
    toast.error("You cannot start a chat with yourself.");
    return false;
  }

  try {
    dispatch(showLoader());

    const response = await createChat([currentUserId, targetUserId]);

    if (!response?.success) {
      toast.error(response?.message || "Unable to create chat.");

      return false;
    }

    const chat = response.data;

    const existingChats = allChats || [];

    const chatAlreadyExists = existingChats.some(
      (existingChat) => String(existingChat._id) === String(chat._id),
    );

    const updatedChats = chatAlreadyExists
      ? existingChats
      : [...existingChats, chat];

    updatedChats.sort(
      (firstChat, secondChat) =>
        new Date(secondChat.updatedAt || 0) -
        new Date(firstChat.updatedAt || 0),
    );

    dispatch(setAllChats(updatedChats));
    dispatch(setSelectedChat(chat));

    if (!chatAlreadyExists) {
      toast.success(response.message || "Chat created successfully!");
    }

    return true;
  } catch (error) {
    console.error("Start chat error:", error);

    toast.error("Unable to open chat.");

    return false;
  } finally {
    dispatch(hideLoader());
  }
};
