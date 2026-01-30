// src/store/slices/queueSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { queuesAPI } from '../../services/api';

export const fetchQueues = createAsyncThunk(
    'queues/fetchQueues',
    async () => {
        const response = await queuesAPI.getQueues();
        return response;
    }
);

export const fetchQueueStats = createAsyncThunk(
    'queues/fetchQueueStats',
    async (queueId) => {
        const response = await queuesAPI.getQueueStats(queueId);
        return response;
    }
);

const queueSlice = createSlice({
    name: 'queues',
    initialState: {
        list: [],
        stats: {},
        loading: false,
        error: null,
    },
    reducers: {
        updateQueue: (state, action) => {
            const index = state.list.findIndex(q => q.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
        },
        updateQueueMember: (state, action) => {
            const { queueId, member } = action.payload;
            const queue = state.list.find(q => q.id === queueId);
            if (queue) {
                if (!queue.members) queue.members = [];
                const existingIndex = queue.members.findIndex(m => m.id === member.id);
                if (existingIndex !== -1) {
                    queue.members[existingIndex] = member;
                } else {
                    queue.members.push(member);
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQueues.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(fetchQueueStats.fulfilled, (state, action) => {
                state.stats[action.payload.queueId] = action.payload;
            });
    },
});

export const { updateQueue, updateQueueMember } = queueSlice.actions;
export default queueSlice.reducer;