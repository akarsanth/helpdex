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
import ThemeSwitch from "./components/ThemeSwitch";
import { CircularProgress } from "@mui/material";

// Extending theme
declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      borderColor: {
        form: string;
      };
    };
  }
  // allow configuration using `createTheme()`
  interface ThemeOptions {
    custom: {
      borderColor: {
        form: string;
      };
    };
  }
}

// Light Theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#165b5e" }, // from background
    secondary: { main: "#62c4da" }, // from icon
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
  custom: {
    borderColor: {
      form: "#165b5e",
    },
  },

  shape: {
    borderRadius: 2,
  },
});

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#37a2aa" }, // brighter teal tone
    secondary: { main: "#62c4da" },
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
  custom: {
    borderColor: {
      form: "#444", // or use grey[600]
    },
  },
  shape: {
    borderRadius: 2,
  },
});

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { type, message } = useSelector((state: RootState) => state.message);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const handleThemeToggle = () => setIsDarkMode((prev) => !prev);

  // Fetch user info and token from cookie on initial load
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // Until logged in state in determined
  if (isLoggedIn === undefined) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // full screen
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <AppRoutes />
          {message && <Message message={message} type={type as AlertColor} />}

          <Box
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1300, // above most other content
            }}
          >
            <ThemeSwitch
              onThemeChange={handleThemeToggle}
              isDarkMode={isDarkMode}
            />
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
