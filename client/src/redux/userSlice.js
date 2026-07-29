import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        user: null,
        allUsers: null,
    },

    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },

        setAllUser: (state, action) => {
            state.allUsers = action.payload;
        },
    },
});

export const {
    setUser,
    setAllUser,
} = userSlice.actions;

export default userSlice.reducer;