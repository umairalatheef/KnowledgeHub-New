import React, { useState, useEffect } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/axios";
import {
    Box,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    Button,
    CircularProgress,
    useTheme,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    CardMedia,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image"; // Default Icon

const CourseDetails = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await API.get(`/courses/${courseId}/`);
                setCourse(response.data);
            } catch (err) {
                setError("Failed to load course details");
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [courseId]);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await API.delete(itemToDelete);
            setDeleteDialogOpen(false);
            navigate("/admin_dashboard/courses");
        } catch (err) {
            console.error("Error deleting:", err);
            setError("Failed to delete item.");
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
            {/* Course Title */}
            <Card sx={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
                {/* Course Image (or Default Icon) */}
                {course.image_url ? (
                    <CardMedia
                        component="img"
                        height="250"
                        image={course.image_url}
                        alt="Course Image"
                        sx={{
                            objectFit: "cover",
                            width: "100%",
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: "250px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f5f5f5",
                        }}
                    >
                        <ImageIcon sx={{ fontSize: 100, color: "#aaa" }} />
                    </Box>
                )}

                <CardContent sx={{ textAlign: "center", background: theme.palette.gradient.primary }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "#fff" }}>{course.title}</Typography>
                    <Typography variant="body1" sx={{ color: "#eee", marginBottom: 2 }}>{course.description}</Typography>

                    {/* Edit & Delete Buttons */}
                    <Box>
                        <Button
                            variant="contained"
                            sx={{ mr: 2, background: theme.palette.primary.main, color: "#fff" }}
                            onClick={() => navigate(`/admin_dashboard/courses/${courseId}/edit`)}
                            startIcon={<EditIcon />}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                setItemToDelete(`/courses/${courseId}/`);
                                setDeleteDialogOpen(true);
                            }}
                            startIcon={<DeleteIcon />}
                        >
                            Delete
                        </Button>
                    </Box>
                </CardContent>    
            </Card>

            {/* Videos Section */}
            <Card sx={{ padding: 3, marginTop: 3, borderRadius: "12px" }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                        <VideoLibraryIcon sx={{ marginRight: "10px" }} /> Videos
                    </Typography>
                    <Button 
                        variant="contained" 
                        sx={{ background: theme.palette.gradient.primary, color: "#fff", mt: 2 }} 
                        startIcon={<AddCircleIcon />} 
                        onClick={() => navigate(`/admin_dashboard/courses/${courseId}/add-video`)}
                    >
                        Add Video
                    </Button>

                    {course.videos && course.videos.length > 0 ? (
                        <List sx={{ mt: 2 }}>
                            {course.videos.map((video) => (
                                <ListItem 
                                    key={video.id} 
                                    sx={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center", 
                                        background: theme.palette.mode === "dark" ? theme.palette.background.paper : "#f5f5f5",
                                        color: theme.palette.text.primary, 
                                        borderRadius: "8px", 
                                        padding: "12px", 
                                        mt: 1, 
                                        cursor: "pointer",
                                        "&:hover" : {
                                            background: theme.palette.mode === "dark" ? theme.palette.background.default : "#e0e0e0",
                                        },
                                        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",  
                                    }}
                                    onClick={() => navigate(`/admin_dashboard/courses/${courseId}/videos/${video.id}`)}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <PlayCircleOutlineIcon sx={{ marginRight: "10px", color: theme.palette.primary.main }} />
                                        <Typography variant="body1" sx={{color: theme.palette.text.primary, fontWeight: "bold" }}>{video.title}</Typography>
                                    </Box>
                                    <Box>
                                        <IconButton color="primary" onClick={(e) => { e.stopPropagation(); navigate(`/admin_dashboard/courses/${courseId}/videos/${video.id}/edit`); }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={(e) => { e.stopPropagation(); setItemToDelete(`/courses/${courseId}/videos/${video.id}/`); setDeleteDialogOpen(true); }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>No videos available.</Typography>
                    )}
                </CardContent>
            </Card>

            {/* Resources Section */}
            <Card sx={{ padding: 3, marginTop: 3, borderRadius: "12px" }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                        <DescriptionIcon sx={{ marginRight: "10px" }} /> Resources
                    </Typography>
                    <Button 
                        variant="contained" 
                        sx={{ background: theme.palette.gradient.primary, color: "#fff", mt: 2 }} 
                        startIcon={<AddCircleIcon />} 
                        onClick={() => navigate(`/admin_dashboard/courses/${courseId}/add-resource`)}
                    >
                        Add Resource
                    </Button>

                    {course.resources && course.resources.length > 0 ? (
                        <List sx={{ mt: 2 }}>
                            {course.resources.map((resource) => (
                                <ListItem key={resource.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: theme.palette.mode === "dark" ? theme.palette.background.paper : "#f5f5f5", color: theme.palette.text.primary, borderRadius: "8px", padding: "12px", mt: 1, cursor: "pointer", "&:hover":{ background: theme.palette.mode === "dark" ? theme.palette.background.default : "#e0e0e0", }, boxShadow: "0px 2px 5px rgba(0,0,0,0.1)", }}
                                    onClick={() => navigate(`/admin_dashboard/courses/${courseId}/resources/${resource.id}`)} >
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <InsertDriveFileIcon sx={{ marginRight: "10px", color: theme.palette.primary.main }} /> {resource.title}
                                        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}></Typography>
                                    </Box>
                                    <Box>
                                        <IconButton
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation(); //Prevents the ListItem click event from firing
                                                navigate(`/admin_dashboard/courses/${courseId}/resources/${resource.id}/edit`);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={(e) => { e.stopPropagation(); setItemToDelete(`/courses/${courseId}/resources/${resource.id}/`); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>No resources available.</Typography>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this item? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseDetails;
