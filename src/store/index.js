// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import callReducer from './slices/callSlice';
import agentReducer from './slices/agentSlice';
import queueReducer from './slices/queueSlice';
import contactReducer from './slices/contactSlice';
import campaignReducer from './slices/campaignSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        calls: callReducer,
        agents: agentReducer,
        queues: queueReducer,
        contacts: contactReducer,
        campaigns: campaignReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['calls/addCall', 'calls/updateCall'],
                ignoredPaths: ['calls.activeCalls'],
            },
        }),
});