import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/axios";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    CircularProgress,
    TextField,
    InputAdornment,
    CardMedia,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks"; // Better Icon
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import { useTheme } from "@mui/material/styles";

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await API.get("/courses/");
                setCourses(response.data);
            } catch (err) {
                setError("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleAddCourse = () => {
        navigate("/admin_dashboard/courses/add");
    };

    // Filter courses based on search term
    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) || (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Box sx={{ padding: "20px" }}>
            {/* Gradient Header */}
            <Box
                sx={{
                    textAlign: "center",
                    py: 3,
                    background: `linear-gradient(135deg, #674188, #A084DC)`,
                    color: "white",
                    borderRadius: "12px",
                    mb: 4,
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        fontSize: "2rem",
                    }}
                >
                    <LibraryBooksIcon fontSize="large" /> Available Courses
                </Typography>
            </Box>

            {/* Add Course Button & Search Bar */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{
                        background: `linear-gradient(135deg, #674188, #A084DC)`,
                        color: "#fff",
                        fontWeight: "bold",
                        padding: "12px 20px",
                        "&:hover": { background: "#C3ACD0" },
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                        borderRadius: "8px",
                    }}
                    onClick={handleAddCourse}
                >
                    Add New Course
                </Button>

                {/* Search Bar */}
                <TextField
                    variant="outlined"
                    placeholder="Search Courses..."
                    fullWidth
                    sx={{
                        maxWidth: "300px",
                        background: theme.palette.background.paper,
                        borderRadius: "8px",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="primary" />
                            </InputAdornment>
                        ),
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ textAlign: "center", mt: 2 }}>
                    {error}
                </Typography>
            ) : (
                <Grid container spacing={3} justifyContent="center">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course.id}>
                                <Card
                                    sx={{
                                        background: theme.palette.background.paper,
                                        boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                                        borderRadius: "12px",
                                        transition: "0.3s",
                                        cursor: "pointer",
                                        color: theme.palette.text.primary,
                                        "&:hover": {
                                            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                                            transform: "scale(1.05)",
                                        },
                                    }}
                                    onClick={() =>
                                        navigate(`/admin_dashboard/courses/${course.id}`)
                                    }
                                >
                                    {/* Course Image or Default Icon */}
                                    {course.image_url ? (
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={course.image}
                                            alt="Course Image"
                                            sx={{
                                                borderTopLeftRadius: "12px",
                                                borderTopRightRadius: "12px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                height: "180px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: "#f5f5f5",
                                                borderTopLeftRadius: "12px",
                                                borderTopRightRadius: "12px",
                                            }}
                                        >
                                            <ImageIcon
                                                sx={{
                                                    fontSize: 80,
                                                    color: "#aaa",
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <CardContent sx={{ textAlign: "center", p: 4 }}>
                                        <LibraryBooksIcon
                                            sx={{ fontSize: 50, color: "#674188", mb: 1 }}
                                        />
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold", mb: 1, fontSize: "1.3rem" }}
                                        >
                                            {course.title}
                                        </Typography>
                                        <Typography variant="body2">
                                            {course.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography
                            sx={{
                                textAlign: "center",
                                mt: 3,
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                            }}
                        >
                            No courses available. Try searching or click "➕ Add Course" to
                            create one!
                        </Typography>
                    )}
                </Grid>
            )}
        </Box>
    );
};

export default Courses;
