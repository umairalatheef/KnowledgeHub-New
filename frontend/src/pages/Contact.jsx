import { useState, useEffect } from "react";
import "./Contact.css"; 
import { useTheme } from "@mui/material/styles";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const theme = useTheme(); 
  const isDarkMode = theme.palette.mode === "dark";

  // Update body attribute to apply dark theme dynamically
  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formUrl =
      "https://script.google.com/macros/s/AKfycbwJlTD__Pnv62pcTxgP8De9aZcE5Zv0ipFdldSRT_mczAUX5tDAoNIrfW__OPxhhGcR/exec";
    const formDataEncoded = new URLSearchParams(formData).toString();

    try {
      const response = await fetch(formUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formDataEncoded,
      });

      if (response.ok) {
        alert("Form submitted successfully ✔");
        window.location.reload();
      } else {
        alert("Something went wrong ❌");
      }
    } catch (error) {
      alert("Something went wrong ❌");
      console.error("Error:", error);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        <h2 className="contact-title">Feel Free to Contact Us</h2>
        <p className="contact-subtext">
          We are here to assist you. Drop your query below, and we’ll get back to you as soon as possible.
        </p>
        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Your Name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Your Email"
            required
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write Your Message"
            required
          />
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
