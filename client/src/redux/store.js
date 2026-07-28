import { configureStore } from "@reduxjs/toolkit";

import loaderReducer from "./sliceLoader.js";

const store = configureStore({
    reducer: {
        loaderReducer,
    },
});

export default store;