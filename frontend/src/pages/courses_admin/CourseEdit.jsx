import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/axios";
import {
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    Container,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useTheme } from "@mui/material/styles";


const CourseEdit = () => {
    const theme = useTheme();
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null); // Stores the new image file
    const [preview, setPreview] = useState(null); // Preview before upload
    const [existingImageUrl, setExistingImageUrl] = useState(null); //Stores old image URL

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await API.get(`/courses/${courseId}/`);
                setCourseData({
                    title: response.data.title,
                    description: response.data.description,
                    start_date: response.data.start_date,
                    end_date: response.data.end_date,
                });
                if (response.data.image_url) {
                    setExistingImageUrl(response.data.image_url);
                    setPreview(response.data.image_url);
                }
            } catch (err) {
                setError("Failed to load course data");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(file){
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Show preview
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
            const formData = new FormData();
            formData.append("title", courseData.title);
            formData.append("description", courseData.description);
            formData.append("start_date", courseData.start_date);
            formData.append("end_date", courseData.end_date);
            if (image) {
                formData.append("image", image); // Append image if selected
            }
            const token = localStorage.getItem("accessToken");

            await API.put(`/courses/${courseId}/`, formData, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            navigate(`/admin_dashboard/courses/${courseId}`);
        } catch (err) {
            console.error("Error updating course:", err.response?.data);
            setError("Failed to update course");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: "center", py: 2, background: theme.palette.gradient.primary, color: "white", borderRadius: "10px", mt: 5, mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <EditNoteIcon /> Edit Course
                </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <TextField fullWidth label="Course Title" name="title" value={courseData.title} onChange={handleChange} required sx={{ mt: 4, mb: 2 }} />
                <TextField fullWidth label="Description" name="description" value={courseData.description} onChange={handleChange} required multiline rows={3} sx={{ mb: 2 }} />
                <TextField fullWidth label="Start Date" name="start_date" type="date" value={courseData.start_date} onChange={handleChange} required sx={{                         mb: 2,
                        "& .MuiInputBase-input": {
                            color: theme.palette.mode === "dark" ? "#fff" : "#000", // Only the input text color changes
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: theme.palette.mode === "dark" ? "#b3b3b3" : "#ccc", // Border color for date picker
                            },
                            "&:hover fieldset": {
                                borderColor: theme.palette.secondary.main, // Hover effect
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: theme.palette.primary.main, // Focused effect
                            },
                        },
                    }}
                    InputLabelProps={{ shrink: true }} />
                <TextField fullWidth label="End Date" name="end_date" type="date" value={courseData.end_date} onChange={handleChange} required sx={{ mb: 2,
                        "& .MuiInputBase-input": {
                            color: theme.palette.mode === "dark" ? "#fff" : "#000",
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: theme.palette.mode === "dark" ? "#b3b3b3" : "#ccc",
                            },
                            "&:hover fieldset": {
                                borderColor: theme.palette.secondary.main,
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: theme.palette.primary.main,
                            },
                        },
                    }} 
                    InputLabelProps={{ shrink: true }} />
                {/* Image Upload */}
                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                    Upload Course Image
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>

                {/* Show Image Preview */}
                {preview && (
                    <img src={preview} alt="Course Preview" style={{ width: "100%", height: "auto", borderRadius: "10px", marginBottom: "10px" }} />
                )}
                <Button type="submit" variant="contained" fullWidth disabled={loading}  sx={{
                    mt: 2, background: theme.palette.primary.main, color: "#fff", fontWeight: "bold", padding: "12px", borderRadius: "8px",
                    "&:hover": { background: "#C3ACD0" },
                }}>
                    {loading ? <CircularProgress size={24} /> : "Update"}
                </Button>
            </form>
        </Container>
    );
};

export default CourseEdit;
