// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    FiHome,
    FiPhone,
    FiUsers,
    FiList,
    FiUser,
    FiTarget,
    FiMic,
    FiBarChart2,
    FiSettings,
    FiMenu,
    FiLogOut,
    FiChevronDown
} from 'react-icons/fi';
import { logout } from '../store/slices/authSlice';

const Layout = ({ children }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const user = useSelector(state => state.auth.user);
    const activeCalls = useSelector(state => state.calls.activeCalls);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <FiHome /> },
        { path: '/calls', label: 'Calls', icon: <FiPhone />, badge: activeCalls.length },
        { path: '/agents', label: 'Agents', icon: <FiUsers /> },
        { path: '/queues', label: 'Queues', icon: <FiList /> },
        { path: '/contacts', label: 'Contacts', icon: <FiUser /> },
        { path: '/campaigns', label: 'Campaigns', icon: <FiTarget /> },
        { path: '/recordings', label: 'Recordings', icon: <FiMic /> },
        { path: '/reports', label: 'Reports', icon: <FiBarChart2 /> },
        { path: '/settings', label: 'Settings', icon: <FiSettings /> }
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>Call Center</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <FiMenu />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && (
                                <>
                                    <span className="nav-label">{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className="nav-badge">{item.badge}</span>
                                    )}
                                </>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {sidebarOpen && user && (
                        <div className="user-info-sidebar">
                            <div className="user-avatar-small">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="user-details">
                                <div className="user-name">{user.name}</div>
                                <div className="user-role">{user.role}</div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="main-header">
                    <div className="header-left">
                        <h1>{menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}</h1>
                    </div>

                    <div className="header-right">
                        <div className="user-menu">
                            <button
                                className="user-toggle"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="user-avatar">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="user-name">{user?.name || 'User'}</span>
                                <FiChevronDown />
                            </button>

                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <div className="user-info">
                                        <div className="user-email">{user?.email}</div>
                                        <div className="user-extension">Ext: {user?.extension}</div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={handleLogout}>
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;