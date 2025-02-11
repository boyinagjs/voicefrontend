import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Users() {
    const [users, setUsers] = useState(null); // Initially null for loading check
    const [role, setRole] = useState(localStorage.getItem("role"));
    const [search, setSearch] = useState(""); // Search query state
    const userid = Cookies.get("userid");
    const navigate = useNavigate();

    if (!userid || role === "client") {
        navigate('/login');
    }

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let response;
                if (role === "admin") {
                    response = await axios.get(`https://voicebackend-1dix.onrender.com/api/users/admin/all-clients/${userid}`);
                } else {
                    response = await axios.get(`https://voicebackend-1dix.onrender.com/api/users/super-admin/all-users`);
                }
                setUsers(response.data); // Set users after fetching
            } catch (error) {
                console.error("Error fetching users:", error);
                setUsers({ admins: [], clients: [] }); // Prevent crash
            }
        };
        fetchUsers();
    }, [role, userid]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleDelete = async (userId) => {
        try {
            // Make the API call to delete the user
            const response = await axios.delete(`https://voicebackend-1dix.onrender.com/api/users/${userId}`);

            if (response.status === 200) {
                // Successfully deleted, now remove the user from the local state
                setUsers((prevUsers) => {
                    // Remove deleted user from both admins and clients
                    const updatedAdmins = prevUsers.admins.filter(user => user._id !== userId);
                    const updatedClients = prevUsers.clients.filter(user => user._id !== userId);
                    return { admins: updatedAdmins, clients: updatedClients };
                });
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    if (!users) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
            </div>
        );
    }

    // Filter all users (including inactive ones) based on email search
    const filteredAdmins = users.admins?.filter(user => user.email.toLowerCase().includes(search.toLowerCase())) || [];
    const filteredClients = users.clients?.filter(user => user.email.toLowerCase().includes(search.toLowerCase())) || [];

    // Filter Active Users (Based on expiresAt)
    const currentTime = new Date();
    const activeAdmins = filteredAdmins.filter(user => new Date(user.expiresAt) > currentTime);
    const activeClients = filteredClients.filter(user => new Date(user.expiresAt) > currentTime);

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>User Management</h1>

            {/* Search Input */}
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search by email"
                    value={search}
                    onChange={handleSearchChange}
                    style={styles.searchInput}
                />
            </div>

            {role === "superadmin" && (
                <>
                    <Section title="Active Admins" users={activeAdmins} onDelete={handleDelete} />
                    <Section title="Active Clients" users={activeClients} onDelete={handleDelete} />
                    <Section title="All Admins" users={filteredAdmins} onDelete={handleDelete} />
                    <Section title="All Clients" users={filteredClients} onDelete={handleDelete} />
                </>
            )}

            {role === "admin" && (
                <>
                    <Section title="Active Clients" users={activeClients} onDelete={handleDelete} />
                    <Section title="All Clients" users={filteredClients} onDelete={handleDelete} />
                </>
            )}
        </div>
    );
}

// User List Component
const Section = ({ title, users, onDelete }) => {
    return (
        <div style={styles.section}>
            <h2 style={styles.subHeader}>{title}</h2>
            {users.length > 0 ? (
                <div style={styles.grid}>
                    {users.map(user => (
                        <div key={user._id} style={userStatusStyles(user)}>
                            <h3 style={styles.username}>{user.email}</h3>
                            <p style={styles.text}>Role: {user.role}</p>
                            <p style={styles.text}>Expires At: {new Date(user.expiresAt).toLocaleString()}</p>
                            <button style={styles.deleteButton} onClick={() => onDelete(user._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={styles.text}>No users found.</p>
            )}
        </div>
    );
};

// Inline Styles for CSS
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '20px',
    },
    section: {
        marginBottom: '30px',
    },
    subHeader: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
    },
    userCard: {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    username: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
    },
    text: {
        fontSize: '0.9rem',
        color: '#666',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    searchContainer: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    searchInput: {
        padding: '8px 12px',
        fontSize: '1rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '60%',
    },
};

// User Status Styles based on expiration
const userStatusStyles = (user) => {
    const currentTime = new Date();
    const expired = new Date(user.expiresAt) < currentTime;

    return {
        backgroundColor: expired ? '#f8d7da' : '#d4edda',  // Red for expired, Green for active
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    };
};