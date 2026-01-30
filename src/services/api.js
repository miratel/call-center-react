// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Dashboard API calls
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getAgents: () => api.get('/agents'),
    getActiveCalls: () => api.get('/calls/active'),
    simulateCall: () => api.post('/calls/simulate'),
};

// WebSocket service for real-time updates
export class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(SOCKET_URL);

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message;

        // Show error toast
        if (error.response?.status !== 401) {
            toast.error(message);
        }

        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    login: (username, password) =>
        api.post('/auth/login', { username, password }),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    getUserProfile: () => api.get('/auth/profile'),
};

// Calls API
export const callsAPI = {
    // Active calls
    getActiveCalls: () => api.get('/calls/active'),
    getCallHistory: (params) => api.get('/calls/history', { params }),
    getCallDetails: (uniqueid) => api.get(`/calls/${uniqueid}`),

    // Call actions
    makeCall: (number, extension) =>
        api.post('/calls/make', { number, extension }),
    hangup: (channel) => api.post('/calls/hangup', { channel }),
    answer: (channel) => api.post('/calls/answer', { channel }),
    hold: (channel) => api.post('/calls/hold', { channel }),
    unhold: (channel) => api.post('/calls/unhold', { channel }),
    transfer: (channel, extension) =>
        api.post('/calls/transfer', { channel, extension }),
    blindTransfer: (channel, number) =>
        api.post('/calls/blind-transfer', { channel, number }),
    attendedTransfer: (channel, targetChannel) =>
        api.post('/calls/attended-transfer', { channel, targetChannel }),

    // Conference
    createConference: (data) => api.post('/calls/conference', data),
    addToConference: (conferenceId, channel) =>
        api.post(`/calls/conference/${conferenceId}/add`, { channel }),
    removeFromConference: (conferenceId, channel) =>
        api.post(`/calls/conference/${conferenceId}/remove`, { channel }),

    // Call recording
    startRecording: (channel) => api.post('/calls/recording/start', { channel }),
    stopRecording: (channel) => api.post('/calls/recording/stop', { channel }),
    pauseRecording: (channel) => api.post('/calls/recording/pause', { channel }),
    resumeRecording: (channel) => api.post('/calls/recording/resume', { channel }),

    // Call notes
    addCallNote: (callId, note) =>
        api.post(`/calls/${callId}/notes`, { note }),
    getCallNotes: (callId) => api.get(`/calls/${callId}/notes`),

    // CDR Export
    exportCDR: (params) =>
        api.get('/calls/export', { params, responseType: 'blob' }),
};

// Agents API
export const agentsAPI = {
    getAgents: () => api.get('/agents'),
    getAgent: (agentId) => api.get(`/agents/${agentId}`),
    createAgent: (data) => api.post('/agents', data),
    updateAgent: (agentId, data) => api.put(`/agents/${agentId}`, data),
    deleteAgent: (agentId) => api.delete(`/agents/${agentId}`),

    // Status management
    updateStatus: (agentId, status) =>
        api.put(`/agents/${agentId}/status`, { status }),
    getStatus: (agentId) => api.get(`/agents/${agentId}/status`),

    // Stats
    getStats: (agentId, period = 'today') =>
        api.get(`/agents/${agentId}/stats`, { params: { period } }),

    // Pause reasons
    getPauseReasons: () => api.get('/agents/pause-reasons'),
    addPauseReason: (agentId, reason) =>
        api.post(`/agents/${agentId}/pause`, { reason }),

    // Login/Logout
    loginAgent: (extension, password) =>
        api.post('/agents/login', { extension, password }),
    logoutAgent: (agentId) => api.post(`/agents/${agentId}/logout`),
};

// Queues API
export const queuesAPI = {
    getQueues: () => api.get('/queues'),
    getQueue: (queueId) => api.get(`/queues/${queueId}`),
    createQueue: (data) => api.post('/queues', data),
    updateQueue: (queueId, data) => api.put(`/queues/${queueId}`, data),
    deleteQueue: (queueId) => api.delete(`/queues/${queueId}`),

    // Queue members
    getQueueMembers: (queueId) => api.get(`/queues/${queueId}/members`),
    addQueueMember: (queueId, agentId) =>
        api.post(`/queues/${queueId}/members`, { agentId }),
    removeQueueMember: (queueId, agentId) =>
        api.delete(`/queues/${queueId}/members/${agentId}`),

    // Queue stats
    getQueueStats: (queueId) => api.get(`/queues/${queueId}/stats`),
    getQueueCalls: (queueId, params) =>
        api.get(`/queues/${queueId}/calls`, { params }),

    // Queue settings
    updateQueueSettings: (queueId, settings) =>
        api.put(`/queues/${queueId}/settings`, settings),
};

// Contacts API
export const contactsAPI = {
    getContacts: (params) => api.get('/contacts', { params }),
    searchContacts: (query) => api.get('/contacts/search', { params: { q: query } }),
    getContact: (contactId) => api.get(`/contacts/${contactId}`),
    createContact: (data) => api.post('/contacts', data),
    updateContact: (contactId, data) => api.put(`/contacts/${contactId}`, data),
    deleteContact: (contactId) => api.delete(`/contacts/${contactId}`),
    importContacts: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/contacts/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    exportContacts: (params) =>
        api.get('/contacts/export', { params, responseType: 'blob' }),

    // Contact groups
    getContactGroups: () => api.get('/contacts/groups'),
    createContactGroup: (data) => api.post('/contacts/groups', data),
    updateContactGroup: (groupId, data) => api.put(`/contacts/groups/${groupId}`, data),
    deleteContactGroup: (groupId) => api.delete(`/contacts/groups/${groupId}`),
};

