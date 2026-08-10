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

            const {
                chatId,
                userId,
            } = action.payload;

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

            const { userId, lastSeen, } = action.payload;

            const id = String(userId);

            state.presence[id] = {
                online: false,
                lastSeen,
            };

        },

        setPresenceState: (state, action) => {

            const userIds = action.payload || [];

            userIds.forEach(userId => {

                state.presence[String(userId)] = {
                    online: true,
                    lastSeen: null,
                };

            });

        },

        setInitialPresence: (state, action) => {

            const users = action.payload || [];

            users.forEach(user => {

                if (!user?._id) {
                    return;
                }

                const userId =
                    String(user._id);

                state.presence[userId] = {
                    online:
                        state.presence[userId]?.online ||
                        false,

                    lastSeen:
                        state.presence[userId]?.lastSeen ||
                        user.lastSeen ||
                        null,
                };

            });

        },

    },
});

export const {
    setUser,
    setAllUser,
    setAllChats,
    setSelectedChat,
    setTyping,
    clearTyping,
    setUserOnline,
    setUserOffline,
    setPresenceState,
    setInitialPresence
} = userSlice.actions;

export default userSlice.reducer;