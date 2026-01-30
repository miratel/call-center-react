// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dashboardAPI } from '../services/api';
import { SocketService } from '../services/api';
import {
    FiActivity,
    FiUsers,
    FiPhone,
    FiClock,
    FiTrendingUp
} from 'react-icons/fi';
import { addCall, removeCall, setCurrentCall } from '../store/slices/callSlice';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const dispatch = useDispatch();
    const [stats, setStats] = useState({
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        averageTalkTime: 0,
        activeCalls: 0,
        totalAgents: 0,
        availableAgents: 0,
        totalQueues: 0,
        avgWaitTime: 0
    });
    const [demoActive, setDemoActive] = useState(false);

    const [activeCalls, setActiveCalls] = useState([]);
    const [agents, setAgents] = useState([]);
    const [socketService, setSocketService] = useState(null);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        // Load initial data
        loadDashboardData();
        // Connect to WebSocket
        const socket = new SocketService();
        socket.connect();
        setSocketService(socket);
        // Set up WebSocket listeners
        socket.on('call:new', (newCall) => {
            setActiveCalls(prev => [...prev, newCall]);
            setStats(prev => ({ ...prev, activeCalls: prev.activeCalls + 1 }));
            toast(`New incoming call from ${newCall.callerId}`);
        });

        socket.on('call:answered', (answeredCall) => {
            setActiveCalls(prev => prev.filter(call => call.id !== answeredCall.id));
            setStats(prev => ({ ...prev, activeCalls: prev.activeCalls - 1 }));
        });

        socket.on('agent:statusChanged', ({ agentId, status }) => {
            setAgents(prev => prev.map(agent =>
                agent.id === agentId ? { ...agent, status } : agent
            ));
        });
        return () => {
            if (socketService) {
                socketService.disconnect();
            }
        };
        // Simulate initial data
        const interval = setInterval(() => {
            if (demoActive && Math.random() > 0.7) {
                const newCall = {
                    id: Date.now(),
                    caller_id: `+1${Math.floor(Math.random() * 900000000) + 100000000}`,
                    destination: user?.extension || '1001',
                    direction: 'inbound',
                    state: 'ringing',
                    duration: 0,
                    timestamp: new Date().toISOString(),
                };
                dispatch(addCall(newCall));
                toast(`Incoming call from ${newCall.caller_id}`);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [demoActive, dispatch, user]);

    const loadDashboardData = async () => {
        try {
            const [statsRes, agentsRes, callsRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getAgents(),
                dashboardAPI.getActiveCalls()
            ]);

            setStats(statsRes.data);
            setAgents(agentsRes.data);
            setActiveCalls(callsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        }
    };

    const handleSimulateCall = async () => {
        try {
            await dashboardAPI.simulateCall();
            toast.success('Simulated a new incoming call');
        } catch (error) {
            toast.error('Failed to simulate call');
        }
    };

    const handleStartDemo = () => {
        setDemoActive(true);
        toast.success('Demo mode started');
    };

    const handleStopDemo = () => {
        setDemoActive(false);
        activeCalls.forEach(call => {
            dispatch(removeCall(call.id));
        });
        toast.success('Demo mode stopped');
    };

    const handleAnswerCall = (callId) => {
        if (socketService) {
            socketService.emit('call:answer', {
                callId,
                agentId: 1 // In a real app, use the logged-in agent's ID
            });
            toast.success('Call answered');
        }
    };
    const handleUpdateAgentStatus = (agentId, status) => {
        if (socketService) {
            socketService.emit('agent:updateStatus', { agentId, status });
        }
    };

    const statCards = [
        { title: 'Active Calls', value: stats.activeCalls, icon: <FiActivity />, color: 'blue' },
        { title: 'Available Agents', value: stats.availableAgents, icon: <FiUsers />, color: 'green' },
        { title: 'Total Agents', value: stats.totalAgents, icon: <FiUsers />, color: 'purple' },
        { title: 'Avg Wait Time', value: `${Math.round(stats.avgWaitTime)}s`, icon: <FiClock />, color: 'orange' },
        { title: 'Total Queues', value: stats.totalQueues, icon: <FiTrendingUp />, color: 'teal' },
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Call Center Dashboard</h1>
                <div className="dashboard-actions">
                    <button className="btn-simulate" onClick={handleSimulateCall}>
                        Simulate Call
                    </button>
                    <button className="btn-refresh" onClick={loadDashboardData}>
                        Refresh Data
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-title">{stat.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <div className="dashboard-section">
                    <h3>Active Calls ({activeCalls.length})</h3>
                    <div className="calls-list">
                        {activeCalls.map(call => (
                            <div key={call.id} className="call-item">
                                <div className="call-info">
                                    <div className="call-direction">{call.direction}</div>
                                    <div className="call-numbers">
                                        <span className="caller">{call.callerId}</span>
                                        <span className="call-arrow">→</span>
                                        <span className="callee">{call.destination}</span>
                                    </div>
                                    <div className="call-status">{call.status}</div>
                                </div>
                                {call.status === 'ringing' && (
                                    <button
                                        className="btn-answer"
                                        onClick={() => handleAnswerCall(call.id)}
                                    >
                                        Answer
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h3>Agent Status</h3>
                    <div className="agents-list">
                        {agents.map(agent => (
                            <div key={agent.id} className={`agent-item ${agent.status}`}>
                                <div className="agent-info">
                                    <div className="agent-name">{agent.name}</div>
                                    <div className="agent-extension">Ext: {agent.extension}</div>
                                    <div className="agent-stats">Calls: {agent.callsAnswered}</div>
                                </div>
                                <div className="agent-status-controls">
                                    <select
                                        value={agent.status}
                                        onChange={(e) => handleUpdateAgentStatus(agent.id, e.target.value)}
                                    >
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="away">Away</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;