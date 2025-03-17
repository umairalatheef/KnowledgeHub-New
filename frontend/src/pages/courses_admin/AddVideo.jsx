import React, { useState, useEffect } from "react";
import API from "../../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Box,
    CircularProgress,
    Typography,
    Card,
    CardContent,
    IconButton,
    Input,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import ImageIcon from "@mui/icons-material/Image";

const AddVideo = () => {
    const theme = useTheme();
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const [videoData, setVideoData] = useState({ title: "", description: "", video_file: null, thumbnail: null, duration: 0, fileName: "", thumbnailName:"" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadedVideoLink, setUploadedVideoLink] = useState(null);

    useEffect(() => {
        console.log("📺 Course ID from URL:", courseId);
        if (!courseId) {
            setError("Error: Course ID is missing. Please go back and try again.");
        }
    }, [courseId]);

    const handleChange = (e) => {
        setVideoData({ ...videoData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoData({ ...videoData, video_file: file, fileName: file.name });

            // Extract video duration
            const videoElement = document.createElement("video");
            videoElement.preload = "metadata";

            videoElement.onloadedmetadata = () => {
                window.URL.revokeObjectURL(videoElement.src);
                const durationInSeconds = Math.floor(videoElement.duration);
                console.log("Video Duration:", durationInSeconds);
                setVideoData(prevData => ({ ...prevData, duration: durationInSeconds }));
            };

            videoElement.onerror = () => {
                setError("Error retrieving video duration.");
            };

            videoElement.src = URL.createObjectURL(file);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoData({ ...videoData, thumbnail: file, thumbnailName: file.name });
        }
    };

    const handleCancelFile = () => {
        setVideoData({ ...videoData, video_file: null, fileName: "" });
    };

    const handleCancelThumbnail = () => {
        setVideoData({ ...videoData, thumbnail: null, thumbnailName: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!courseId) {
            console.error("Error: Course ID is undefined!");
            setError("Course ID is missing. Cannot add video.");
            setLoading(false);
            return;
        }

        if (!videoData.video_file) {
            setError("Please select a video file.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", videoData.title);
            formData.append("description", videoData.description);
            formData.append("video_file", videoData.video_file);
            if (videoData.thumbnail) formData.append("thumbnail", videoData.thumbnail); // Attach thumbnail
            formData.append("duration", videoData.duration);

            console.log("Submitting Video Data:", Object.fromEntries(formData));

            const token = localStorage.getItem("accessToken");
            const response = await API.post(`/courses/${courseId}/videos/`, formData, {
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "multipart/form-data" 
                },
            });

            console.log("Video uploaded successfully:", response.data);
            setUploadedVideoLink(response.data.video_file);
            navigate(`/admin_dashboard/courses/${courseId}`);
        } catch (err) {
            console.error("API Error:", err.response?.data || err.message);
            setError("Failed to add video. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
            <Box sx={{ textAlign: "center", py: 2, background: theme.palette.gradient.primary, color: "white", borderRadius: "10px" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <LibraryAddIcon /> Add Video
                </Typography>
            </Box>
            <Card sx={{ padding: 4, borderRadius: 3, boxShadow: 3, mt:2 }}>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        {/* Title Input */}
                        <TextField 
                            fullWidth 
                            label="Video Title" 
                            name="title" 
                            value={videoData.title} 
                            onChange={handleChange} 
                            required 
                            sx={{ mb: 3 }} 
                        />

                        {/* Description Input */}
                        <TextField 
                            fullWidth 
                            label="Description" 
                            name="description" 
                            value={videoData.description} 
                            onChange={handleChange} 
                            required 
                            multiline 
                            rows={3} 
                            sx={{ mb: 3 }} 
                        />

                        {/* File & Thumbnail Upload Inputs with Side-by-Side Layout */} 
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3 }}>
                            {/* Upload Video File */}
                            <Box sx={{ width: "50%", textAlign: "center" }}>
                                <input 
                                    type="file" 
                                    name="video_file" 
                                    accept="video/mp4, video/mkv, video/avi, video/mov" 
                                    onChange={handleFileChange} 
                                    required 
                                    id="file-upload"
                                    style={{ display: "none" }}
                                />
                                <label htmlFor="file-upload">
                                    <Button 
                                        fullWidth
                                        variant="contained" 
                                        component="span"
                                        sx={{
                                            background: theme.palette.gradient.primary,
                                            color: "#fff",
                                            fontSize: "1rem",
                                            fontWeight: "bold",
                                            "&:hover": { background: "#C3ACD0" },
                                            padding: "14px 24px",
                                        }}
                                    >
                                        <CloudUploadIcon sx={{ mr: 1 }} /> Upload Video
                                    </Button>
                                </label>

                                {/* Show selected video file name */}
                                {videoData.fileName && (
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 1, gap: 1 }}>
                                        <Typography sx={{ fontSize: "0.9rem", color: theme.palette.primary.main }}>
                                            <VideoLibraryIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                                            {videoData.fileName}
                                        </Typography>
                                        <IconButton onClick={handleCancelFile} color="error">
                                            <CancelIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>

                            {/* Upload Thumbnail */}
                            <Box sx={{ width: "50%", textAlign: "center" }}>
                                <input 
                                    type="file" 
                                    name="thumbnail" 
                                    accept="image/*" 
                                    onChange={handleThumbnailChange} 
                                    required 
                                    id="thumbnail-upload" 
                                    style={{ display: "none" }} 
                                />
                                <label htmlFor="thumbnail-upload">
                                    <Button 
                                        fullWidth
                                        variant="contained" 
                                        component="span"
                                        sx={{
                                            background: theme.palette.gradient.primary,
                                            color: "#fff",
                                            fontSize: "1rem",
                                            fontWeight: "bold",
                                            "&:hover": { background: "#C3ACD0" },
                                            padding: "14px 24px",
                                        }}
                                    >
                                        <ImageIcon sx={{ mr: 1 }} /> Upload Thumbnail
                                    </Button>
                                </label>

                                {/* Show selected thumbnail file name */}
                                {videoData.thumbnailName && (
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 1, gap: 1 }}>
                                        <Typography sx={{ fontSize: "0.9rem", color: theme.palette.primary.main }}>
                                            {videoData.thumbnailName}
                                        </Typography>
                                        <IconButton onClick={handleCancelThumbnail} color="error">
                                            <CancelIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Video Duration Display */}
                        {videoData.duration > 0 && (
                            <Typography sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3, fontSize: "1rem", color: theme.palette.primary.main }}>
                                <AccessTimeIcon sx={{ marginRight: 1 }} /> Duration: {videoData.duration} seconds
                            </Typography>
                        )}

                        {/* Show uploaded video link */}
                        {uploadedVideoLink && (
                            <Typography sx={{ mt: 2, fontSize: "1rem", color: "#008080", textAlign: "center" }}>
                                 <a href={uploadedVideoLink} target="_blank" rel="noopener noreferrer">View Uploaded Video</a>
                            </Typography>
                        )}

                        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            disabled={loading} 
                            sx={{
                                margin: "auto",
                                background: theme.palette.primary.main,
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                "&:hover": { background: "#C3ACD0" },
                                padding: "14px 24px"
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Submit"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddVideo;
