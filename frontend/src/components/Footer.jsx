import React, { use } from "react";
import "./Footer.css"; // Import styles
import { useTheme } from "@mui/material/styles";

const Footer = () => {
  const theme = useTheme();
  return (
    <footer 
      className="footer"
      style={{
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} KnowledgeHub. All rights reserved.</p>
        <ul className="footer-links">
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
