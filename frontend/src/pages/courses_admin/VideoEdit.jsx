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
    IconButton,
    CardMedia,
    Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VideoSettingsIcon from "@mui/icons-material/VideoSettings"; // Import a video icon
import ImageIcon from "@mui/icons-material/Image";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@mui/material/styles";


const VideoEdit = () => {
    const { courseId, videoId } = useParams();
    const navigate = useNavigate();
    const [videoData, setVideoData] = useState({
        title: "",
        description: "",
        duration: 0,
        signed_url: "", //Fetch video file URL instead of signed_url
        thumbnail_url: "",  // New field for existing thumbnail

    });
    const [newVideo, setNewVideo] = useState(null);
    const [newThumbnail, setNewThumbnail] = useState(null); // New state for thumbnail
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await API.get(`/courses/${courseId}/videos/${videoId}/`);
                setVideoData(response.data);
                console.log("Fetched Video Data:", response.data); // Debugging
            } catch (err) {
                setError("Failed to load video data");
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [courseId, videoId]);

    const handleChange = (e) => {
        setVideoData({ ...videoData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewVideo(file);
            setVideoPreview(URL.createObjectURL(file)); // Show preview for newly uploaded video
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file)); // Show preview for newly uploaded thumbnail
        }
    };

    const handleCancelFile = () => {
        setNewVideo(null);
        setVideoPreview(null);
    };

    const handleCancelThumbnail = () => {
        setNewThumbnail(null);
        setThumbnailPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", videoData.title);
        formData.append("description", videoData.description);
        if (newVideo) {
            formData.append("video_file", newVideo); //Ensure new file is sent
        }
        if (newThumbnail) {
            formData.append("thumbnail", newThumbnail); // Send new thumbnail
        }

        try {
            await API.put(`/courses/${courseId}/videos/${videoId}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Update state with new thumbnail URL after successful update
            setVideoData((prev) => ({
                ...prev,
                thumbnail_url: response.data.thumbnail_url,  // Ensure backend returns updated URL
            }));
            navigate(`/admin_dashboard/courses/${courseId}`);
        } catch (err) {
            setError("Failed to update video");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: "center", mt: 5, py:2, mb: 3, background: theme.palette.gradient.primary, color: "white", borderRadius: "10px",}}>
                <Typography variant="h4" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <VideoSettingsIcon/>Edit Video
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={videoData.title}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                />
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

                {/* Display Existing Video Link (Not Preview) */}
                {videoData.signed_url && (
                    <Box sx={{ textAlign: "center", my: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Current Video:
                        </Typography>
                        <Tooltip title={videoData.signed_url}>
                            <Typography sx={{ fontSize: "0.9rem", color: theme.palette.primary.main, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {videoData.signed_url}
                            </Typography>
                        </Tooltip>
                    </Box>
                )}

                {/* Truncated Current Thumbnail URL*/}
                {videoData.thumbnail_url && !thumbnailPreview && (
                    <Box sx={{ textAlign: "center", my: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Current Thumbnail:</Typography>
                        <Tooltip title={videoData.thumbnail_url}>
                            <Typography sx={{ fontSize: "0.9rem", color: theme.palette.primary.main, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {videoData.thumbnail_url}
                            </Typography>
                        </Tooltip>
                    </Box>
                )}


                 {/* Upload New Video */}
                 {/* <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: "none" }} id="video-upload" />
                    <label htmlFor="video-upload">
                        <Button variant="contained" component="span" sx={{ mr: 2 }}>
                            <CloudUploadIcon /> Upload New Video
                        </Button>
                    </label>
                    {newVideo && (
                        <IconButton onClick={handleCancelFile} color="error">
                            <CancelIcon />
                        </IconButton>
                    )}
                </Box> */}

                {/* Upload Buttons (Side by Side) */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    <label htmlFor="video-upload">
                        <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: "none" }} id="video-upload" />
                        <Button variant="contained" component="span" sx={{ display: "flex", alignItems: "center" }}>
                            <CloudUploadIcon sx={{ mr: 1 }} /> Upload New Video
                        </Button>
                    </label>
                    
                    <label htmlFor="thumbnail-upload">
                        <input type="file" accept="image/*" onChange={handleThumbnailChange} style={{ display: "none" }} id="thumbnail-upload" />
                        <Button variant="contained" component="span" sx={{ display: "flex", alignItems: "center" }}>
                            <ImageIcon sx={{ mr: 1 }} /> Upload Thumbnail
                        </Button>
                    </label>
                </Box>

                {/* Show New Video Preview Only When Uploaded */}
                {videoPreview && (
                    <Box sx={{ textAlign: "center", my: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Video Preview:
                        </Typography>
                        <video width="100%" height="200" controls>
                            <source src={videoPreview} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <IconButton onClick={handleCancelFile} color="error"><CancelIcon /></IconButton>
                    </Box>
                )}




                
                {/* Show New Thumbnail Preview Only When Uploaded */}
                {thumbnailPreview && (
                    <Box sx={{ textAlign: "center", my: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Thumbnail Preview:
                        </Typography>
                        <CardMedia
                            component="img"
                            image={thumbnailPreview}
                            alt="Video Thumbnail"
                            sx={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }}
                        />
                        <IconButton onClick={handleCancelThumbnail} color="error"><CancelIcon /></IconButton>
                    </Box>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                        mt: 4,
                        background: theme.palette.primary.main,
                        color: "#fff",
                        "&:hover": { background: theme.palette.accent.main },
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: "bold",
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : "Update"}
                </Button>
            </form>
        </Container>
    );
};

export default VideoEdit;
