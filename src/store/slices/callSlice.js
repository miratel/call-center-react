// src/store/slices/callSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { callsAPI } from '../../services/api';

export const fetchActiveCalls = createAsyncThunk(
    'calls/fetchActiveCalls',
    async () => {
        const response = await callsAPI.getActiveCalls();
        return response;
    }
);

export const fetchCallHistory = createAsyncThunk(
    'calls/fetchCallHistory',
    async (params) => {
        const response = await callsAPI.getCallHistory(params);
        return response;
    }
);

export const makeCall = createAsyncThunk(
    'calls/makeCall',
    async ({ number, extension }, { rejectWithValue }) => {
        try {
            const response = await callsAPI.makeCall(number, extension);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Call failed');
        }
    }
);

export const hangupCall = createAsyncThunk(
    'calls/hangupCall',
    async (channel) => {
        const response = await callsAPI.hangup(channel);
        return response;
    }
);

export const transferCall = createAsyncThunk(
    'calls/transferCall',
    async ({ channel, extension }, { rejectWithValue }) => {
        try {
            const response = await callsAPI.transfer(channel, extension);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Transfer failed');
        }
    }
);

const callSlice = createSlice({
    name: 'calls',
    initialState: {
        activeCalls: [],
        callHistory: [],
        currentCall: null,
        incomingCall: null,
        loading: false,
        error: null,
        filters: {
            dateFrom: null,
            dateTo: null,
            direction: 'all',
            status: 'all',
            search: '',
        },
        pagination: {
            page: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 20,
        },
    },
    reducers: {
        addCall: (state, action) => {
            const existingCall = state.activeCalls.find(
                call => call.uniqueid === action.payload.uniqueid
            );
            if (!existingCall) {
                state.activeCalls.push(action.payload);
            }
        },
        updateCall: (state, action) => {
            const index = state.activeCalls.findIndex(
                call => call.uniqueid === action.payload.uniqueid
            );
            if (index !== -1) {
                state.activeCalls[index] = {
                    ...state.activeCalls[index],
                    ...action.payload,
                };
            } else {
                state.activeCalls.push(action.payload);
            }
        },
        removeCall: (state, action) => {
            state.activeCalls = state.activeCalls.filter(
                call => call.uniqueid !== action.payload
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
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveCalls.fulfilled, (state, action) => {
                state.activeCalls = action.payload;
            })
            .addCase(fetchCallHistory.fulfilled, (state, action) => {
                state.callHistory = action.payload.calls;
                state.pagination = action.payload.pagination;
            })
            .addCase(makeCall.pending, (state) => {
                state.loading = true;
            })
            .addCase(makeCall.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(makeCall.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
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
    setFilters,
    setPagination,
    clearError,
} = callSlice.actions;

export default callSlice.reducer;