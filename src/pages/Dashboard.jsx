// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
    });
    const [demoActive, setDemoActive] = useState(false);

    const { activeCalls } = useSelector(state => state.calls);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
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

    const handleAnswerCall = (call) => {
        dispatch(setCurrentCall(call));
        dispatch(removeCall(call.id));
        toast.success(`Answered call from ${call.caller_id}`);
    };

    const statCards = [
        {
            title: 'Active Calls',
            value: activeCalls.length,
            icon: <FiActivity />,
            color: 'blue',
        },
        {
            title: 'Agents Online',
            value: '3',
            icon: <FiUsers />,
            color: 'green',
        },
        {
            title: 'Calls Today',
            value: '42',
            icon: <FiPhone />,
            color: 'purple',
        },
        {
            title: 'Avg Talk Time',
            value: '3m 24s',
            icon: <FiClock />,
            color: 'orange',
        },
        {
            title: 'Service Level',
            value: '92%',
            icon: <FiTrendingUp />,
            color: 'teal',
        },
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Call Center Dashboard</h1>
                <div className="dashboard-actions">
                    <button
                        className={`btn-demo ${demoActive ? 'active' : ''}`}
                        onClick={demoActive ? handleStopDemo : handleStartDemo}
                    >
                        {demoActive ? 'Stop Demo' : 'Start Demo'}
                    </button>
                    <button className="btn-refresh">
                        Refresh
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
                <div className="dashboard-left">
                    <div className="dashboard-section">
                        <h3>Active Calls ({activeCalls.length})</h3>
                        <div className="calls-list">
                            {activeCalls.map(call => (
                                <div key={call.id} className="call-item">
                                    <div className="call-info">
                                        <div className="call-direction">{call.direction}</div>
                                        <div className="call-numbers">
                                            <span className="caller">{call.caller_id}</span>
                                            <span className="call-arrow">→</span>
                                            <span className="callee">{call.destination}</span>
                                        </div>
                                        <div className="call-status">{call.state}</div>
                                    </div>
                                    {call.state === 'ringing' && (
                                        <button
                                            className="btn-answer"
                                            onClick={() => handleAnswerCall(call)}
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
                </div>

                <div className="dashboard-middle">
                    <div className="dashboard-section">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions-grid">
                            <button className="quick-action">
                                <FiPhone /> Make Call
                            </button>
                            <button className="quick-action">
                                <FiUsers /> View Agents
                            </button>
                            <button className="quick-action">
                                <FiActivity /> View Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;