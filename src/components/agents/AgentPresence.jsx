// src/components/agents/AgentPresence.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const AgentPresence = () => {
    const agents = useSelector(state => state.agents.list);
    const onlineAgents = agents.filter(a => a.status !== 'offline').length;

    return (
        <div className="agent-presence">
            <div className="presence-indicator"></div>
            <div className="presence-info">
                <div className="online-count">{onlineAgents} online</div>
                <div className="total-count">{agents.length} total</div>
            </div>
        </div>
    );
};

export default AgentPresence;