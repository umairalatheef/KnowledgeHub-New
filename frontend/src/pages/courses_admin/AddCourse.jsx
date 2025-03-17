import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/axios";
import { TextField, Button, Typography, Box, Container, CircularProgress, Card, CardContent,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School"; //Course Icon
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; //Date Icon
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { useTheme } from "@mui/material/styles";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const AddCourse = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        image: null,
    });
    const [preview, setPreview] = useState(null); // Image preview
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourseData((prevData) => ({ ...prevData, [name]: value, }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setCourseData((prevData) => ({ ...prevData, image: file }));
        setPreview(URL.createObjectURL(file)); // Preview image
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log("Submitting Course Data:", courseData);

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }

            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
                // "Content-Type": "application/json",
            };

            const response = await API.post("/courses/", courseData, { headers });

            console.log("Course created successfully:", response.data);
            navigate("/admin_dashboard/courses");
        } catch (err) {
            if (err.response && err.response.data) {
                console.error("API Error:", err.response?.data);
                setError(err.response.data.created_by ? err.response.data.created_by[0] : "Failed to add course. Check input and try again.");
            } else {
                setError("Failed to add course. Check input and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: "center", py: 2, background: theme.palette.gradient.primary, color: "white", borderRadius: "10px", mt: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <AddBusinessIcon /> Add New Course
                </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Card sx={{ maxWidth: 550, width: "100%", boxShadow: 3, padding: 3, borderRadius: 3 }}>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Course Title"
                                name="title"
                                value={courseData.title}
                                onChange={handleChange}
                                required
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Course Description"
                                name="description"
                                value={courseData.description}
                                onChange={handleChange}
                                required
                                multiline
                                rows={3}
                                sx={{ mb: 2 }}
                            />

                            {/* Start Date */}
                            <TextField
                                fullWidth
                                label="Start Date"
                                name="start_date"
                                type="date"
                                value={courseData.start_date}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />

                            {/* End Date */}
                            <TextField
                                fullWidth
                                label="End Date"
                                name="end_date"
                                type="date"
                                value={courseData.end_date}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />

                            {/* Image Upload */}
                            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                                <AddPhotoAlternateIcon /> Upload Course Image
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </Button>

                            {preview && <img src={preview} alt="Preview" style={{ width: "100%", height: "auto", borderRadius: "10px", marginBottom: "10px" }} />}

                            {error && (
                                <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>
                                    {error}
                                </Typography>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    background: theme.palette.primary.main,
                                    color: "#fff",
                                    fontWeight: "bold",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    "&:hover": { background: theme.palette.accent.main },
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                }}
                            >
                                {loading ? <CircularProgress size={24} /> : "Submit"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default AddCourse;
