// src/components/queues/QueueMonitor.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const QueueMonitor = () => {
    const queues = useSelector(state => state.queues.list);

    return (
        <div className="queue-monitor">
            <h3>Queue Monitor</h3>
            <div className="queues-list">
                {queues.map(queue => (
                    <div key={queue.id} className="queue-item">
                        <div className="queue-name">{queue.name}</div>
                        <div className="queue-stats">
                            <span className="waiting">Waiting: {queue.waiting_calls || 0}</span>
                            <span className="agents">Agents: {queue.agents_available || 0}</span>
                        </div>
                    </div>
                ))}
                {queues.length === 0 && (
                    <div className="no-queues">No queues configured</div>
                )}
            </div>
        </div>
    );
};

export default QueueMonitor;