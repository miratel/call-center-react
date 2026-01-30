// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import callReducer from './slices/callSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        calls: callReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});