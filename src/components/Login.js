import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from "js-cookie";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (email === "admin@gmail.com") {
                const { data } = await axios.post("https://voicebackend-1dix.onrender.com/api/adminlogin", {
                    email,
                    password
                }, { headers: { "Content-Type": "application/json" } });

                localStorage.setItem("userId", data.userId);
                localStorage.setItem("role", data.role);
                Cookies.set("userid", data.userId, { expires: data.expiresAt });
                return navigate("/speech");
            } else {
                const { data } = await axios.post("https://voicebackend-1dix.onrender.com/api/login", {
                    email,
                    password
                }, { headers: { "Content-Type": "application/json" } });

                localStorage.setItem("userId", data.userId);
                localStorage.setItem("role", data.role);
                console.log(data)
                Cookies.set("userid", data.userId, { expires: new Date(data.expiresAt) });
                return navigate("/speech");
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.message);
        }
    };

    // Inline styles for modern responsive design
    const styles = {
        container: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f4f7fc",
        },
        formWrapper: {
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
        },
        heading: {
            fontSize: "1.8rem",
            marginBottom: "20px",
            color: "#333",
        },
        input: {
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            fontSize: "1rem",
            outline: "none",
        },
        button: {
            width: "100%",
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s",
        },
        buttonHover: {
            backgroundColor: "#0056b3",
        },
        link: {
            display: "block",
            marginTop: "15px",
            color: "#007bff",
            textDecoration: "none",
            fontSize: "0.9rem",
        },
        linkHover: {
            textDecoration: "underline",
        },
    };
    if (localStorage.getItem("userId")) {
        return navigate('/speech')
    }

    return (
        <div style={styles.container}>
            <form style={styles.formWrapper} onSubmit={handleSubmit}>
                <h2 style={styles.heading}>Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <button
                    type="submit"
                    style={{ ...styles.button }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
                    onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;