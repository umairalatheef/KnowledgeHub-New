import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, CircularProgress, Typography, Box, InputAdornment, IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const UsersSection = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [resetOpen, setResetOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    // Fetch students
    const fetchStudents = async () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/admin_dashboard/students/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data || []);
            setFilteredStudents(response.data || []);
        } catch (error) {
            toast.error("Failed to fetch students!", { position: "top-center", theme: "colored" });
        } finally {
            setLoading(false);
        }
    };

    // Handle Search Functionality
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        setFilteredStudents(
            students.filter(student =>
                student.id.toString().includes(value) ||
                student.username.toLowerCase().includes(value) ||
                student.email.toLowerCase().includes(value) ||
                (student.first_name && student.first_name.toLowerCase().includes(value)) ||
                (student.last_name && student.last_name.toLowerCase().includes(value))
            )
        );
    };

    // DELETE Student Prompt
    const handleDeletePrompt = (student) => {
        toast.dismiss();
        toast.error(
            <div>
                <div style={{
                    backgroundColor: "#674188",
                    padding: "10px",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "6px 6px 0 0",
                    textAlign: "center"
                }}>
                    ⚠️ Confirm Deletion
                </div>
                <div style={{ padding: "15px" }}></div>
                <Typography sx={{ mb: 2 }}>
                    Are you sure you want to delete <strong>{student?.username}</strong>?  
                    This action <strong>cannot be undone</strong>.
                </Typography>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <Button sx={{ background: "#674188", color: "#fff", "&:hover": { background: "#512A77" } }}
                        onClick={() => toast.dismiss()}>
                        Cancel
                    </Button>
                    <Button sx={{ background: "#D32F2F", color: "#fff", "&:hover": { background: "#B71C1C" } }}
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem("accessToken");
                                await axios.delete(`${BASE_URL}/api/v1/admin_dashboard/students/${student.id}/delete/`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setStudents(students.filter(s => s.id !== student.id));
                                setFilteredStudents(filteredStudents.filter(s => s.id !== student.id));
                                toast.dismiss();
                                toast.success(`${student.username} deleted successfully!`, { position: "top-center", theme: "colored" });
                            } catch (error) {
                                toast.dismiss();
                                toast.error("Failed to delete student!", { position: "top-center", theme: "colored" });
                            }
                        }}>
                        Delete
                    </Button>
                </div>
            </div>, 
            { position: "top-center", autoClose: false, closeOnClick: false, closeButton: false, transition: Slide }
        );
    };

    // OPEN Reset Password Prompt
    const handleOpenResetPassword = (student) => {
        setSelectedStudent(student);
        setNewPassword("");
        setTimeout(() => setResetOpen(true), 100); //Ensures state updates properly
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            toast.dismiss();
            toast.warning("Please enter a new password.", { position: "top-center", theme: "colored" });
            return;
        }

        const token = localStorage.getItem("accessToken");
        try {
            await axios.post(
                `${BASE_URL}/api/v1/admin_dashboard/students/${selectedStudent.id}/reset-password/`, 
                { new_password: newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.dismiss();
            toast.success(`Password updated for ${selectedStudent.username}`, { position: "top-center", theme: "colored" });
            setResetOpen(false);
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to reset password!", { position: "top-center", theme: "colored" });
        }
    };

    return (
        <Box sx={{ padding: "20px", maxWidth: "1100px", margin: "auto", mt: "-40px" }}>
            <ToastContainer autoClose={3000} position="top-center" transition={Slide} />

            {/*  Gradient Title Header */}
            <Box sx={{
                display:"flex",
                textAlign: "center",
                justifyContent:"center",
                py: 3,
                background: `linear-gradient(135deg, #674188, #A084DC)`,
                color: "white",
                borderRadius: "12px",
                mb: 2,
                mt: -6,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                height: "100px",
            }}>
                <Typography variant="h3" sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    fontSize: "2rem",
                }}>
                    <SchoolIcon fontSize="large" /> Student Management
                </Typography>
            </Box>

            {/*  Search Bar */}
            <TextField
                variant="outlined"
                placeholder="Search Students..."
                fullWidth
                sx={{
                    maxWidth: "400px",
                    mb: 2,
                    background: "transparent",
                    borderRadius: "8px",
                    boxShadow: "0px 3px 5px rgba(0,0,0,0.1)",
                    border: "1px solid #ddd",
                    "&:hover": { borderColor: "#A084DC" },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="primary" />
                        </InputAdornment>
                    ),
                }}
                value={searchTerm}
                onChange={handleSearch}
            />

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#A67EC8", color: "#fff" }}>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map(student => (
                            <TableRow key={student.id} sx={{ "&:hover": { backgroundColor: "#D3D3D3", transition: "0.3s ease" } }}>
                                <TableCell>{student.id}</TableCell>
                                <TableCell>{student.username}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        size="small" 
                                        onClick={() => handleDeletePrompt(student)}
                                        sx={{
                                            marginRight: "10px", 
                                            background: "#674188", 
                                            color: "#fff",
                                            borderRadius: "8px",
                                            "&:hover": { background: "#B71C1C" }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        size="small" 
                                        onClick={() => handleOpenResetPassword(student)}
                                        sx={{
                                            background: "#674188", 
                                            color: "#fff",
                                            borderRadius: "8px",
                                            "&:hover": { background: "#512A77" }
                                        }}
                                    >
                                        Reset Password
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* RESET PASSWORD DIALOG (Now Appears Correctly) */}
            <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
                <DialogTitle 
                    sx={{ 
                        fontWeight: "bold", 
                        textAlign: "center", 
                        background: "#674188", 
                        color: "#fff", 
                        padding: "10px"
                    }}
                >
                    🔑 Reset Password
                </DialogTitle>
                <DialogContent sx={{ padding: "20px" }}>
                    <Typography sx={{ mb: 2, fontSize: "16px", textAlign: "center" }}>
                        Enter a new password for <strong>{selectedStudent?.username}</strong>
                    </Typography>
                    <TextField 
                        fullWidth 
                        label="New Password" 
                        type={showPassword ? "text" : "password"}
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetOpen(false)} 
                        sx={{ fontWeight: "bold", background: "#674188", color: "#fff", "&:hover": { background: "#495057" } }}>
                        Cancel
                    </Button>
                    <Button onClick={handleResetPassword} 
                        sx={{ fontWeight: "bold", background: "#674188", color: "#fff", "&:hover": { background: "#512A77" } }}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersSection;
