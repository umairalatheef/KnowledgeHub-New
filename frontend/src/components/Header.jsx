import React, { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore"; // Zustand store
import useThemeStore from "../store/themeStore"; // Theme store
import { IconButton } from "@mui/material"; // MUI Icons
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode
import DashboardIcon from "@mui/icons-material/Dashboard"; // Dashboard Icon
import MenuIcon from "@mui/icons-material/Menu"; // Mobile Menu Icon
import "./Header.css";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1024);
  const { user, isAuthenticated, logout } = useAuthStore(); // Auth state
  const { darkMode, toggleTheme } = useThemeStore(); // Theme state
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Zustand Debugging in Header.jsx");
    console.log("User Object from Zustand:", user);
    console.log("User Type from Zustand:", user?.user_type);
    console.log("Is Authenticated:", isAuthenticated);
    // console.log("Debugging Dashboard Icon Visibility:");

    if (isAuthenticated && user?.user_type) {
      console.log("✅ Showing Dashboard Icon");
    } else {
      console.log("❌ Hiding Dashboard Icon");
    }

    // Ensure toggle button shows only on small screens
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect after logout
  };

  console.log("User:", user);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("DashboardIcon should be visible:", isAuthenticated && user?.user_type);

  return (
    <header
      className="header"
      style={{
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
      }}
    >
      {/* Left Side: Logo & Dashboard Icon */}
      <div className="header-left">
        <h1 className="header-title">KnowledgeHub</h1>
      </div>
      {/* Center Navigation Menu (Hidden on Small Screens) */}
        {!isSmallScreen && (
          <nav className="nav-container">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav> 
        )} 
        {/* Right Side: Theme Toggle, Auth Buttons, Mobile Menu */}
        {/* <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> */}
          {/* Dark Mode Toggle Button */}
        <div className="header-icons">
          <Tooltip title="Toggle Theme" arrow>
            <IconButton onClick={toggleTheme} color="inherit">
              {darkMode ? <Brightness7Icon sx={{ fontSize: 28 }} /> : <Brightness4Icon sx={{ fontSize: 28 }} />}
            </IconButton>
          </Tooltip>
          {/* Dashboard Icon (Only for logged-in users) */}
          {isAuthenticated && user?.user_type && (
            <Tooltip title="Dashboard" arrow>
              <IconButton
                onClick={() =>
                  navigate(user.user_type === "admin" ? "/admin_dashboard" : "/student_dashboard")
                }
                color="inherit"
                className="dashboard-icon"
                sx={{ fontSize: 28 }}
              >
                <DashboardIcon />
              </IconButton>
            </Tooltip>
          )}
          {/*  Mobile Menu Toggle Button (ONLY visible on small screens) */}
          {isSmallScreen && (
            <Tooltip title="Menu" arrow>
              <IconButton onClick={() => setMenuOpen(!menuOpen)} color="inherit" className="menu-toggle">
                <MenuIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      

        {/*  Authentication & User Info */}
        <div className="auth-buttons">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </>
          ) : (
            <div className="user-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="welcome-text">Welcome, <strong>{user?.username}</strong></span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>



      {/* Mobile Menu (Dropdown) */}
      {menuOpen && isSmallScreen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="register-btn" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <div className="user-info">
              <span className="welcome-text">Welcome, <strong>{user?.username}</strong></span>
              <button className="logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
