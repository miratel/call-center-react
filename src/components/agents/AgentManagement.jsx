// src/components/agents/AgentManagement.jsx
import React, { useState } from 'react';

const AgentManagement = () => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="agent-management">
            <h3>Manage Agents</h3>
            <button
                className="btn-add-agent"
                onClick={() => setShowForm(true)}
            >
                Add Agent
            </button>
            <p>Agent management features coming soon...</p>
        </div>
    );
};

export default AgentManagement;