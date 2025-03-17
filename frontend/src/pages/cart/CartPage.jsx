import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Typography, Button, CircularProgress, Alert } from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

const CartPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/courses/public/${courseId}/`);
        setCourse(response.data);
      } catch (err) {
        setError("Failed to load course details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleProceedToCheckout = () => {
    navigate(`/checkout/${courseId}`);
  };

  if (loading) return <Container sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ textAlign: "center", mt: 5 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mt: 4, background: theme.palette.gradient.primary, color: "white", mb: 2, borderRadius: "10px", py: 3, }}>
        Course Enrollment
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
        {course.title}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1, mb: 3 }}>
        {course.description}
      </Typography>

      <Button
        variant="contained"
        sx={{
          background: theme.palette.primary.main,
          color: "white",
          fontWeight: "bold",
          mt: 2,
          "&:hover": { background: "#5D3587" }
        }}
        onClick={handleProceedToCheckout}
      >
        Proceed to Checkout
      </Button>
    </Container>
  );
};

export default CartPage;
