// src/store/slices/campaignSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignsAPI } from '../../services/api';

export const fetchCampaigns = createAsyncThunk(
    'campaigns/fetchCampaigns',
    async (params) => {
        const response = await campaignsAPI.getCampaigns(params);
        return response;
    }
);

export const fetchCampaignLeads = createAsyncThunk(
    'campaigns/fetchCampaignLeads',
    async ({ campaignId, params }) => {
        const response = await campaignsAPI.getCampaignLeads(campaignId, params);
        return response;
    }
);

const campaignSlice = createSlice({
    name: 'campaigns',
    initialState: {
        list: [],
        selectedCampaign: null,
        campaignLeads: [],
        loading: false,
        error: null,
        filters: {
            status: '',
            search: '',
        },
        pagination: {
            page: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 10,
        },
    },
    reducers: {
        setSelectedCampaign: (state, action) => {
            state.selectedCampaign = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        updateCampaign: (state, action) => {
            const index = state.list.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
        },
        updateCampaignLead: (state, action) => {
            const { leadId, updates } = action.payload;
            const index = state.campaignLeads.findIndex(l => l.id === leadId);
            if (index !== -1) {
                state.campaignLeads[index] = { ...state.campaignLeads[index], ...updates };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.list = action.payload.campaigns || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchCampaignLeads.fulfilled, (state, action) => {
                state.campaignLeads = action.payload.leads || [];
            });
    },
});

export const {
    setSelectedCampaign,
    setFilters,
    setPagination,
    updateCampaign,
    updateCampaignLead,
} = campaignSlice.actions;

export default campaignSlice.reducer;