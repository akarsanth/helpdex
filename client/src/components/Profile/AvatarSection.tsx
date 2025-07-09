import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Avatar,
  ButtonBase,
  CircularProgress,
  Box,
  Fade,
  Typography,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import type { RootState, AppDispatch } from "../../redux/store";
import { setMessage } from "../../redux/store/message/message-slice";
import { fetchCurrentUser } from "../../redux/store/auth/auth-actions";
import { uploadAvatar } from "../../services/user-service";

// Main Component
const AvatarSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [localAvatar, setLocalAvatar] = useState<string>(
    user?.avatar?.url || ""
  );
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // Allow re-selection of same file
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = () => setLocalAvatar(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      dispatch(setMessage({ type: "success", message: res.message }));
      dispatch(fetchCurrentUser()); // Refresh user info with new avatar
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload avatar";
      dispatch(setMessage({ type: "error", message: msg }));
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ButtonBase
        component="label"
        sx={{
          borderRadius: "50%",
          width: 80,
          height: 80,
          position: "relative",
          cursor: "pointer",
          transition: "transform 0.3s ease-in-out",
          "&:hover .hover-effect": {
            transform: "scale(1.02)",
            filter: "brightness(90%)",
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar preview with hover effect class */}
        <Avatar
          alt={user.name || "User Avatar"}
          src={localAvatar}
          className="hover-effect"
          sx={{
            width: "100%",
            height: "100%",
            transition: "transform 0.3s ease, filter 0.3s ease",
          }}
        />

        {/* Hover edit icon (bottom-right) */}
        <Fade in={hovered}>
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              right: 4,
              bgcolor: "background.paper",
              borderRadius: "50%",
              p: 0.5,
              boxShadow: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditIcon fontSize="small" />
            </Box>
          </Box>
        </Fade>

        {/* Upload spinner */}
        {uploading && (
          <CircularProgress
            size={48}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "rgba(255,255,255,0.8)",
            }}
          />
        )}

        {/* Hidden file input */}
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </ButtonBase>

      {/* User Info */}
      <Box>
        <Typography fontWeight={600}>{user.name}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Typography
            variant="body2"
            color={user.isEmailVerified ? "success.main" : "error.main"}
            fontWeight={500}
          >
            ({user.isEmailVerified ? "Verified" : "Not Verified"})
          </Typography>
        </Box>
        <Chip
          label={user.role.toUpperCase()}
          size="small"
          color="primary"
          sx={{ mt: 0.5 }}
        />
      </Box>
    </Box>
  );
};

export default AvatarSection;
