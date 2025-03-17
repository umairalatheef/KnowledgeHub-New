import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore"; // Zustand Store
import "./Auth.css"; // CSS for styling
import { useTheme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login); // Zustand login function
    const user = useAuthStore((state) => state.user);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    // Apply theme to body
    useEffect(() => {
        document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const handleLogin = async (e) => {
        e.preventDefault();
        await login(username, password); // Calls Zustand function
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedUser?.user_type) {
            navigate(storedUser.user_type === "admin" ? "/admin_dashboard" : "/student_dashboard");
        }else {
            setTimeout(() => {
                const updatedUser = JSON.parse(localStorage.getItem("user"));
                if (updatedUser?.user_type) {
                    navigate(updatedUser.user_type === "admin" ? "/admin_dashboard" : "/student_dashboard");
                } else {
                    console.error(" Navigation Failed: `user_type` still missing");
                }
            }, 1000);  // Wait 1 second for Zustand update
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side Background Image */}
            <div className="auth-image"></div>

            {/* Right Side Form */}
            <div className="auth-form">
                <h2>Login to Your Account</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </span>
                    </div>
                    <button type="submit">Login</button>
                </form>
                {/* Forgot Password Link */}
                <p className="forgot-password">
                    <a href="/forgot-password">Forgot Password?</a>
                </p>
                <p>Don't have an account? <a href="/register">Sign up</a></p>
            </div>
        </div>
    );
};

export default Login;
