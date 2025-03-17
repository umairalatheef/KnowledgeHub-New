import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useThemeStore from "../../store/themeStore"; // Import Zustand Store
import API from "../../utils/axios";
import "./Auth.css";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ✅ Use Zustand theme store
    const darkMode = useThemeStore((state) => state.darkMode);

    useEffect(() => {
        // ✅ Apply theme dynamically from Zustand
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        try {
            const response = await API.post("/auth/reset-password/", {
                email,
                otp,
                new_password: newPassword,
            });

            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setMessage("Error: " + (error.response?.data?.message || "Invalid OTP or Password"));
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side - Image */}
            <div className="auth-image forgot-password-image"></div>

            {/* Right Side - Reset Password Form */}
            <div className="auth-form">
                <h2>Reset Password</h2>
                <p>Enter the OTP sent to your email and set a new password.</p>
                <form onSubmit={handleResetPassword}>
                    <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />

                    {/* New Password Field with Eye Toggle */}
                    <div className="password-input-container">
                        <input type={showPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? "👁️" : "🔒"}
                        </span>
                    </div>

                    {/* Confirm Password Field with Eye Toggle */}
                    <div className="password-input-container">
                        <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? "👁️" : "🔒"}
                        </span>
                    </div>

                    <button type="submit">Reset Password</button>
                </form>
                {message && <p className="message">{message}</p>}
                <p><a href="/login">Back to Login</a></p>
            </div>
        </div>
    );
};

export default ResetPassword;
