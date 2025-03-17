import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Container,
  CircularProgress,
  Alert,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

const StudentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifMenuAnchor, setNotifMenuAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchCalled = useRef(false);
  const memoizedNotifications = useMemo(() => notifications, [notifications]);

  //Fetch Dashboard Data (only runs once)
  const fetchDashboardData = useCallback(async () => {
    if (fetchCalled.current) return;
    fetchCalled.current = true;

    console.log("Fetching dashboard data...");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/student_dashboard/overview/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Dashboard Data:", response.data);
      setDashboardData(response.data);
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  //Fetch Notifications (Avoid Duplicates)
  const fetchNotifications = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found, redirecting to login.");
      navigate("/login");
      return;
    }

    try {
      //Fetch both types of notifications and handle errors separately
    const [personalRes, courseRes] = await Promise.allSettled([
      axios.get(`${BASE_URL}/notifications/list/`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BASE_URL}/notifications/student/relevant/`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    //Extract valid responses (ignore failed ones)
    const personalNotifications = personalRes.status === "fulfilled" ? personalRes.value.data : [];
    const courseNotifications = courseRes.status === "fulfilled" ? courseRes.value.data : [];

    //Combine notifications and remove duplicates based on `notification_id`
    const combinedNotifications = [...personalNotifications, ...courseNotifications].reduce((acc, notif) => {
      if (!acc.some(n => n.notification_id === notif.notification_id)) {
        acc.push(notif);
      }
      return acc;
    }, []);

    setNotifications(combinedNotifications);
    setUnreadCount(combinedNotifications.filter(n => !n.is_read).length);

      console.log("Fetched Notifications:", combinedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);

      //Handle 401 Unauthorized (redirect to login)
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  };

  //Mark Notification as Read
  const markNotificationAsRead = async (notification_id) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found, cannot mark notification.");
      return;
    }

    //Check if notification exists before marking as read
    const notificationExists = notifications.some(n => n.notification_id === notification_id);
    if (!notificationExists) {
      console.warn("Notification ID ${notificationUuid} not found in state.");
      // alert("Notification not found. It may have already been marked as read.");
      return;
    }

    
    const url = `${BASE_URL}/notifications/mark_read/${notification_id}/`;
    try{
      const response = await axios.post(url, {}, { headers: {Authorization: `Bearer ${token}`}})

      if (response.status === 200) {
        console.log(`Notification ${notification_id} marked as read.`);
        //Update notification as read in state
        setNotifications(prev => prev.map(n => (n.notification_id === notification_id ? { ...n, is_read: true } : n)));

        //Decrease badge count only if it's unread
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);

      if (error.response?.status === 404) {
        console.warn("Notification not found. It may have already been marked as read.");

        //Refresh notifications if 404 occurs
        fetchNotifications();
      }
    }
  };

  //Runs only once
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, [fetchDashboardData]);

  //Reload Dashboard when a Video is Watched
  useEffect(() => {
    const refreshDashboardOnVideoEnd = () => {
      console.log("Refreshing dashboard data after video watch...");
      fetchDashboardData();
    };

    window.addEventListener("videoEnded", refreshDashboardOnVideoEnd);
    return () => {
      window.removeEventListener("videoEnded", refreshDashboardOnVideoEnd);
    };
  }, [fetchDashboardData]);

  if (loading)
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );

  if (error)
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );

  // Filter Enrolled Courses
  const filteredEnrolledCourses = (dashboardData?.enrolled_courses || []).filter((course) => {
    return (
      course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredContinueWatching = (dashboardData?.continue_watching || []).filter((video) => {
    return (
      video.video_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.course_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
});

  //Filter Available Courses
  const filteredAvailableCourses = (dashboardData?.available_courses || []).filter((course) => {
    return (
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  

  return (
    <Container sx={{ padding: "30px 20px", minHeight: "100vh" }}>
      {/* Notifications Menu */}
      <AppBar position="static" sx={{ background: theme.palette.gradient.primary, borderRadius: "8px" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ color: "white" }}>Dashboard</Typography>
          <Box>
            <IconButton color="inherit" onClick={(e) => setNotifMenuAnchor(e.currentTarget)}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu anchorEl={notifMenuAnchor} open={Boolean(notifMenuAnchor)} onClose={() => setNotifMenuAnchor(null)}>
              <List sx={{ width: 300 }}>
                {notifications.length > 0 ? (
                  memoizedNotifications.map((notification) => (
                    <ListItem key={notification.notification_id} component="button" onClick={() => markNotificationAsRead(notification.notification_id)}
                      sx={{ bgcolor: notification.is_read ? "inherit" : "grey", cursor: "pointer" }}>
                      <ListItemText primary={<Typography sx={{ color: theme.palette.text.primary }}>{notification.message}</Typography> } secondary= {<Typography sx={{ color: theme.palette.text.primary }}> {new Date(notification.created_at).toLocaleString()}</Typography>} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem><ListItemText primary="No new notifications." /></ListItem>
                )}
              </List>
            </Menu>
            {/* Profile Icon */}
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: theme.palette.accent.main }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => navigate("/student/profile")}>
                <SettingsIcon sx={{ mr: 1 }} />
                Profile Settings
              </MenuItem>
              <Divider />
              {/* <MenuItem onClick={() => { localStorage.removeItem("accessToken"); navigate("/login");}} sx={{ color: "red" }}><LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem> */}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Search Bar */}
      <Box display="flex" justifyContent="center" my={3}>
        <TextField
          variant="outlined"
          placeholder="Search courses..."
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          InputProps={{
            startAdornment: <SearchIcon sx={{ marginRight: 1 }} />,
          }}
          sx={{ width: "50%" }}
        />
      </Box>

      {/* Enrolled Courses */}
      <Typography variant="h4" sx={{ mt: 4, textAlign: "center", fontWeight: "bold" }}>Enrolled Courses</Typography>
      <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
        {/* {dashboardData?.enrolled_courses?.map((course) => ( */}
        {filteredEnrolledCourses.length > 0 ? (
          filteredEnrolledCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>
                <CardContent>
                {/* Add Image Handling Here */}
                {course.course_image_url ? (
                  <img
                    src={course.course_image_url}
                    alt={course.course_title}
                    style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => {
                      console.error("Image load failed:", e.target.src);
                      e.target.style.display = "none"; // Hide broken image
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 100, color: "gray" }} />
                )} 
                  <Typography variant="h6">{course.course_title}</Typography>
                  <Button variant="contained" sx={{ mt: 1, width: "100%" }} onClick={() => navigate(`/student/course/${course.course}`)}>
                    View Course
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ):(
          <Typography sx={{ textAlign: "center", mt: 2 }}>No courses found.</Typography>
        )}
      </Grid>

      {/* Continue Watching Section */}
      <Typography variant="h4" sx={{ mt: 4, textAlign: "center", fontWeight: "bold" }}>
        Continue Watching
      </Typography>
      <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
        {/* {dashboardData?.continue_watching?.map((video) => ( */}
        {filteredContinueWatching.length > 0 ? (
          filteredContinueWatching.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    {/* Add Image Handling Here */}
                    {video.video_thumbnail_url ? (
                      <img
                        src={video.video_thumbnail_url}
                        alt={video.video_title}
                        style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }}
                        onError={(e) => {
                          console.error("Image load failed:", e.target.src);
                          e.target.style.display = "none"; // Hide broken image
                        }}
                      />
                    ) : (
                      <ImageIcon sx={{ fontSize: 100, color: "gray" }} />
                    )}
                  </Box>
                  <Typography variant="h6">{video.video_title}</Typography>
                  <Typography variant="body2" color="text.secondary">Course: {video.course_title}</Typography>
                  <LinearProgress variant="determinate" value={video.progress_percentage ?? 0} sx={{ mt: 1, mb: 1 }} />
                  <Button
                    variant="contained"
                    sx={{ mt: 1, width: "100%" }}
                    onClick={() => navigate(`/student/course/${video.course_id}/video/${video.video}`)}
                  >
                    Resume Video
                  </Button>
                </CardContent>
              </Card>
            </Grid>
        ))
      ) : (
        <Typography sx={{ textAlign: "center", mt: 2 }}>No videos in progress.</Typography>
      )}
      </Grid>

      {/* Available Courses Section */}
      <Typography variant="h4" sx={{ mt: 4, textAlign: "center", fontWeight: "bold" }}>
        Available Courses
      </Typography>
      <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
       {filteredAvailableCourses?.length > 0 ? (
          filteredAvailableCourses.map((course) => (
        // {dashboardData?.available_courses?.length > 0 ? (
        //   dashboardData.available_courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>
                <CardContent>
                {/* Add Image Handling Here */}
                {course.course_image_url ? (
                  <img
                    src={course.course_image_url}
                    alt={course.title}
                    style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => {
                      console.error("Image load failed:", e.target.src);
                      e.target.style.display = "none"; // Hide broken image
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 100, color: "gray" }} />
                )}
                  <Typography variant="h6" fontWeight="bold">{course.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{course.description}</Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 1, width: "100%" }}
                    onClick={() => navigate(`/student/course/${course.id}`)}
                  >
                    View Course
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography sx={{ textAlign: "center", mt: 2 }}>No courses available.</Typography>
        )}
      </Grid>

    </Container>
  );
};

export default StudentDashboard;
