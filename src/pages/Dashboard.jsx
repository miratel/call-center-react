import React, { useState, useEffect, useRef } from 'react';
import { dashboardAPI, socketService } from '../services/api';
import { FiActivity, FiUsers, FiPhone, FiClock, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeCalls: 0,
        totalAgents: 0,
        availableAgents: 0,
        totalQueues: 0,
        avgWaitTime: 0
    });

    const [activeCalls, setActiveCalls] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    useEffect(() => {
        loadDashboardData();
        setupWebSocket();

        return () => {
            // Cleanup WebSocket listeners
            if (socketRef.current) {
                socketRef.current.off('call:new');
                socketRef.current.off('call:answered');
                socketRef.current.off('agent:statusChanged');
            }
        };
    }, []);

    const setupWebSocket = () => {
        const socket = socketService.connect();
        socketRef.current = socketService;

        // Handle new calls
        socketService.on('call:new', (newCall) => {
            setActiveCalls(prev => [...prev, newCall]);
            setStats(prev => ({ ...prev, activeCalls: prev.activeCalls + 1 }));
            toast(`📞 New call from ${newCall.callerId}`);
        });

        // Handle answered calls
        socketService.on('call:answered', (answeredCall) => {
            setActiveCalls(prev => prev.filter(call => call.id !== answeredCall.id));
            setStats(prev => ({ ...prev, activeCalls: Math.max(0, prev.activeCalls - 1) }));
        });

        // Handle agent status changes
        socketService.on('agent:statusChanged', ({ agentId, status }) => {
            setAgents(prev => prev.map(agent =>
                agent.id === agentId ? { ...agent, status } : agent
            ));
        });
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, agentsRes, callsRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getAgents(),
                dashboardAPI.getActiveCalls()
            ]);

            // Handle potential undefined responses
            const statsData = statsRes?.data || { activeCalls: 0, totalAgents: 0, availableAgents: 0, totalQueues: 0, avgWaitTime: 0 };
            const agentsData = agentsRes?.data || [];
            const callsData = callsRes?.data || [];

            setStats(statsData);
            setAgents(agentsData);
            setActiveCalls(callsData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data. Using demo data.');

            // Fallback demo data
            setStats({
                activeCalls: 2,
                totalAgents: 5,
                availableAgents: 3,
                totalQueues: 2,
                avgWaitTime: 45
            });

            setAgents([
                { id: 1, name: 'John Doe', extension: '1001', status: 'available', callsAnswered: 5 },
                { id: 2, name: 'Jane Smith', extension: '1002', status: 'busy', callsAnswered: 8 },
                { id: 3, name: 'Bob Johnson', extension: '1003', status: 'available', callsAnswered: 12 }
            ]);

            setActiveCalls([
                { id: 1, callerId: '+1234567890', destination: '1000', direction: 'inbound', status: 'ringing', startTime: new Date().toISOString() },
                { id: 2, callerId: '+1987654321', destination: '1001', direction: 'inbound', status: 'answered', startTime: new Date().toISOString(), agentId: 1 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateCall = async () => {
        try {
            await dashboardAPI.simulateCall();
            toast.success('Simulated a new incoming call');
        } catch (error) {
            console.error('Failed to simulate call:', error);
            toast.error('Failed to simulate call. Backend might not be running.');

            // Fallback: Add a demo call
            const demoCall = {
                id: Date.now(),
                callerId: `+1${Math.floor(Math.random() * 900000000) + 100000000}`,
                destination: '1000',
                direction: 'inbound',
                status: 'ringing',
                startTime: new Date().toISOString(),
            };
            setActiveCalls(prev => [...prev, demoCall]);
            setStats(prev => ({ ...prev, activeCalls: prev.activeCalls + 1 }));
            toast(`📞 Demo call from ${demoCall.callerId}`);
        }
    };

    const handleAnswerCall = (callId) => {
        if (socketService.isConnected()) {
            socketService.emit('call:answer', {
                callId,
                agentId: 1
            });
            toast.success('Call answered');
        } else {
            // Fallback for demo
            setActiveCalls(prev => prev.filter(call => call.id !== callId));
            setStats(prev => ({ ...prev, activeCalls: Math.max(0, prev.activeCalls - 1) }));
            toast.success('Call answered (demo mode)');
        }
    };

    const handleUpdateAgentStatus = (agentId, status) => {
        if (socketService.isConnected()) {
            socketService.emit('agent:updateStatus', { agentId, status });
        }
        // Update local state regardless
        setAgents(prev => prev.map(agent =>
            agent.id === agentId ? { ...agent, status } : agent
        ));
    };

    const statCards = [
        { title: 'Active Calls', value: stats.activeCalls, icon: <FiActivity />, color: 'blue' },
        { title: 'Available Agents', value: stats.availableAgents, icon: <FiUsers />, color: 'green' },
        { title: 'Total Agents', value: stats.totalAgents, icon: <FiUsers />, color: 'purple' },
        { title: 'Avg Wait Time', value: `${Math.round(stats.avgWaitTime)}s`, icon: <FiClock />, color: 'orange' },
        { title: 'Total Queues', value: stats.totalQueues, icon: <FiTrendingUp />, color: 'teal' },
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

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
                                    <div className={`call-status ${call.status}`}>{call.status}</div>
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
                        {activeCalls.length === 0 && (
                            <div className="no-calls">No active calls</div>
                        )}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h3>Agent Status ({agents.filter(a => a.status === 'available').length} available)</h3>
                    <div className="agents-list">
                        {agents.map(agent => (
                            <div key={agent.id} className={`agent-item ${agent.status}`}>
                                <div className="agent-info">
                                    <div className="agent-name">{agent.name}</div>
                                    <div className="agent-details">
                                        <span className="agent-extension">Ext: {agent.extension}</span>
                                        <span className="agent-calls">Calls: {agent.callsAnswered}</span>
                                    </div>
                                </div>
                                <div className="agent-status-controls">
                                    <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                                    <select
                                        value={agent.status}
                                        onChange={(e) => handleUpdateAgentStatus(agent.id, e.target.value)}
                                        className="status-select"
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