// Campaigns API
export const campaignsAPI = {
    getCampaigns: (params) => api.get('/campaigns', { params }),
    getCampaign: (campaignId) => api.get(`/campaigns/${campaignId}`),
    createCampaign: (data) => api.post('/campaigns', data),
    updateCampaign: (campaignId, data) => api.put(`/campaigns/${campaignId}`, data),
    deleteCampaign: (campaignId) => api.delete(`/campaigns/${campaignId}`),

    // Campaign actions
    startCampaign: (campaignId) => api.post(`/campaigns/${campaignId}/start`),
    pauseCampaign: (campaignId) => api.post(`/campaigns/${campaignId}/pause`),
    stopCampaign: (campaignId) => api.post(`/campaigns/${campaignId}/stop`),
    resumeCampaign: (campaignId) => api.post(`/campaigns/${campaignId}/resume`),

    // Campaign leads
    getCampaignLeads: (campaignId, params) =>
        api.get(`/campaigns/${campaignId}/leads`, { params }),
    addLeadToCampaign: (campaignId, leadId) =>
        api.post(`/campaigns/${campaignId}/leads`, { leadId }),
    removeLeadFromCampaign: (campaignId, leadId) =>
        api.delete(`/campaigns/${campaignId}/leads/${leadId}`),
    updateLeadStatus: (campaignId, leadId, status) =>
        api.put(`/campaigns/${campaignId}/leads/${leadId}/status`, { status }),

    // Campaign dialer
    getNextLead: (campaignId) => api.get(`/campaigns/${campaignId}/next-lead`),
    updateLeadResult: (campaignId, leadId, result) =>
        api.post(`/campaigns/${campaignId}/leads/${leadId}/result`, { result }),

    // Campaign stats
    getCampaignStats: (campaignId) => api.get(`/campaigns/${campaignId}/stats`),
};

// Recordings API
export const recordingsAPI = {
    getRecordings: (params) => api.get('/recordings', { params }),
    getRecording: (recordingId) => api.get(`/recordings/${recordingId}`),
    deleteRecording: (recordingId) => api.delete(`/recordings/${recordingId}`),
    downloadRecording: (recordingId) =>
        api.get(`/recordings/${recordingId}/download`, { responseType: 'blob' }),
    searchRecordings: (query) => api.get('/recordings/search', { params: { q: query } }),

    // Recording categories
    getRecordingCategories: () => api.get('/recordings/categories'),
    createRecordingCategory: (data) => api.post('/recordings/categories', data),
    updateRecordingCategory: (categoryId, data) =>
        api.put(`/recordings/categories/${categoryId}`, data),
    deleteRecordingCategory: (categoryId) =>
        api.delete(`/recordings/categories/${categoryId}`),
};

// IVR API
export const ivrAPI = {
    getIVRs: () => api.get('/ivr'),
    getIVR: (ivrId) => api.get(`/ivr/${ivrId}`),
    createIVR: (data) => api.post('/ivr', data),
    updateIVR: (ivrId, data) => api.put(`/ivr/${ivrId}`, data),
    deleteIVR: (ivrId) => api.delete(`/ivr/${ivrId}`),

    // IVR menus
    getIVRMenus: (ivrId) => api.get(`/ivr/${ivrId}/menus`),
    createIVRMenu: (ivrId, data) => api.post(`/ivr/${ivrId}/menus`, data),
    updateIVRMenu: (ivrId, menuId, data) =>
        api.put(`/ivr/${ivrId}/menus/${menuId}`, data),
    deleteIVRMenu: (ivrId, menuId) =>
        api.delete(`/ivr/${ivrId}/menus/${menuId}`),

    // IVR actions
    testIVR: (ivrId, input) => api.post(`/ivr/${ivrId}/test`, { input }),
};

// Reports API
export const reportsAPI = {
    // Agent reports
    getAgentReport: (params) => api.get('/reports/agents', { params }),
    getAgentPerformance: (agentId, params) =>
        api.get(`/reports/agents/${agentId}/performance`, { params }),

    // Queue reports
    getQueueReport: (params) => api.get('/reports/queues', { params }),

    // Campaign reports
    getCampaignReport: (campaignId, params) =>
        api.get(`/reports/campaigns/${campaignId}`, { params }),

    // Call reports
    getCallReport: (params) => api.get('/reports/calls', { params }),

    // Summary reports
    getSummaryReport: (params) => api.get('/reports/summary', { params }),
    getRealTimeReport: () => api.get('/reports/realtime'),

    // Export reports
    exportReport: (type, params) =>
        api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};

// System API
export const systemAPI = {
    getSystemStatus: () => api.get('/system/status'),
    getAsteriskStatus: () => api.get('/system/asterisk'),
    restartAsterisk: () => api.post('/system/asterisk/restart'),
    reloadConfig: () => api.post('/system/asterisk/reload'),

    // Logs
    getSystemLogs: (params) => api.get('/system/logs', { params }),
    getCallLogs: (params) => api.get('/system/logs/calls', { params }),

    // Backup
    createBackup: () => api.post('/system/backup'),
    restoreBackup: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/system/restore', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default api;