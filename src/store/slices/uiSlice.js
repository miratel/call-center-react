// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        loading: false,
        notification: null,
        activeTab: 'dashboard',
        sidebarOpen: true,
        modals: {
            callPopup: false,
            transferModal: false,
            conferenceModal: false,
        },
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setNotification: (state, action) => {
            state.notification = action.payload;
        },
        clearNotification: (state) => {
            state.notification = null;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        openModal: (state, action) => {
            state.modals[action.payload] = true;
        },
        closeModal: (state, action) => {
            state.modals[action.payload] = false;
        },
        closeAllModals: (state) => {
            Object.keys(state.modals).forEach(key => {
                state.modals[key] = false;
            });
        },
    },
});

export const {
    setLoading,
    setNotification,
    clearNotification,
    setActiveTab,
    toggleSidebar,
    openModal,
    closeModal,
    closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer;