import React from "react";
import "./Homepage.css";
import reactImg from "../assets/reactcourse.jpg";
import pythonImg from "../assets/pythoncourse.jpg";
import cybersecurityImg from "../assets/cybersecurity.jpg";
import { useTheme } from "@mui/material/styles";

const Homepage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; //Detect DArk theme
  const s3ImageUrl =
    "https://knowledgehub-bkt-25.s3.ap-south-1.amazonaws.com/static/images/bg_light_dark.png";

  // Function to scroll to Featured Courses
  const scrollToCourses = () => {
    document.getElementById("featured-courses").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`homepage-container ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Your Gateway to Limitless Learning & Success!</h1>
            <p>Learn from industry experts and master new skills today!</p>
            <button className="cta-button" onClick={scrollToCourses}>
              Explore Courses
            </button>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="featured-courses" className="featured-courses">
        <h2>Learn from the best</h2>
        <div className="course-grid">
          <div className="course-card">
            <div className="image-container">
              <img src={reactImg} alt="React Mastery" className="course-image" />
            </div>
            <div className="course-info">
              <h3>React Mastery</h3>
              <p>Learn modern React.js with real projects.</p>
            </div>
          </div>
          <div className="course-card">
            <div className="image-container">
              <img src={pythonImg} alt="Python Course" className="course-image" />
            </div>
            <div className="course-info">
              <h3>Python Django</h3>
              <p>Master Python & backend development.</p>
            </div>
          </div>
          <div className="course-card">
            <div className="image-container">
              <img
                src={cybersecurityImg}
                alt="Cybersecurity"
                className="course-image"
              />
            </div>
            <div className="course-info">
              <h3>Cyber Security</h3>
              <p>Cybersecurity course for beginners.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="hero-image-container">
        <img src={s3ImageUrl} alt="Learning Illustration" />
      </div>
    </div>
  );
};

export default Homepage;
