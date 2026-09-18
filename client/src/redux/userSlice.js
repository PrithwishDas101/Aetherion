import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",

  initialState: {
    user: null,
    allUsers: null,
    allChats: null,
    selectedChat: null,
    typingChats: {},
    presence: {},
  },

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    setAllUser: (state, action) => {
      state.allUsers = action.payload;
    },

    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },

    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },

    setTyping: (state, action) => {
      const { chatId, userId } = action.payload;

      state.typingChats[chatId] = userId;
    },

    clearTyping: (state, action) => {
      const { chatId } = action.payload;

      delete state.typingChats[chatId];
    },

    setUserOnline: (state, action) => {
      const userId = String(action.payload);

      state.presence[userId] = {
        online: true,
        lastSeen: null,
      };
    },

    setUserOffline: (state, action) => {
      const { userId, lastSeen } = action.payload;

      const id = String(userId);

      state.presence[id] = {
        online: false,
        lastSeen,
      };
    },

    setPresenceState: (state, action) => {
      const userIds = action.payload || [];

      userIds.forEach((userId) => {
        state.presence[String(userId)] = {
          online: true,
          lastSeen: null,
        };
      });
    },

    setInitialPresence: (state, action) => {
      const users = action.payload || [];

      users.forEach((user) => {
        if (!user?._id) {
          return;
        }

        const userId = String(user._id);

        state.presence[userId] = {
          online: state.presence[userId]?.online || false,

          lastSeen: state.presence[userId]?.lastSeen || user.lastSeen || null,
        };
      });
    },

    updateUserPublicPresenceStatus: (state, action) => {
      const { userId, publicPresenceStatus } = action.payload;

      if (!userId || !publicPresenceStatus) {
        return;
      }

      const id = String(userId);

      // Update the user list.
      if (Array.isArray(state.allUsers)) {
        state.allUsers = state.allUsers.map((user) =>
          String(user._id) === id
            ? {
                ...user,
                publicPresenceStatus,
              }
            : user,
        );
      }

      // Update users inside all chats.
      if (Array.isArray(state.allChats)) {
        state.allChats = state.allChats.map((chat) => ({
          ...chat,
          members: Array.isArray(chat.members)
            ? chat.members.map((member) =>
                String(member._id) === id
                  ? {
                      ...member,
                      publicPresenceStatus,
                    }
                  : member,
              )
            : chat.members,
        }));
      }

      // Update the currently selected chat.
      if (state.selectedChat?.members) {
        state.selectedChat = {
          ...state.selectedChat,
          members: state.selectedChat.members.map((member) =>
            String(member._id) === id
              ? {
                  ...member,
                  publicPresenceStatus,
                }
              : member,
          ),
        };
      }

      // If this happens to be the logged-in user,
      // keep the local user object in sync too.
      if (state.user && String(state.user._id) === id) {
        state.user = {
          ...state.user,
          publicPresenceStatus,
        };
      }
    },
  },
});

export const {
  setUser,
  updateUser,
  setAllUser,
  setAllChats,
  setSelectedChat,
  setTyping,
  clearTyping,
  setUserOnline,
  setUserOffline,
  setPresenceState,
  setInitialPresence,
  updateUserPublicPresenceStatus,
} = userSlice.actions;

export default userSlice.reducer;
