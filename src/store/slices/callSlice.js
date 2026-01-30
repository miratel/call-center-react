// src/store/slices/callSlice.js
import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
    name: 'calls',
    initialState: {
        activeCalls: [],
        callHistory: [],
        currentCall: null,
        incomingCall: null,
        loading: false,
        error: null
    },
    reducers: {
        addCall: (state, action) => {
            const existingCall = state.activeCalls.find(
                call => call.id === action.payload.id
            );
            if (!existingCall) {
                state.activeCalls.push(action.payload);
            }
        },
        updateCall: (state, action) => {
            const index = state.activeCalls.findIndex(
                call => call.id === action.payload.id
            );
            if (index !== -1) {
                state.activeCalls[index] = {
                    ...state.activeCalls[index],
                    ...action.payload,
                };
            }
        },
        removeCall: (state, action) => {
            state.activeCalls = state.activeCalls.filter(
                call => call.id !== action.payload
            );
        },
        setIncomingCall: (state, action) => {
            state.incomingCall = action.payload;
        },
        clearIncomingCall: (state) => {
            state.incomingCall = null;
        },
        setCurrentCall: (state, action) => {
            state.currentCall = action.payload;
        },
        clearCurrentCall: (state) => {
            state.currentCall = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    addCall,
    updateCall,
    removeCall,
    setIncomingCall,
    clearIncomingCall,
    setCurrentCall,
    clearCurrentCall,
    setLoading,
    setError,
} = callSlice.actions;

export default callSlice.reducer;