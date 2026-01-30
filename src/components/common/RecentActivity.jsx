// src/components/common/RecentActivity.jsx
import React from 'react';

const RecentActivity = () => {
    return (
        <div className="recent-activity">
            <h4>Recent Activity</h4>
            <div className="activity-list">
                <div className="activity-item">
                    <div className="activity-time">10:30 AM</div>
                    <div className="activity-desc">Agent John answered call from +1234567890</div>
                </div>
                <div className="activity-item">
                    <div className="activity-time">10:25 AM</div>
                    <div className="activity-desc">Call transferred to extension 101</div>
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;