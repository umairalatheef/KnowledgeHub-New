import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/axios";
import {
    Box,
    Typography,
    CircularProgress,
    Button
} from "@mui/material";

const ResourceDetails = () => {
    const { courseId, resourceId } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResourceDetails = async () => {
            try {
                const response = await API.get(`/courses/${courseId}/resources/${resourceId}/`);
                setResource(response.data);
            } catch (err) {
                setError("Failed to load resource details");
            } finally {
                setLoading(false);
            }
        };
        fetchResourceDetails();
    }, [courseId, resourceId]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ padding: "20px" }}>
            <Typography variant="h4">{resource.title}</Typography>
            <Typography variant="body1">{resource.description}</Typography>
            
            {/* Download Button */}
            <Button variant="contained" color="primary" href={resource.file} download>
                📥 Download Resource
            </Button>
        </Box>
    );
};

export default ResourceDetails;
