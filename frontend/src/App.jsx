import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ThemeWrapper from "./components/ThemeWrapper"; // Import Theme Wrapper
import Header from "./components/Header"; // Ensure Header is inside ThemeWrapper
import Layout from "./components/Layout";
import { CssBaseline } from "@mui/material";

// Pages (Imports remain the same)
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/userauths/Register";
import Login from "./pages/userauths/Login";
import ForgotPassword from "./pages/userauths/ForgotPassword";
import ResetPassword from "./pages/userauths/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import Courses from "./pages/courses_admin/Courses";
import AddCourse from "./pages/courses_admin/AddCourse";
import CourseDetails from "./pages/courses_admin/CourseDetails";
import CourseEdit from "./pages/courses_admin/CourseEdit";
import VideoDetails from "./pages/courses_admin/VideoDetails";
import AddVideo from "./pages/courses_admin/AddVideo";
import VideoEdit from "./pages/courses_admin/VideoEdit";
import ResourceDetails from "./pages/courses_admin/ResourceDetails";
import AddResource from "./pages/courses_admin/AddResource";
import ResourceEdit from "./pages/courses_admin/ResourceEdit";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import CoursePage from "./pages/courses_student/CoursePage";
import VideoPlayer from "./pages/courses_student/VideoPlayer";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";

// Define Routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Ensures Header & Footer are always present
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/admin_dashboard", element: <AdminDashboard /> },
      { path: "/admin/profile", element: <AdminProfile /> },
      { path: "/admin_dashboard/courses", element: <Courses /> },
      { path: "/admin_dashboard/courses/add", element: <AddCourse /> },
      { path: "/admin_dashboard/courses/:id", element: <CourseDetails /> },
      { path: "/admin_dashboard/courses/:id/edit", element: <CourseEdit /> },
      { path: "/admin_dashboard/courses/:id/add-video", element: <AddVideo /> },
      { path: "/admin_dashboard/courses/:courseId/videos/:videoId", element: <VideoDetails /> },
      { path: "/admin_dashboard/courses/:courseId/videos/:videoId/edit", element: <VideoEdit /> },
      { path: "/admin_dashboard/courses/:id/add-resource", element: <AddResource /> },
      { path: "/admin_dashboard/courses/:courseId/resources/:resourceId", element: <ResourceDetails /> },
      { path: "/admin_dashboard/courses/:courseId/resources/:resourceId/edit", element: <ResourceEdit /> },
      { path: "/student_dashboard", element: <StudentDashboard /> },
      { path: "/student/profile", element: <StudentProfile /> },
      { path: "/student/course/:courseId", element: <CoursePage /> },
      { path: "/student/course/:courseId/video/:videoId", element: <VideoPlayer /> },
      { path: "/cart/:courseId", element: <CartPage /> },
      { path: "/checkout/:courseId", element: <CheckoutPage /> },

    ],
  },
]);

function App() {
  return (
    <ThemeWrapper> {/* Wrap the entire app in ThemeWrapper */}
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeWrapper>
  );
}

export default App;
