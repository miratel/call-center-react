// src/store/slices/agentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { agentsAPI } from '../../services/api';

export const fetchAgents = createAsyncThunk(
    'agents/fetchAgents',
    async () => {
        const response = await agentsAPI.getAgents();
        return response;
    }
);

export const updateAgentStatus = createAsyncThunk(
    'agents/updateAgentStatus',
    async ({ agentId, status }) => {
        const response = await agentsAPI.updateStatus(agentId, status);
        return response;
    }
);

export const fetchAgentStats = createAsyncThunk(
    'agents/fetchAgentStats',
    async ({ agentId, period }) => {
        const response = await agentsAPI.getStats(agentId, period);
        return response;
    }
);

const agentSlice = createSlice({
    name: 'agents',
    initialState: {
        list: [],
        currentAgent: null,
        stats: {},
        loading: false,
        error: null,
    },
    reducers: {
        setAgentStatus: (state, action) => {
            const agent = state.list.find(a => a.id === action.payload.agentId);
            if (agent) {
                agent.status = action.payload.status;
                agent.lastStatusChange = new Date().toISOString();
            }
        },
        setAgentCall: (state, action) => {
            const agent = state.list.find(a => a.id === action.payload.agentId);
            if (agent) {
                agent.currentCall = action.payload.call;
            }
        },
        clearAgentCall: (state, action) => {
            const agent = state.list.find(a => a.id === action.payload);
            if (agent) {
                agent.currentCall = null;
            }
        },
        setCurrentAgent: (state, action) => {
            state.currentAgent = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgents.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(updateAgentStatus.fulfilled, (state, action) => {
                const agent = state.list.find(a => a.id === action.payload.agentId);
                if (agent) {
                    agent.status = action.payload.status;
                }
            })
            .addCase(fetchAgentStats.fulfilled, (state, action) => {
                state.stats[action.payload.agentId] = action.payload;
            });
    },
});

export const {
    setAgentStatus,
    setAgentCall,
    clearAgentCall,
    setCurrentAgent,
} = agentSlice.actions;

export default agentSlice.reducer;