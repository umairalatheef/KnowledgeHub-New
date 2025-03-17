import React, { useState, useEffect } from "react";
import "./About.css"; 
import kalam from "../assets/kalam.png";
import mandela from "../assets/mandela.png";
import educationTree from "../assets/aboutImg.png"; // Add your image here
import { useTheme } from "@mui/material/styles";

const slides = [
  {
    text: "If you want to shine like a sun, first burn like a sun.",
    author: "APJ Abdul Kalam",
    image: kalam, 
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    image: mandela, 
  },
];

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`about-container ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Introduction Section */}
      <section className="intro-section">
        <div className="intro-content">
          <div className="text-section">
            <h1 className="about-title">Affordable and Quality Education</h1>
            <p className="about-text">
              Knowledge Hub is a powerful learning management system designed to 
              empower students and educators. We provide a collaborative platform 
              where learners can access high-quality educational resources, courses, 
              and mentorship to enhance their skills and knowledge.
            </p>
            <p className="about-text">
              Our goal is to make education accessible, engaging, and efficient 
              through innovative technology and a user-friendly experience.
            </p>
          </div>
          <div className="image-section">
            <img src={educationTree} alt="Education Tree" className="education-tree-image" />
          </div>
        </div>
      </section>

      {/* Quotes Slider Section */}
      <div className="slide-container">
        <h2 className="quotes-title">Inspiring Words from Great Leaders</h2>
        <div className="slide fade">
          <img src={slides[currentSlide].image} alt="Quote Image" className="slide-image" />
          <p className="quote">{slides[currentSlide].text}</p>
          <h3 className="author">{slides[currentSlide].author}</h3>
        </div>
      </div>
    </div>
  );
};

export default About;
