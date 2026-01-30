// src/components/calls/CallPanel.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    FiPhoneOff,
    FiPause,
    FiMic,
    FiMicOff,
    FiUserPlus,
    FiVolume2,
    FiVolumeX,
    FiKey,
    FiMessageSquare
} from 'react-icons/fi';
import {
    BsRecordCircle,
    BsRecordCircleFill,
    BsTelephoneForward
} from 'react-icons/bs';
import socketService from '../../services/socket';
import { callsAPI } from '../../services/api';
import { setCurrentCall, clearCurrentCall } from '../../store/slices/callSlice';
import toast from 'react-hot-toast';

const CallPanel = () => {
    const dispatch = useDispatch();
    const [dtmfInput, setDtmfInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transferTo, setTransferTo] = useState('');
    const [showTransfer, setShowTransfer] = useState(false);
    const [showDTMF, setShowDTMF] = useState(false);
    const [callNote, setCallNote] = useState('');

    const currentCall = useSelector(state => state.calls.currentCall);
    const agents = useSelector(state => state.agents.list);
    const user = useSelector(state => state.auth.user);

    const formatDuration = (seconds) => {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleHangup = async () => {
        if (!currentCall) return;

        try {
            await callsAPI.hangup(currentCall.channel);
            dispatch(clearCurrentCall());
            toast.success('Call ended');
        } catch (error) {
            toast.error('Failed to hangup call');
        }
    };

    const handleHold = async () => {
        if (!currentCall) return;

        try {
            if (isOnHold) {
                await callsAPI.unhold(currentCall.channel);
                setIsOnHold(false);
                toast('Call resumed', { icon: '▶️' });
            } else {
                await callsAPI.hold(currentCall.channel);
                setIsOnHold(true);
                toast('Call put on hold', { icon: '⏸️' });
            }
        } catch (error) {
            toast.error(`Failed to ${isOnHold ? 'unhold' : 'hold'} call`);
        }
    };

    const handleMute = () => {
        setIsMuted(!isMuted);
        // Implement mute via WebSocket
        socketService.sendDTMF(currentCall.channel, isMuted ? 'unmute' : 'mute');
    };

    const handleTransfer = async () => {
        if (!currentCall || !transferTo) return;

        try {
            await callsAPI.transfer(currentCall.channel, transferTo);
            setShowTransfer(false);
            setTransferTo('');
            toast.success(`Transferring to ${transferTo}`);
        } catch (error) {
            toast.error('Failed to transfer call');
        }
    };

    const handleBlindTransfer = async () => {
        if (!currentCall || !transferTo) return;

        try {
            await callsAPI.blindTransfer(currentCall.channel, transferTo);
            setShowTransfer(false);
            setTransferTo('');
            toast.success(`Blind transferring to ${transferTo}`);
        } catch (error) {
            toast.error('Failed to blind transfer call');
        }
    };

    const handleStartRecording = async () => {
        if (!currentCall) return;

        try {
            if (isRecording) {
                await callsAPI.stopRecording(currentCall.channel);
                setIsRecording(false);
                toast('Recording stopped', { icon: '⏹️' });
            } else {
                await callsAPI.startRecording(currentCall.channel);
                setIsRecording(true);
                toast('Recording started', { icon: '🔴' });
            }
        } catch (error) {
            toast.error(`Failed to ${isRecording ? 'stop' : 'start'} recording`);
        }
    };

    const handleSendDTMF = (digit) => {
        if (!currentCall) return;

        socketService.sendDTMF(currentCall.channel, digit);
        setDtmfInput(prev => prev + digit);
    };

    const handleSaveNote = async () => {
        if (!currentCall || !callNote.trim()) return;

        try {
            await callsAPI.addCallNote(currentCall.uniqueid, callNote);
            toast.success('Note saved');
            setCallNote('');
        } catch (error) {
            toast.error('Failed to save note');
        }
    };

    const handleConference = async () => {
        if (!currentCall) return;

        try {
            const conferenceId = prompt('Enter conference room number:');
            if (conferenceId) {
                await callsAPI.addToConference(conferenceId, currentCall.channel);
                toast.success(`Added to conference ${conferenceId}`);
            }
        } catch (error) {
            toast.error('Failed to create conference');
        }
    };

    if (!currentCall) {
        return (
            <div className="call-panel idle">
                <div className="no-active-call">
                    <div className="call-icon">
                        <FiPhoneOff size={48} />
                    </div>
                    <h4>No Active Call</h4>
                    <p>Make or receive a call to see controls here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="call-panel active">
            {/* Call Header */}
            <div className="call-header">
                <div className="call-info">
                    <div className="call-direction">
                        {currentCall.direction === 'inbound' ? 'Incoming' : 'Outgoing'}
                    </div>
                    <div className="call-numbers">
                        <span className="caller">{currentCall.caller_id || 'Unknown'}</span>
                        <span className="call-arrow">→</span>
                        <span className="callee">{currentCall.destination}</span>
                    </div>
                    <div className="call-duration">
                        {formatDuration(currentCall.duration)}
                    </div>
                </div>

                <div className="call-status">
                    <span className={`status-badge ${currentCall.state}`}>
                        {currentCall.state}
                    </span>
                    {isOnHold && <span className="hold-badge">On Hold</span>}
                    {isRecording && <span className="recording-badge">Recording</span>}
                </div>
            </div>

            {/* Call Controls */}
            <div className="call-controls">
                <div className="control-row">
                    <button
                        className={`control-btn ${isMuted ? 'active' : ''}`}
                        onClick={handleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <FiMicOff /> : <FiMic />}
                    </button>

                    <button
                        className={`control-btn ${isOnHold ? 'active' : ''}`}
                        onClick={handleHold}
                        title={isOnHold ? 'Resume' : 'Hold'}
                    >
                        <FiPause />
                    </button>

                    <button
                        className="control-btn"
                        onClick={() => setShowDTMF(!showDTMF)}
                        title="DTMF Pad"
                    >
                        <FiKey />
                    </button>

                    <button
                        className={`control-btn ${isRecording ? 'recording' : ''}`}
                        onClick={handleStartRecording}
                        title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                        {isRecording ? <BsRecordCircleFill /> : <BsRecordCircle />}
                    </button>

                    <button
                        className="control-btn"
                        onClick={() => setShowTransfer(!showTransfer)}
                        title="Transfer"
                    >
                        <BsTelephoneForward />
                    </button>

                    <button
                        className="control-btn"
                        onClick={handleConference}
                        title="Conference"
                    >
                        <FiUserPlus />
                    </button>

                    <button
                        className="control-btn hangup"
                        onClick={handleHangup}
                        title="Hangup"
                    >
                        <FiPhoneOff />
                    </button>
                </div>

                {/* DTMF Pad */}
                {showDTMF && (
                    <div className="dtmf-pad">
                        <div className="dtmf-display">
                            <input
                                type="text"
                                value={dtmfInput}
                                readOnly
                                placeholder="DTMF digits"
                            />
                        </div>
                        <div className="dtmf-buttons">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
                                <button
                                    key={digit}
                                    className="dtmf-btn"
                                    onClick={() => handleSendDTMF(digit)}
                                >
                                    {digit}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transfer Panel */}
                {showTransfer && (
                    <div className="transfer-panel">
                        <div className="transfer-header">
                            <h5>Transfer Call</h5>
                            <button
                                className="close-btn"
                                onClick={() => setShowTransfer(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="transfer-content">
                            <div className="form-group">
                                <label>Transfer to:</label>
                                <select
                                    value={transferTo}
                                    onChange={(e) => setTransferTo(e.target.value)}
                                >
                                    <option value="">Select agent or extension</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.extension}>
                                            {agent.name} ({agent.extension})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="transfer-actions">
                                <button
                                    className="btn-transfer"
                                    onClick={handleTransfer}
                                    disabled={!transferTo}
                                >
                                    Attended Transfer
                                </button>
                                <button
                                    className="btn-blind-transfer"
                                    onClick={handleBlindTransfer}
                                    disabled={!transferTo}
                                >
                                    Blind Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Call Notes */}
            <div className="call-notes">
                <div className="notes-header">
                    <h5>
                        <FiMessageSquare /> Call Notes
                    </h5>
                </div>
                <div className="notes-editor">
                    <textarea
                        value={callNote}
                        onChange={(e) => setCallNote(e.target.value)}
                        placeholder="Add notes about this call..."
                        rows={3}
                    />
                    <button
                        className="btn-save-note"
                        onClick={handleSaveNote}
                        disabled={!callNote.trim()}
                    >
                        Save Note
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <button className="action-btn">Schedule Callback</button>
                <button className="action-btn">Create Ticket</button>
                <button className="action-btn">View Contact</button>
                <button className="action-btn">Send Email</button>
            </div>
        </div>
    );
};

export default CallPanel;