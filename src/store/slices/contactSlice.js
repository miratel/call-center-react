// src/store/slices/contactSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactsAPI } from '../../services/api';

export const fetchContacts = createAsyncThunk(
    'contacts/fetchContacts',
    async (params) => {
        const response = await contactsAPI.getContacts(params);
        return response;
    }
);

const contactSlice = createSlice({
    name: 'contacts',
    initialState: {
        list: [],
        groups: [],
        selectedContact: null,
        loading: false,
        error: null,
        filters: {
            search: '',
            group: '',
        },
        pagination: {
            page: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 20,
        },
    },
    reducers: {
        setSelectedContact: (state, action) => {
            state.selectedContact = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        addContact: (state, action) => {
            state.list.unshift(action.payload);
        },
        updateContact: (state, action) => {
            const index = state.list.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
        },
        deleteContact: (state, action) => {
            state.list = state.list.filter(c => c.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContacts.fulfilled, (state, action) => {
                state.list = action.payload.contacts || [];
                state.pagination = action.payload.pagination || state.pagination;
            });
    },
});

export const {
    setSelectedContact,
    setFilters,
    setPagination,
    addContact,
    updateContact,
    deleteContact,
} = contactSlice.actions;

export default contactSlice.reducer;