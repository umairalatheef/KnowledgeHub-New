import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    Box,
    CssBaseline,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardCards from "../../components/DashBoardCards";
import ActiveUsersChart from "../../components/ActiveUsersChart";
import UsersSection from "../admin/UsersSection";
import Courses from "../courses_admin/Courses";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const AdminDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openNotifDialog, setOpenNotifDialog] = useState(false);
    const [announcementText, setAnnouncementText] = useState("");
    const [sending, setSending] = useState(false);

    const fetchCalled = useRef(false); // Prevent multiple API calls
    const sendButtonRef = useRef(null); // Reference for focus management

    // Fetch dashboard data (only runs on first render)
    const fetchDashboardData = useCallback(async () => {
        if (fetchCalled.current) return; // Prevent duplicate calls
        fetchCalled.current = true; // Mark as called
        console.log("Fetching dashboard data...");
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [statsRes, activeUsersRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/v1/admin_dashboard/platform-stats/`, { headers }),
                axios.get(`${BASE_URL}/api/v1/admin_dashboard/active-users/`, { headers })
            ]);

            setStats(statsRes.data);
            setActiveUsers(activeUsersRes.data);
            console.log("Stats received:", statsRes.data); // Logs only when API is called
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]); // Dependencies optimized

    // Run once on mount (fixes multiple renders)
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Prevent re-renders by memoizing handlers
    const handleMenuOpen = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("accessToken");
        navigate("/login");
    }, [navigate]);

    // Open Notification Dialog
    const handleOpenNotifDialog = () => setOpenNotifDialog(true);

    // Close Notification Dialog & Move Focus Back
    const handleCloseNotifDialog = () => {
        setOpenNotifDialog(false);
        setAnnouncementText("");

        // Move focus back to the notification button after closing the dialog
        if (sendButtonRef.current) {
            sendButtonRef.current.focus();
        }
    };

    // Prevent unnecessary re-renders when typing
    const handleTextChange = (e) => setAnnouncementText(e.target.value);

    // Send Announcement (optimized to avoid multiple calls)
    const sendNotification = async () => {
        if (!announcementText.trim() || sending) return;

        setSending(true);
        const token = localStorage.getItem("accessToken");
        try {
            await axios.post(
                `${BASE_URL}/api/v1/notifications/admin/global_send/`,
                { message: announcementText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Announcement sent successfully!");
            handleCloseNotifDialog();
        } catch (error) {
            console.error("Error sending notification:", error);
            alert("Failed to send notification. Try again.");
        } finally {
            setSending(false);
        }
    };

    //Memoize dashboard data to prevent re-renders
    const memoizedStats = useMemo(() => stats || {}, [stats]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: theme.palette.background.default, }}>
            <CssBaseline />

            {/* AppBar with Tabs */}
            <AppBar position="static" sx={{ background: theme.palette.gradient.primary }}>
                <Toolbar>
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>Admin Panel</Typography>

                    {/* Notification/Announcement Icon */}
                    <IconButton color="inherit" onClick={handleOpenNotifDialog}>
                        <CampaignIcon />
                    </IconButton>

                    {/* Profile Icon */}
                    <IconButton onClick={handleMenuOpen} color="inherit">
                        <Avatar sx={{ bgcolor: "white", color: theme.palette.primary.main }}>
                            <AccountCircleIcon />
                        </Avatar>
                    </IconButton>

                    {/* Profile Menu */}
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
                        <MenuItem onClick={() => navigate("/admin/profile")}>Profile Settings</MenuItem>
                        {/* <MenuItem onClick={handleLogout}>Logout</MenuItem> */}
                    </Menu>
                </Toolbar>

                <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} centered textColor="inherit" indicatorColor="secondary">
                    <Tab label="Dashboard" />
                    <Tab label="Users" />
                    <Tab label="Courses" />
                    <Tab label="Analytics" />
                </Tabs>
            </AppBar>
   
            {/* Content Area */}
            <Box sx={{ flexGrow: 1, p: theme.spacing(3) }}>
                {tabIndex === 0 && (loading ? <Typography>Loading...</Typography> : <DashboardCards stats={memoizedStats} />)}
                {tabIndex === 1 && <UsersSection />}
                {tabIndex === 2 && <Courses />}
                {tabIndex === 3 && (activeUsers.length > 0 ? <ActiveUsersChart data={activeUsers} /> : <Typography>No active users data</Typography>)}
            </Box>

            {/* Send Notification Dialog */}
            <Dialog
                open={openNotifDialog}
                onClose={handleCloseNotifDialog}
                disableEnforceFocus // Prevents focus issues when closing
                disableRestoreFocus // Prevents focus from jumping back incorrectly
            >
                <DialogTitle>Send Announcement</DialogTitle>
                <DialogContent>
                    <TextField 
                        fullWidth 
                        label="Message" 
                        multiline 
                        rows={3} 
                        value={announcementText} 
                        onChange={handleTextChange} 
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNotifDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button 
                        ref={sendButtonRef} //Store reference for focus management
                        onClick={sendNotification} 
                        variant="contained" 
                        color="primary" 
                        disabled={sending}
                    >
                        {sending ? "Sending..." : "Send"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboard;
