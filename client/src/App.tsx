import { Box, type AlertColor } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

// Redux
import { fetchCurrentUser } from "./redux/store/auth/auth-actions";

// Components
import Message from "./components/Message";
import type { AppDispatch, RootState } from "./redux/store";

// Light Theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#7C4DFF" },
    secondary: { main: "#FF4081" },
    background: { default: "#F5F5F5", paper: "#FFFFFF" },
    text: { primary: "#444" },
  },
  typography: {
    fontFamily: "Quicksand",
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 2,
  },
});

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#B388FF" },
    secondary: { main: "#FF4081" },
    background: { default: "#121212", paper: "#1E1E1E" },
    text: { primary: "#E0E0E0" },
  },
  typography: {
    fontFamily: "Quicksand",
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 2,
  },
});

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { type, message } = useSelector((state: RootState) => state.message);

  const [isDarkMode, setIsDarkMode] = useState(false);
  // const handleThemeToggle = () => setIsDarkMode((prev) => !prev);

  // Fetch user info and token from cookie on initial load
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <AppRoutes />
          {message && <Message message={message} type={type as AlertColor} />}
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
