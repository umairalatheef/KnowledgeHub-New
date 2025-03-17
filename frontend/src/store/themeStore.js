import { create } from "zustand";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import { CssBaseline } from "@mui/material";
import React from "react";

// ✅ Zustand Store for Theme State
const useThemeStore = create((set) => ({
  darkMode: JSON.parse(localStorage.getItem("darkMode") || "false"), // Ensure a valid boolean
  toggleTheme: () => {
    set((state) => {
      const newMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(newMode)); // Persist theme
      return { darkMode: newMode };
    });
  },
}));

// ✅ Define Light & Dark Themes
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#674188" },
    secondary: { main: "#ffffff" },
    background: { default: "#ffffff", paper: "#f5f5f5" },
    text: { primary: "#000000" },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#C3ACD0" },
    secondary: { main: "#ffffff" },
    background: { default: "#121212", paper: "#1e1e1e" },
    text: { primary: "#ffffff" },
  },
});

export default useThemeStore;


