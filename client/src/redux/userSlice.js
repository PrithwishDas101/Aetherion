import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        user: null,
        allUsers: null,
        allChats: null,
        selectedChat: null,
        typingChats: {},
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

    },
});

export const {
    setUser,
    setAllUser,
    setAllChats,
    setSelectedChat,
    setTyping,
    clearTyping,
} = userSlice.actions;

export default userSlice.reducer;