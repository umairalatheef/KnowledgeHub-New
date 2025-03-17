import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  IconButton,
  Grid,
  InputAdornment, 
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

const AdminProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/auth/admin/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setProfile(response.data);
      })
      .catch((error) => {
        setError("Failed to load profile.");
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      await axios.put(`${BASE_URL}/auth/admin/profile/`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError("Failed to update profile.");
      console.error(error);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.old_password || !passwords.new_password) {
      setError("Please fill in both password fields.");
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/auth/change-password/`,
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Password changed successfully!");
      setShowPasswordField(false);
      setPasswords({ old_password: "", new_password: "" });
    } catch (error) {
      setError("Failed to change password.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5, maxWidth: "600px" }}>
      {/* Header with Back Button & Gradient Background */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          py: 3,
          borderRadius: "8px",
          background: theme.palette.gradient.primary, // Primary Gradient
          color: "white",
          position: "relative",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: "absolute", left: "10px", color: "white" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Admin Profile
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* Text Fields in Grid Layout */}
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Username"
              name="username"
              value={profile.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ maxWidth: "100%" }} // Adjust TextField Width
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ maxWidth: "100%" }} // Adjust TextField Width
            />
          </Grid>
        </Grid>

        {/* Change Password Box */}
        {showPasswordField && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: "8px",
              boxShadow: 2,
              background: theme.palette.background.paper,
              color: theme.palette.text.primary, //text color
              border: "1px solid ${theme.palette.divider}",
              position: "relative",
            }}
          >
            <IconButton
              onClick={() => setShowPasswordField(false)}
              sx={{
                position: "absolute",
                top: "8px",
                right: "8px",
                color: theme.palette.primary.main,
              }}
            >
              <CloseIcon />
            </IconButton>
            
            <TextField
              label="Current Password"
              name="old_password"
              type={showPassword ? "text" : "password"}
              value={passwords.old_password}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              sx={{ background: theme.palette.background.default, color: theme.palette.text.primary }}
              InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            />


            <TextField
              label="New Password"
              name="new_password"
              type={showPassword ? "text" : "password"}
              value={passwords.new_password}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleChangePassword}
              sx={{
                background: theme.palette.gradient.primary, // Gradient Background
                color: "white",
                fontWeight: "bold",
                mt: 2,
                py: 1.5,
                "&:hover": {
                  background: theme.palette.accent.main,
                },
              }}
            >
              Confirm Password Change
            </Button>
          </Box>
        )}

        {/* Buttons in a Row */}
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          {!showPasswordField && (
            <Grid item xs={12} sm={6}>
              {/* Change Password Button - Gradient Background */}
              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowPasswordField(true)}
                sx={{
                  background: theme.palette.gradient.primary, // Gradient Background
                  color: "white",
                  fontWeight: "bold",
                  py: 1.5,
                  "&:hover": {
                    background: theme.palette.accent.main,
                  },
                }}
              >
                Change Password
              </Button>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            {/* Save Changes Button - Primary Theme Color */}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{
                py: 1.5,
              }}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AdminProfile;
