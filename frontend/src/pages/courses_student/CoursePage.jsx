import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  Container,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Button,
  Alert,
  Box,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import ImageIcon from "@mui/icons-material/Image";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchCourse = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // Check if the user is enrolled
        const overviewResponse = await axios.get(
          `http://127.0.0.1:8000/api/v1/student_dashboard/overview/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const enrolledCoursesFromOverview  = overviewResponse.data.enrolled_courses.map(c => c.course);
        const isUserEnrolled  = enrolledCoursesFromOverview .includes(parseInt(courseId));
        setIsEnrolled(isUserEnrolled );

        // Fetch enrolled courses separately if user enrolled
        const courseUrl = isUserEnrolled
          ? `http://127.0.0.1:8000/api/v1/courses/student/enrolled/${courseId}/`
          : `http://127.0.0.1:8000/api/v1/courses/public/${courseId}/`;

        const courseResponse = await axios.get(courseUrl, {
          headers: isUserEnrolled ? { Authorization: `Bearer ${token}` } : {}
        });

        setCourse(courseResponse.data);
      } catch (err) {
        setError("Failed to load course details. Make sure you're logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) return <Container sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ textAlign: "center", mt: 5 }}>{error}</Container>;

  return (
    <Container sx={{ mt: 4 }}>
      {/* Course Image (If available, otherwise will show a placeholder) */}
      {course.image_url ? (
        <CardMedia
          component="img"
          height="300"
          image={course.image_url}
          alt="Course Image"
          sx={{ objectFit: "cover", borderRadius: "10px", width: "100%" }}
        />
      ) : (
        <Box
          sx={{
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
            borderRadius: "10px",
          }}
        >
          <ImageIcon sx={{ fontSize: 100, color: "#aaa" }} />
        </Box>
      )}
      <Typography variant="h4" fontWeight="bold" sx={{ textAlign: "center", padding: "20px", color: "white", background: theme.palette.gradient.primary, borderRadius: "10px" }}>
        {course.title}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>{course.description}</Typography>

      {/* Enroll Button for Non-Enrolled Users */}
      {!isEnrolled && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          You are not enrolled in this course. Enroll to access full content.
        </Alert>
      )}
      {!isEnrolled && (
        <Button
          variant="contained"
          color="primary"
          sx={{ display: "block", mx: "auto", mt: 2 }}
          onClick={() => navigate(`/cart/${courseId}`)} // Redirect to cart page
        >
          Enroll in Course
        </Button>
      )}

      {/* Course Videos */}
      <Typography variant="h5" sx={{ mt: 4, fontWeight: "bold" }}>Course Videos</Typography>
      {course.videos.length > 0 ? (
        course.videos.map((video, index) => (
          <Card key={video.id || index} sx={{ mt: 2, display: "flex", alignItems: "center", padding: "10px" }}>
            {/* Video Thumbnail (or Default Placeholder) */}
            {/* {video.thumbnail_url ? (
              <CardMedia
                component="img"
                image={video.thumbnail_url}
                alt="Video Thumbnail"
                sx={{ width: 120, height: 70, borderRadius: "5px", objectFit: "cover", mr: 2 }}
              />
            ) : (
              <Box
                sx={{ width: 120, height: 70, display: "flex", alignItems: "center", justifyContent: "center", background: "#ddd", borderRadius: "5px", mr: 2 }}
              >
                <ImageIcon sx={{ fontSize: 40, color: "#aaa" }} />
              </Box>
            )} */}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{video.title}</Typography>
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={() => isEnrolled ? navigate(`/student/course/${courseId}/video/${video.id}`) : alert("You are not enrolled in this course. Please enroll to access this video.")}
                disabled={!isEnrolled} // Disable if not enrolled
              >
                {isEnrolled ? "Watch Video" : "Locked 🔒"}
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography sx={{ mt: 2 }}>No videos available.</Typography>
      )}

      {/* Course Resources */}
      <Typography variant="h5" sx={{ mt: 4, fontWeight: "bold" }}>Course Resources</Typography>
      {course.resources.length > 0 ? (
        course.resources.map((resource, index) => (
          <Card key={resource.id || index} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">{resource.title}</Typography>
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={() => isEnrolled ? window.open(resource.file, "_blank") : alert("You are not enrolled in this course. Please enroll to access this resource.")}
                disabled={!isEnrolled} // Disable if not enrolled
              >
                {isEnrolled ? "Download" : "Locked 🔒"}
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography sx={{ mt: 2 }}>No resources available.</Typography>
      )}
    </Container>
  );
};

export default CoursePage;
