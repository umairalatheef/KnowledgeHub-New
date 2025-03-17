import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#674188", // Deep Purple
    },
    secondary: {
      main: "#ffffff", // White
    },
    accent: {
      main: "#C3ACD0", // Soft Purple
    },
    background: {
      default: "#ffffff", // White Background
    },
    text: {
      primary: "#000000", // Black Text
      secondary: "#674188", // Deep Purple (for headings)
    },
    gradient: {
      primary: "linear-gradient(135deg, #674188, #C3ACD0)", //Primary Gradient
      accent: "linear-gradient(135deg, #C3ACD0, #E6C6E6)", //Accent Gradient
    },
  },
  typography: {
    fontFamily: "Inter, Poppins, sans-serif",
    h1: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      color: "#674188",
    },
    h2: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      color: "#674188",
    },
    h3: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      color: "#674188",
    },
    h4: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      color: "#674188",
    },
    button: {
      fontFamily: "Inter, sans-serif",
      fontWeight: "bold",
      textTransform: "none", // Prevents automatic uppercase
      color: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#674188", // Primary Color
          color: "#ffffff", // White Text
          padding: "12px 20px",
          fontSize: "1rem",
          fontWeight: "bold",
          borderRadius: "6px",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#C3ACD0", // Accent Color on hover
            color: "#000000", // Black text on hover
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#674188", // Primary Color
          textDecoration: "none",
          transition: "0.3s",
          "&:hover": {
            color: "#C3ACD0", // Accent Color
          },
        },
      },
    },
  },
});

export default theme;
