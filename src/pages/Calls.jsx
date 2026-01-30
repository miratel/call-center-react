// src/pages/Calls.jsx
import React from 'react';
import ActiveCalls from '../components/calls/ActiveCalls';
import CallHistory from '../components/calls/CallHistory';
import CallPanel from '../components/calls/CallPanel';

const Calls = () => {
    return (
        <div className="calls-page">
            <h1>Call Management</h1>

            <div className="calls-grid">
                <div className="calls-left">
                    <ActiveCalls />
                    <CallHistory />
                </div>

                <div className="calls-right">
                    <CallPanel />
                </div>
            </div>
        </div>
    );
};

export default Calls;