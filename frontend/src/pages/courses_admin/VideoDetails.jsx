import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/axios";
import {
    Box,
    Typography,
    CircularProgress,
    Button
} from "@mui/material";

const VideoDetails = () => {
    const { courseId, videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const[isPlaying, setIsPlaying] = useState(false); //Track play/pause state
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await API.get(`/courses/${courseId}/videos/${videoId}/`);
                setVideo(response.data);
                console.log("Video Data:", response.data)
            } catch (err) {
                setError("Failed to load video details");
            } finally {
                setLoading(false);
            }
        };
        fetchVideoDetails();
    }, [courseId, videoId]);

    const handleTogglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying); // Toggle play/pause state
        }
    };
    const handleRewind = () => {
        if (videoRef.current) videoRef.current.currentTime -= 10;
    };

    const handleForward = () => {
        if (videoRef.current) videoRef.current.currentTime += 10;
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ padding: "20px" }}>
            <Typography variant="h4">{video.title}</Typography>
            <Typography variant="body1">{video.description}</Typography>

            {/* Video Player */}
            {video.signed_url ? (
                <video ref = {videoRef} width="100%" controls onError={() => setError("Failed to load video")}>
                    <source src={video.signed_url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <Typography color="error">No video source available</Typography>
            )}



            {/* Video Controls */}
            <Box sx={{ marginTop: 2 }}>
                <Button variant="contained" sx={{ marginRight: 1 }} onClick={handleTogglePlayPause}>
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                </Button>                
                <Button variant="contained" sx={{ marginRight: 1 }} onClick={handleRewind}>⏪ Rewind</Button>
                <Button variant="contained" onClick={handleForward}>⏩ Forward</Button>
            </Box>
        </Box>
    );
};

export default VideoDetails;
