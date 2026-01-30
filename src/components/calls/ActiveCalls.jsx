// src/components/calls/ActiveCalls.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const ActiveCalls = () => {
    const activeCalls = useSelector(state => state.calls.activeCalls);

    return (
        <div className="active-calls">
            <h3>Active Calls ({activeCalls.length})</h3>
            <div className="calls-list">
                {activeCalls.map(call => (
                    <div key={call.uniqueid} className="call-item">
                        <div className="call-direction">{call.direction}</div>
                        <div className="call-numbers">
                            {call.caller_id} → {call.destination}
                        </div>
                        <div className="call-status">{call.state}</div>
                        <div className="call-duration">{call.duration}s</div>
                    </div>
                ))}
                {activeCalls.length === 0 && (
                    <div className="no-calls">No active calls</div>
                )}
            </div>
        </div>
    );
};

export default ActiveCalls;