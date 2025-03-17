import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore"; // Zustand Store
import "./Auth.css"; // CSS for styling
import { useTheme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "", email: "", password: "", first_name: "", last_name: "", user_type: "admin",
    });

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(""); // New state for success message
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const register = useAuthStore((state) => state.register); // Zustand register function
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    useEffect(() => {
        document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setSuccessMessage(""); // Clear previous success messages

        try {
            const response = await register(formData); // Calls Zustand function
            console.log("Registration response:", response);

            if (response.status === "success") {
                setSuccessMessage("User registered successfully! Redirecting to login...");
                console.log("User registered successfully! Redirecting to login...");

                // Redirect to login after 2 seconds
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(response.message || "Registration failed!");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side Background Image */}
            <div className="auth-image"></div>

            {/* Right Side Form */}
            <div className="auth-form">
                <h2>Create an Account</h2>
                {error && <p className="error-message">{error}</p>} {/* Display Error if any */}
                {successMessage && <p className="success-message">{successMessage}</p>} {/* Display Success Message */}

                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                    />
                    <select
                        value={formData.user_type}
                        onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                        required
                    >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </span>
                    </div>
                    <button type="submit">Register</button>
                </form>
                <p>
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
};

export default Register;