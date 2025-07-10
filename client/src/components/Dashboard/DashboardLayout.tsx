import React from "react";
import { useEffect } from "react";
import { fetchMeta } from "../../redux/store/global/global-slice";
import logo from "../../assets/logo.png";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { styled } from "@mui/material";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import { logoutUser } from "../../redux/store/auth/auth-actions";
import { setMessage } from "../../redux/store/message/message-slice";

// Set drawer width
const drawerWidth = 240;

// Styled logo inside the sidebar
const BrandLogo = styled("img")`
  height: 65px;
  width: auto;
`;

// Role-based sidebar links
const roleLinks: Record<
  string,
  { label: string; path: string; icon: React.ReactNode }[]
> = {
  client: [
    { label: "Home", path: "/dashboard", icon: <InboxIcon /> },
    { label: "My Tickets", path: "/dashboard/my-tickets", icon: <InboxIcon /> },
    {
      label: "Create Ticket",
      path: "/dashboard/create-ticket",
      icon: <MailIcon />,
    },
    { label: "Profile", path: "/dashboard/profile", icon: <InboxIcon /> },
  ],
  developer: [
    { label: "Home", path: "/dashboard", icon: <InboxIcon /> },
    {
      label: "Assigned Tickets",
      path: "/dashboard/assigned",
      icon: <InboxIcon />,
    },
    { label: "Profile", path: "/dashboard/profile", icon: <InboxIcon /> },
  ],
  qa: [
    { label: "Home", path: "/dashboard", icon: <InboxIcon /> },
    {
      label: "All Tickets",
      path: "/dashboard/all-tickets",
      icon: <InboxIcon />,
    },
    { label: "Categories", path: "/dashboard/categories", icon: <MailIcon /> },
    { label: "Profile", path: "/dashboard/profile", icon: <InboxIcon /> },
  ],
  admin: [
    { label: "Users", path: "/dashboard/users", icon: <InboxIcon /> },
    { label: "Settings", path: "/dashboard/settings", icon: <MailIcon /> },
    { label: "Reports", path: "/dashboard/reports", icon: <InboxIcon /> },
  ],
};

interface Props {
  window?: () => Window;
}

export default function DashboardLayout(props: Props) {
  const { window } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Drawer open state for small screens
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Anchor for avatar menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Get user data from Redux
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const role = user?.role || "";
  const links = roleLinks[role] || [];

  // To fetch category
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchMeta());
    }
  }, [dispatch, accessToken]);

  // Open drawer on small screens
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Open avatar dropdown
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Close avatar menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => navigate("/login"))
      .catch(() =>
        dispatch(setMessage({ type: "error", message: "Logout failed!" }))
      );
    navigate("/login");
    handleMenuClose();
  };

  // Get user initials for Avatar
  const getInitials = () => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Sidebar drawer content
  const drawer = (
    <div>
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrandLogo src={logo} />
      </Toolbar>
      <Divider />
      <List>
        {links.map(({ label, path, icon }) => (
          <ListItem key={label} disablePadding onClick={() => navigate(path)}>
            <ListItemButton selected={location.pathname === path}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  // For responsive drawer behavior
  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top navigation bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {/* Hamburger icon for mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title */}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>

          {/* Avatar icon with dropdown menu */}
          <Tooltip title="Account">
            <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
              <Avatar src={user?.avatar?.url}>{getInitials()}</Avatar>
            </IconButton>
          </Tooltip>

          {/* Menu displayed on avatar click */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {/* Optional user info */}
            <MenuItem disabled>
              <Typography variant="body2">{user?.name || "User"}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                navigate("/dashboard/profile");
                handleMenuClose();
              }}
            >
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        {/* Temporary drawer for mobile */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* Space to offset AppBar height */}
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
