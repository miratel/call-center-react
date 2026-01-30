// src/components/agents/AgentStatus.jsx
import React from 'react';

const AgentStatus = ({ agents = [] }) => {
    return (
        <div className="agent-status">
            <h3>Agent Status</h3>
            <div className="agents-list">
                {agents.map(agent => (
                    <div key={agent.id} className={`agent-card ${agent.status}`}>
                        <div className="agent-info">
                            <div className="agent-name">{agent.name}</div>
                            <div className="agent-extension">Ext: {agent.extension}</div>
                        </div>
                        <div className={`status-indicator ${agent.status}`}>
                            {agent.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentStatus;