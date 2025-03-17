import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import API from "../../utils/axios";
import axios from "axios";


const CheckoutPage = () => {
  const { courseId } = useParams();
  const [courseTitle, setCourseTitle] = useState("");
  const theme = useTheme();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchCourseTitle = async () => {
  //     try {
  //       const response = await API.get(`/courses/${courseId}/`);
  //       setCourseTitle(response.data.title);
  //     } catch (error) {
  //       console.error("Failed to fetch course title", error);
  //     }
  //   };
  //   fetchCourseTitle();
  // }, [courseId]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("User not authenticated. Please log in.");
        return;
      }
      //Enroll the user in the course
      const response = await axios.post(
        `http://127.0.0.1:8000/api/v1/courses/student/${courseId}/enroll/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      const enrolledResponse = await axios.get(
        `http://127.0.0.1:8000/api/v1/courses/student/enrolled/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Updated Enrolled Courses:", enrolledResponse.data);
      navigate("/student_dashboard");
    } catch (error) {
      console.error("Enrollment failed", error);
      alert(error.response?.data?.message || "Enrollment failed. Please try again.");
    }
  };

  return (
    <Container sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mt: 4, background: theme.palette.gradient.primary, color: "white", mb: 2, borderRadius: "10px", py: 3, }}>
        Checkout Page
      </Typography>
      <Typography variant="h6">
        You are about to purchase Course ID: {courseId}
      </Typography>
      
      <Button
        variant="contained"
        sx={{ mt: 3, background: "#5D3587", color: "white" }}
      >
        Pay Now (Coming Soon)
      </Button>
      <Button
        variant="contained"
        sx={{ mt: 3, ml: 2, background: theme.palette.primary.main, color: "white" }}
        onClick={handleEnroll}
      >
        Enroll for Free
      </Button>
    </Container>
  );
};

export default CheckoutPage;
