import React, { useState, useEffect } from "react";
import API from "../../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Box,
    CircularProgress,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Card,
    CardContent,
    IconButton,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@mui/material/styles";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";


const AddResource = () => {
    const theme = useTheme();
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const [resourceData, setResourceData] = useState({ title: "", file: null, resource_type: "" });
    const [filePreview, setFilePreview] = useState(null); // Store selected file link
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Course ID from URL:", courseId);
        if (!courseId) {
            setError("Error: Course ID is missing. Please go back and try again.");
        }
    }, [courseId]);

    const handleChange = (e) => {
        setResourceData({ ...resourceData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResourceData({ ...resourceData, file });
            setFilePreview(URL.createObjectURL(file)); // Generate preview link
        }
    };

    const handleCancelFile = () => {
        setResourceData({ ...resourceData, file: null });
        setFilePreview(null);
        document.getElementById("file-upload").value = ""; // Reset file input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const lowercaseResourceType = resourceData.resource_type.toLowerCase();

        if (!courseId) {
            console.error("Error: Course ID is undefined!");
            setError("Course ID is missing. Cannot add resource.");
            setLoading(false);
            return;
        }

        if (!resourceData.file) {
            setError("Please select a resource file.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", resourceData.title);
            formData.append("file", resourceData.file);
            formData.append("resource_type", lowercaseResourceType);

            console.log("Submitting Resource Data:", Object.fromEntries(formData));

            const token = localStorage.getItem("accessToken");
            const response = await API.post(`/courses/${courseId}/resources/`, formData, {
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "multipart/form-data" 
                },
            });

            console.log("Resource uploaded successfully:", response.data);
            navigate(`/admin_dashboard/courses/${courseId}`);
        } catch (err) {
            console.error("API Error:", err.response?.data || err.message);
            setError("Failed to add resource. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
            <Box sx={{ textAlign: "center", py: 2, background: theme.palette.gradient.primary, color: "white", borderRadius: "10px" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <LibraryAddIcon /> Add Resource
                </Typography>
            </Box>
            <Card sx={{ padding: 4, borderRadius: 3, boxShadow: 3, mt: 2 }}>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <TextField 
                            fullWidth 
                            label="Resource Title" 
                            name="title" 
                            value={resourceData.title} 
                            onChange={handleChange} 
                            required 
                            sx={{ mb: 3 }} 
                        />

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>📁 Resource Type</InputLabel>
                            <Select
                                name="resource_type"
                                value={resourceData.resource_type}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="PDF"><PictureAsPdfIcon sx={{ marginRight: 1 }} /> PDF</MenuItem>
                                <MenuItem value="DOCX"><DescriptionIcon sx={{ marginRight: 1 }} /> Word Document</MenuItem>
                                <MenuItem value="PPT"><InsertDriveFileIcon sx={{ marginRight: 1 }} /> PowerPoint</MenuItem>
                                <MenuItem value="XLSX"><TableChartIcon sx={{ marginRight: 1 }} /> Excel</MenuItem>
                            </Select>
                        </FormControl>

                        {/* File Upload Input */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                            <input 
                                type="file" 
                                name="file" 
                                accept=".pdf, .docx, .ppt, .xlsx" 
                                onChange={handleFileChange} 
                                required 
                                id="file-upload"
                                style={{ display: "none" }}
                            />
                            <label htmlFor="file-upload">
                                <Button 
                                    variant="contained" 
                                    component="span"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        background: theme.palette.gradient.primary,
                                        color: "#fff",
                                        fontWeight: "bold",
                                        "&:hover": { background: "#C3ACD0" },
                                        padding: "14px 24px"
                                    }}
                                >
                                    <CloudUploadIcon /> Upload Resource File
                                </Button>
                            </label>
                        </Box>

                        {/* Show selected file link and cancel option */}
                        {filePreview && (
                            <Box sx={{ textAlign: "center", mb: 2 }}>
                                <Typography variant="body1" sx={{ color: "#333", fontWeight: "bold" }}>
                                    Selected File:{" "}
                                    <a href={filePreview} target="_blank" rel="noopener noreferrer" style={{ color: "#674188" }}>
                                        {resourceData.file.name}
                                    </a>
                                    <IconButton color="error" onClick={handleCancelFile} sx={{ ml: 1 }}>
                                        <CancelIcon />
                                    </IconButton>
                                </Typography>
                            </Box>
                        )}

                        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

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

export default AddResource;
