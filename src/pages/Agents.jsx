// src/pages/Agents.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAgents } from '../store/slices/agentSlice';
import AgentStatus from '../components/agents/AgentStatus';
import AgentManagement from '../components/agents/AgentManagement';
import toast from 'react-hot-toast';

const Agents = () => {
    const dispatch = useDispatch();
    const { list: agents, loading } = useSelector(state => state.agents);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            await dispatch(fetchAgents()).unwrap();
        } catch (error) {
            toast.error('Failed to load agents');
        }
    };

    return (
        <div className="agents-page">
            <div className="agents-header">
                <h1>Agent Management</h1>
                <button
                    className="btn-refresh"
                    onClick={loadAgents}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div className="agents-content">
                <div className="agents-left">
                    <AgentStatus agents={agents} />
                </div>

                <div className="agents-right">
                    <AgentManagement />
                </div>
            </div>
        </div>
    );
};

export default Agents;