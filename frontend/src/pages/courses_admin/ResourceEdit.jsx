import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/axios";
import { TextField, Button, Typography, Box, CircularProgress, Container, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@mui/material/styles";
import ArticleIcon from "@mui/icons-material/Article";

const ResourceEdit = () => {
    const { courseId, resourceId } = useParams();
    const navigate = useNavigate();
    const [resourceData, setResourceData] = useState({
        title: "",
        resource_type: "",
        file: null,
    });
    const [currentFile, setCurrentFile] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const response = await API.get(`/courses/${courseId}/resources/${resourceId}/`);
                setResourceData({
                    title: response.data.title,
                    resource_type: response.data.resource_type,
                });
                setCurrentFile(response.data.file); // Set current file URL
            } catch (err) {
                setError("Failed to load resource data");
            } finally {
                setLoading(false);
            }
        };
        fetchResource();
    }, [courseId, resourceId]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setResourceData({ ...resourceData, file: e.target.files[0] });
        }
    };

    const handleCancelFile = () => {
        setResourceData({ ...resourceData, file: null });
        document.getElementById("file-upload").value = ""; // Reset file input
    };

    const handleChange = (e) => {
        setResourceData({ ...resourceData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", resourceData.title);
            formData.append("resource_type", resourceData.resource_type);
            if (resourceData.file) {
                formData.append("file", resourceData.file);
            }

            await API.put(`/courses/${courseId}/resources/${resourceId}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            navigate(`/admin_dashboard/courses/${courseId}`);
        } catch (err) {
            setError("Failed to update resource");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: "center", mt: 5, py:2, mb: 3, background: theme.palette.gradient.primary, color: "white", borderRadius: "10px", }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <ArticleIcon/> Edit Resource
                </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={resourceData.title}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                />
                <TextField
                    fullWidth
                    label="Resource Type"
                    name="resource_type"
                    value={resourceData.resource_type}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                />

                {/* Current File */}
                {currentFile && (
                    <Typography sx={{ textAlign: "center", mt: 2 }}>
                        <strong>Current File: </strong>
                        <a href={currentFile} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                            View Current Resource
                        </a>
                    </Typography>
                )}

                {/* File Upload Section */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
                    <Button
                        component="label"
                        variant="contained"
                        sx={{
                            background: theme.palette.gradient.primary,
                            color: "#fff",
                            borderRadius: "8px",
                            padding: "10px 20px",
                            "&:hover": { background: "#5a3675" },
                        }}
                        startIcon={<UploadFileIcon />}
                    >
                        Upload New File
                        <input type="file" hidden id="file-upload" onChange={handleFileChange} />
                    </Button>

                    {/* Show selected file name */}
                    {resourceData.file && (
                        <Typography sx={{ ml: 2, color: "#333" }}>
                            {resourceData.file.name}
                            <IconButton color="error" onClick={handleCancelFile} sx={{ ml: 1 }}>
                                <CancelIcon />
                            </IconButton>
                        </Typography>
                    )}
                </Box>

                {/* Submit Button */}
                <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 3, background: "#674188" }}>
                    {loading ? <CircularProgress size={24} /> : "Update"}
                </Button>
            </form>
        </Container>
    );
};

export default ResourceEdit;
