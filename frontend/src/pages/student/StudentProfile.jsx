import React, { useEffect, useState } from "react";
import {
  Container, TextField, Button, Typography, CircularProgress, Alert, Box, MenuItem, InputLabel,
  Select, FormControl, IconButton, InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useAuthStore from "../../store/authStore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const StudentProfile = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [updatedProfile, setUpdatedProfile] = useState({ first_name: "", last_name: "", country: "", about: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, fetchProfile, updateProfile, setUser } = useAuthStore();
  const [forceRender, setForceRender] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // List of Countries
  const countries = [
    "India", "United States", "Canada", "United Kingdom", "Australia",
    "Germany", "France", "Brazil", "Japan", "China", "South Africa", "Russia", "New Zealand"
  ];

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileData = await fetchProfile();
        if (profileData) {
          setUpdatedProfile({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            country: profileData.country || "",
            about: profileData.about || "",
            password: "",
          });
        }
      } catch (err) {
        setError("Failed to fetch profile.");
      }
      setLoading(false);
    };

    loadProfile();
  }, [forceRender]);

  const handleChange = (e) => {
    setUpdatedProfile({ ...updatedProfile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleImageReset = () => {
    setSelectedImage(null);
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("first_name", updatedProfile.first_name);
      formData.append("last_name", updatedProfile.last_name);
      formData.append("country", updatedProfile.country);
      formData.append("about", updatedProfile.about);
      if (updatedProfile.password) {
        formData.append("password", updatedProfile.password);
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await updateProfile(formData);

      // Refetch profile and update Zustand store before updating local state
      const updatedUser = await fetchProfile();
      if (updatedUser) {
        setUser(updatedUser);
        setUpdatedProfile({
          first_name: updatedUser.first_name || "",
          last_name: updatedUser.last_name || "",
          country: updatedUser.country || "",
          about: updatedUser.about || "",
          password: "",
        });
        setSelectedImage(null);
        setForceRender((prev) => prev + 1); // Force re-render
      }

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Try `image` first, then `signed_url` to fetch from S3, else use AccountCircleIcon
  const profileImage = selectedImage
  ? URL.createObjectURL(selectedImage) //  If user selects a new image
  : user?.image //  Use user image from backend
  ? user.image
  : null; //  If no image, fallback to AccountCircleIcon


  console.log(" Rendering Profile Image:", profileImage);

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2, mb: 3, borderRadius: "8px", background: theme.palette.gradient.primary, color: "white" }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1, textAlign: "center" }}>Student Profile</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box textAlign="center" mb={3} position="relative">
        {profileImage ? (
          <img 
            src={profileImage} 
            alt="Profile" 
            onError={(e) => { 
              console.error(" Image Load Error:", e.target.src); 
              e.target.style.display = "none"; // Hide broken image
            }}
            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "4px solid #674188" }} 
          />
        ) : (
          <AccountCircleIcon sx={{ fontSize: 120, color: "#674188" }} />
        )}
        {selectedImage && (
          <IconButton onClick={handleImageReset} sx={{ position: "absolute", top: 0, right: "38%", background: "white", boxShadow: 2, "&:hover": { background: "#ffcccc" } }}>
            <DeleteIcon color="error" />
          </IconButton>
        )}
      </Box>

      <TextField label="First Name" name="first_name" value={updatedProfile.first_name} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Last Name" name="last_name" value={updatedProfile.last_name} onChange={handleChange} fullWidth margin="normal" />
      <FormControl fullWidth margin="normal">
        <InputLabel>Country</InputLabel>
        <Select name="country" value={updatedProfile.country} onChange={handleChange}>
          {countries.map((country) => <MenuItem key={country} value={country}>{country}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="About" name="about" value={updatedProfile.about} onChange={handleChange} fullWidth multiline rows={3} margin="normal" />
      <TextField label="New Password (Optional)" name="password" type={showPassword ? "text" : "password"} value={updatedProfile.password} onChange={handleChange} fullWidth margin="normal" 
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

      <Button component="label" variant="contained" fullWidth sx={{ mt: 2, py: 1.5, background: "#674188", color: "white", "&:hover": { background: "#56357d" } }}>
        {selectedImage ? selectedImage.name : "Choose Profile Image"}
        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
      </Button>

      <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.5, background: "#674188", "&:hover": { background: "#56357d" } }} onClick={handleUpdateProfile}>
        Update Profile
      </Button>
    </Container>
  );
};

export default StudentProfile;
