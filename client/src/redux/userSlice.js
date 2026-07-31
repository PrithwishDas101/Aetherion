import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        user: null,
        allUsers: null,
        allChats: null,
        selectedChat: null,
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

    },
});

export const {
    setUser,
    setAllUser,
    setAllChats,
    setSelectedChat,
} = userSlice.actions;

export default userSlice.reducer;