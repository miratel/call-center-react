// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActiveCalls } from '../store/slices/callSlice';
import { fetchAgents } from '../store/slices/agentSlice';
import { fetchQueues } from '../store/slices/queueSlice';
import ActiveCalls from '../components/calls/ActiveCalls';
import CallPanel from '../components/calls/CallPanel';
import AgentStatus from '../components/agents/AgentStatus';
import QueueMonitor from '../components/queues/QueueMonitor';
import RealTimeChart from '../components/common/RealTimeChart';
import RecentActivity from '../components/common/RecentActivity';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { activeCalls } = useSelector(state => state.calls);
    const { list: agents } = useSelector(state => state.agents);
    const { list: queues } = useSelector(state => state.queues);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            await Promise.all([
                dispatch(fetchActiveCalls()),
                dispatch(fetchAgents()),
                dispatch(fetchQueues()),
            ]);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        }
    };

    const statCards = [
        {
            title: 'Active Calls',
            value: activeCalls.length,
            color: 'blue',
        },
        {
            title: 'Agents Online',
            value: agents.filter(a => a.status !== 'offline').length,
            color: 'green',
        },
        {
            title: 'Total Agents',
            value: agents.length,
            color: 'purple',
        },
        {
            title: 'Queues',
            value: queues.length,
            color: 'orange',
        },
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Call Center Dashboard</h1>
                <button className="btn-refresh" onClick={loadDashboardData}>
                    Refresh
                </button>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-title">{stat.title}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <div className="dashboard-left">
                    <div className="dashboard-section">
                        <h3>Active Calls</h3>
                        <ActiveCalls />
                    </div>

                    <div className="dashboard-section">
                        <h3>Call Panel</h3>
                        <CallPanel />
                    </div>
                </div>

                <div className="dashboard-middle">
                    <div className="dashboard-section">
                        <h3>Real-time Metrics</h3>
                        <RealTimeChart />
                    </div>

                    <div className="dashboard-section">
                        <h3>Agent Status</h3>
                        <AgentStatus agents={agents} />
                    </div>
                </div>

                <div className="dashboard-right">
                    <div className="dashboard-section">
                        <h3>Queue Monitor</h3>
                        <QueueMonitor />
                    </div>

                    <div className="dashboard-section">
                        <h3>Recent Activity</h3>
                        <RecentActivity />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;