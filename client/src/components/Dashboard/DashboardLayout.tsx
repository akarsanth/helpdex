import React from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { styled } from "@mui/material";

const drawerWidth = 240;
const BrandLogo = styled("img")`
  height: 65px;
  width: auto;
`;

const roleLinks: Record<
  string,
  { label: string; path: string; icon: React.ReactNode }[]
> = {
  client: [
    { label: "My Tickets", path: "/dashboard/my-tickets", icon: <InboxIcon /> },
    {
      label: "Create Ticket",
      path: "/dashboard/create-ticket",
      icon: <MailIcon />,
    },
    { label: "Profile", path: "/dashboard/profile", icon: <InboxIcon /> },
  ],
  developer: [
    {
      label: "Assigned Tickets",
      path: "/dashboard/assigned",
      icon: <InboxIcon />,
    },
    { label: "Progress", path: "/dashboard/progress", icon: <MailIcon /> },
    { label: "Profile", path: "/dashboard/profile", icon: <InboxIcon /> },
  ],
  qa: [
    {
      label: "All Tickets",
      path: "/dashboard/all-tickets",
      icon: <InboxIcon />,
    },
    { label: "Categories", path: "/dashboard/categories", icon: <MailIcon /> },
    { label: "Statuses", path: "/dashboard/statuses", icon: <InboxIcon /> },
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

// Main Component
export default function DashboardLayout(props: Props) {
  const location = useLocation();

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const role = useSelector((state: RootState) => state.auth.user?.role);
  const links = roleLinks[role || ""] || [];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        {/* Mobile Drawer */}
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

        {/* Desktop Drawer */}
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
