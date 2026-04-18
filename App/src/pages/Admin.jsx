import React, { useState, useEffect } from 'react';
import { eventApi, adminApi } from '../utils/api';
import { toast } from 'react-toastify';

/**
 * Admin Dashboard View
 * 
 * Protected route component exclusively for users with the 'admin' role.
 * Allows administrators to manage all users (removing access) and all events 
 * (approving pending events, deleting inappropriate events).
 */
const Admin = () => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            if (!userInfo || userInfo.role !== 'admin') {
                return; // Early return if not admin
            }
            try {
                // Fetch events for admin (includes pending)
                const data = await eventApi.getEvents();
                setEvents(data);

                // Fetch users
                const usersData = await adminApi.getUsers();
                setUsers(usersData);
            } catch (error) {
                toast.error("Failed to load admin data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await adminApi.approveEvent(id);
            // Update local state
            setEvents(events.map(e => e._id === id ? { ...e, isApproved: true } : e));
            toast.success("Event approved successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Approval failed");
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await eventApi.deleteEvent(id);
            setEvents(events.filter(e => e._id !== id));
            toast.success("Event deleted successfully!");
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to delete event");
        }
    };

    const handleDeleteUser = async (id) => {
        const isSelf = id === userInfo._id;
        const confirmMessage = isSelf
            ? 'Are you sure you want to delete YOUR own account? You will be logged out immediately.'
            : 'Are you sure you want to remove this user\'s access?';

        if (window.confirm(confirmMessage)) {
            try {
                await adminApi.deleteUser(id);
                if (isSelf) {
                    sessionStorage.removeItem('user');
                    window.location.href = '/login';
                } else {
                    setUsers(users.filter(u => u._id !== id));
                    toast.success("User access removed successfully!");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to remove user access");
            }
        }
    };

    if (!userInfo || userInfo.role !== 'admin') {
        return <div className="container" style={{ paddingTop: '2rem' }}>Access Denied. Admins only.</div>;
    }

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="premium-card">
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Admin Dashboard</h2>

                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>User Management</h3>
                <div style={{ marginBottom: '3rem', overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', backgroundColor: 'rgba(0, 243, 255, 0.05)', borderBottom: '1px solid var(--primary-color)' }}>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontFamily: 'Audiowide' }}>Name</th>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontFamily: 'Audiowide' }}>Email</th>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontFamily: 'Audiowide' }}>Role</th>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontFamily: 'Audiowide' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', transition: 'background 0.3s' }}>
                                    <td style={{ padding: '1rem' }}>{user.name}</td>
                                    <td style={{ padding: '1rem' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            border: '1px solid var(--primary-color)',
                                            color: user.role === 'admin' ? 'var(--secondary-color)' : 'var(--text-muted)',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            boxShadow: user.role === 'admin' ? '0 0 5px var(--secondary-color)' : 'none'
                                        }}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            className="premium-button"
                                            style={{
                                                width: 'auto',
                                                background: 'transparent',
                                                border: '1px solid #ff4444',
                                                color: '#ff4444',
                                                fontSize: '0.85rem',
                                                padding: '0.4rem 0.8rem',
                                                boxShadow: 'none'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = '#ff4444';
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.boxShadow = '0 0 10px #ff4444';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#ff4444';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            onClick={() => handleDeleteUser(user._id)}
                                        >
                                            {user._id === userInfo._id ? 'Delete My Account' : 'Remove Access'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <h3 style={{ marginBottom: '1rem' }}>Event Approvals</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left' }}>
                            <th>Image</th>
                            <th>Event Name</th>
                            <th>Organizer</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => {
                            const seed = encodeURIComponent(event?._id || event?.title || event?.location || 'event');
                            const seededFallback = `https://picsum.photos/seed/${seed}/1200/675`;
                            
                            const rawImages = (event?.images?.length ? event.images : [event?.image || seededFallback]).filter(Boolean);
                            const sliderImages = rawImages.map(img => {
                                if (img && typeof img === 'string' && !img.startsWith('http')) {
                                    return `http://localhost:5000/${img}`;
                                }
                                return img;
                            });
                            const finalSrc = sliderImages[0];
                            
                            return (
                                <tr key={event._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <img src={finalSrc} alt={event.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '1rem' }}>{event.title}</td>
                                    <td style={{ padding: '1rem' }}>{event.organizer?.name || 'Unknown'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        color: event.isApproved ? 'green' : 'orange',
                                        fontWeight: 'bold'
                                    }}>
                                        {event.isApproved ? 'Live' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {!event.isApproved && (
                                        <button
                                            className="premium-button"
                                            style={{ width: 'auto', marginRight: '1rem' }}
                                            onClick={() => handleApprove(event._id)}
                                        >
                                            Approve
                                        </button>
                                    )}
                                    <button
                                        className="premium-button"
                                        style={{ width: 'auto', background: 'red' }}
                                        onClick={() => handleDeleteEvent(event._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;