import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import baseTheme from "../theme/theme";
import useThemeStore from "../store/themeStore"; // Import Zustand store

//Light Theme(from baseTheme)
const lightTheme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: "light",
    },
  });
  
  //Dark Theme
  const darkTheme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: "dark",
      background: { default: "#121212", paper: "#1e1e1e" },
      text: { primary: "#ffffff" },
    },
  });
  
  //ThemeWrapper Component
  const ThemeWrapper = ({ children }) => {
    const { darkMode } = useThemeStore(); // Zustand store for theme state
    const theme = darkMode ? darkTheme : lightTheme; // Switch theme dynamically
  
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    );
  };

export default ThemeWrapper;
