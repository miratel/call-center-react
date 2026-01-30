// src/services/socket.js
import { io } from 'socket.io-client';
import { store } from '../store';
import {
    addCall,
    updateCall,
    removeCall,
    setIncomingCall,
    clearIncomingCall,
    setCurrentCall,
} from '../store/slices/callSlice';
import {
    setAgentStatus,
    setAgentCall,
    clearAgentCall,
} from '../store/slices/agentSlice';
import toast from 'react-hot-toast';
import { playSound, stopSound } from './sound';

class SocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 3000;
        this.eventHandlers = new Map();
    }

    connect() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No auth token available');
            return;
        }

        this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', this.handleConnect.bind(this));
        this.socket.on('disconnect', this.handleDisconnect.bind(this));
        this.socket.on('connect_error', this.handleConnectError.bind(this));

        // Call events
        this.socket.on('call:new', this.handleNewCall.bind(this));
        this.socket.on('call:update', this.handleCallUpdate.bind(this));
        this.socket.on('call:end', this.handleCallEnd.bind(this));
        this.socket.on('call:ringing', this.handleCallRinging.bind(this));
        this.socket.on('call:answered', this.handleCallAnswered.bind(this));
        this.socket.on('call:held', this.handleCallHeld.bind(this));
        this.socket.on('call:unheld', this.handleCallUnheld.bind(this));
        this.socket.on('call:transfer', this.handleCallTransfer.bind(this));
        this.socket.on('call:conference', this.handleCallConference.bind(this));

        // Agent events
        this.socket.on('agent:status', this.handleAgentStatus.bind(this));
        this.socket.on('agent:login', this.handleAgentLogin.bind(this));
        this.socket.on('agent:logout', this.handleAgentLogout.bind(this));
        this.socket.on('agent:pause', this.handleAgentPause.bind(this));
        this.socket.on('agent:unpause', this.handleAgentUnpause.bind(this));

        // Queue events
        this.socket.on('queue:update', this.handleQueueUpdate.bind(this));
        this.socket.on('queue:member_added', this.handleQueueMemberAdded.bind(this));
        this.socket.on('queue:member_removed', this.handleQueueMemberRemoved.bind(this));

        // Campaign events
        this.socket.on('campaign:update', this.handleCampaignUpdate.bind(this));
        this.socket.on('campaign:lead_update', this.handleCampaignLeadUpdate.bind(this));

        // System events
        this.socket.on('system:alert', this.handleSystemAlert.bind(this));
        this.socket.on('system:status', this.handleSystemStatus.bind(this));
    }

    // Event handlers
    handleConnect() {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        toast.success('Connected to call server');

        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            this.socket.emit('agent:identify', { agentId: user.id, extension: user.extension });
        }
    }

    handleDisconnect(reason) {
        console.log('WebSocket disconnected:', reason);
        toast.error('Disconnected from call server');
    }

    handleConnectError(error) {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            toast.error('Failed to connect to call server. Please refresh the page.');
        }
    }

    handleNewCall(call) {
        console.log('New call:', call);
        store.dispatch(addCall(call));

        // If call is incoming to current agent
        const user = JSON.parse(localStorage.getItem('user'));
        if (call.destination === user?.extension || call.destination === user?.phone) {
            store.dispatch(setIncomingCall(call));
            playSound('ringtone');
            toast.custom((t) => (
                <div className="incoming-call-toast">
                    <div className="toast-header">
                        <strong>Incoming Call</strong>
                        <button onClick={() => toast.dismiss(t.id)}>×</button>
                    </div>
                    <div className="toast-body">
                        <div>From: {call.caller_id}</div>
                        <div>To: {call.destination}</div>
                        <div className="toast-actions">
                            <button className="btn-answer" onClick={() => this.answerCall(call.channel)}>
                                Answer
                            </button>
                            <button className="btn-reject" onClick={() => this.rejectCall(call.channel)}>
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            ), {
                duration: 30000,
                position: 'top-right',
            });
        }
    }

    handleCallUpdate(call) {
        store.dispatch(updateCall(call));

        // Update agent's current call
        if (call.linkedid && call.bridged) {
            const user = store.getState().auth.user;
            if (call.destination === user?.extension) {
                store.dispatch(setCurrentCall(call));
            }
        }
    }

    handleCallEnd({ uniqueid, cause }) {
        store.dispatch(removeCall(uniqueid));
        store.dispatch(clearIncomingCall());
        stopSound('ringtone');

        const currentCall = store.getState().calls.currentCall;
        if (currentCall?.uniqueid === uniqueid) {
            store.dispatch(setCurrentCall(null));
        }

        toast(`Call ended: ${cause || 'Normal clearing'}`, {
            icon: '📴',
        });
    }

    handleCallRinging(call) {
        store.dispatch(updateCall(call));
    }

    handleCallAnswered(call) {
        store.dispatch(updateCall(call));
        store.dispatch(clearIncomingCall());
        stopSound('ringtone');

        // Set as current call if it's for current agent
        const user = store.getState().auth.user;
        if (call.destination === user?.extension) {
            store.dispatch(setCurrentCall(call));
        }

        toast.success('Call answered');
    }

    handleCallHeld({ channel }) {
        toast('Call put on hold', { icon: '⏸️' });
    }

    handleCallUnheld({ channel }) {
        toast('Call resumed', { icon: '▶️' });
    }

    handleAgentStatus({ agentId, status, timestamp }) {
        store.dispatch(setAgentStatus({ agentId, status }));

        const agents = store.getState().agents.list;
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            toast(`${agent.name} is now ${status}`, {
                icon: '👤',
            });
        }
    }

    handleQueueUpdate(queue) {
        // Handle queue updates
        console.log('Queue updated:', queue);
    }

    // Emit methods
    makeCall(number) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:make', { number });
    }

    answerCall(channel) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:answer', { channel });
        store.dispatch(clearIncomingCall());
        stopSound('ringtone');
    }

    rejectCall(channel) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:reject', { channel });
        store.dispatch(clearIncomingCall());
        stopSound('ringtone');
    }

    hangupCall(channel) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:hangup', { channel });
    }

    holdCall(channel) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:hold', { channel });
    }

    unholdCall(channel) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:unhold', { channel });
    }

    transferCall(channel, extension) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:transfer', { channel, extension });
    }

    sendDTMF(channel, digits) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        this.socket.emit('call:dtmf', { channel, digits });
    }

    updateAgentStatus(status) {
        if (!this.socket?.connected) {
            toast.error('Not connected to server');
            return;
        }

        const user = store.getState().auth.user;
        this.socket.emit('agent:status', {
            agentId: user.id,
            status,
            timestamp: new Date().toISOString()
        });
    }

    // Subscription methods
    subscribe(event, handler) {
        if (!this.socket) return;

        this.socket.on(event, handler);
        this.eventHandlers.set(event, handler);
    }

    unsubscribe(event) {
        if (!this.socket) return;

        const handler = this.eventHandlers.get(event);
        if (handler) {
            this.socket.off(event, handler);
            this.eventHandlers.delete(event);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        // Clear all event handlers
        this.eventHandlers.clear();
    }
}

export default new SocketService();