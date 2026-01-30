import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeCalls: [],
    callHistory: [],
    currentCall: null,
    incomingCall: null,
    loading: false,
    error: null,
};

const callSlice = createSlice({
    name: 'calls',
    initialState,
    reducers: {
        addCall: (state, action) => {
            state.activeCalls.push(action.payload);
        },
        updateCall: (state, action) => {
            const index = state.activeCalls.findIndex(call => call.id === action.payload.id);
            if (index !== -1) {
                state.activeCalls[index] = { ...state.activeCalls[index], ...action.payload };
            }
        },
        removeCall: (state, action) => {
            state.activeCalls = state.activeCalls.filter(call => call.id !== action.payload);
        },
        setCurrentCall: (state, action) => {
            state.currentCall = action.payload;
        },
        clearCurrentCall: (state) => {
            state.currentCall = null;
        },
        setActiveCalls: (state, action) => {
            state.activeCalls = action.payload;
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
    setCurrentCall,
    clearCurrentCall,
    setActiveCalls,
    setLoading,
    setError,
} = callSlice.actions;

export default callSlice.reducer;