import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useThemeStore from "../../store/themeStore"; // Import Zustand Store
import API from "../../utils/axios";
import "./Auth.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Use Zustand theme store
    const darkMode = useThemeStore((state) => state.darkMode);

    useEffect(() => {
        // Apply theme dynamically from Zustand
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post("/auth/forgot-password/", { email });
            setMessage(response.data.message);
            navigate("/reset-password", { state: { email } });
        } catch (error) {
            setMessage("Error: " + (error.response?.data?.message || "Try again"));
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side - Image */}
            <div className="auth-image forgot-password-image"></div>

            {/* Right Side - Forgot Password Form */}
            <div className="auth-form">
                <h2>Forgot Password?</h2>
                <p>Enter your email address, and we'll send you instructions to reset your password.</p>
                <form onSubmit={handleForgotPassword}>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <button type="submit">Send OTP</button>
                </form>
                {message && <p className="message">{message}</p>}
                <p><a href="/login">Back to Login</a></p>
            </div>
        </div>
    );
};

export default ForgotPassword;
