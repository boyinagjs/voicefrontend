// src/components/CreateUser.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from 'axios';

const CreateUser = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        expiresInHours: '',
        role: 'client',
        creatorId: ""
    });
    const [currentUserRole, setCurrentUserRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        setCurrentUserRole(role);
        const userid = Cookies.get("userid");
        setFormData({ ...formData, creatorId: userid })
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://voicebackend-1dix.onrender.com/api/create-user', formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                console.log(response.data);
                alert('User created successfully');
                setFormData({
                    email: '',
                    password: '',
                    expiresInHours: '',
                    role: ''
                });
            } else {
                console.log(response);
                alert(response.data.message || 'Error creating user');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Creation failed. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogout = () => {
        Cookies.remove("userid");
        localStorage.clear();
        navigate('/login');
    };

    const styles = {
        container: {
            maxWidth: '600px',
            margin: '2rem auto',
            padding: '2rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        heading: {
            color: '#2c3e50',
            textAlign: 'center',
            marginBottom: '1.5rem'
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        label: {
            fontSize: '0.9rem',
            color: '#34495e',
            fontWeight: '500'
        },
        input: {
            padding: '0.8rem',
            borderRadius: '4px',
            border: '1px solid #bdc3c7',
            fontSize: '1rem'
        },
        select: {
            padding: '0.8rem',
            borderRadius: '4px',
            border: '1px solid #bdc3c7',
            backgroundColor: 'white',
            fontSize: '1rem'
        },
        button: {
            padding: '0.8rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginTop: '1rem',
            ':hover': {
                backgroundColor: '#2980b9'
            }
        },
        nav: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#ecf0f1',
            borderRadius: '4px'
        },
        navButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        link: {
            color: '#3498db',
            textDecoration: 'none',
            cursor: 'pointer'
        }
    };
    const userid = Cookies.get("userid");
    if (!userid || currentUserRole === "client") {
        return navigate('/login')
    }

    return (
        <div style={styles.container}>
            <div style={styles.nav}>
                <button
                    style={styles.navButton}
                    onClick={handleLogout}
                >
                    Logout
                </button>
                <span
                    style={styles.link}
                >
                    <a href='/userslist'>Show Users</a>
                </span>
            </div>

            <h2 style={styles.heading}>Create New User</h2>
            <form style={styles.form} onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Role:</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={styles.select}
                    >
                        {currentUserRole === 'superadmin' && (
                            <option value="admin">Admin</option>
                        )}
                        <option value="client">Client</option>
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Expiration Time (hours):</label>
                    <input
                        type="number"
                        name="expiresInHours"
                        value={formData.expiresInHours}
                        onChange={handleChange}
                        style={styles.input}
                        min="1"
                        required
                    />
                </div>

                <button type="submit" style={styles.button}>
                    Create User
                </button>
            </form>
        </div>
    );
};

export default CreateUser;