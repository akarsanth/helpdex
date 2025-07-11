import { Box, Typography } from "@mui/material";
import BasicProfileForm from "../components/Profile/BasicProfileForm";
import AvatarSection from "../components/Profile/AvatarSection";
import PasswordUpdateForm from "../components/Profile/PasswordUpdate";
import EmailUpdateForm from "../components/Profile/EmailUpdate";

const Profile = () => {
  return (
    <Box sx={{ maxWidth: 786, mx: "auto", mt: 4, mb: 8, px: 2 }}>
      <Typography variant="h6" sx={{ mb: 4, textAlign: "center" }}>
        My Profile
      </Typography>

      {/* Avatar Section */}
      <AvatarSection />

      {/* Basic Profile Form */}
      <BasicProfileForm />

      {/* Email Update Form */}
      <EmailUpdateForm />

      {/* Password */}
      <PasswordUpdateForm />
    </Box>
  );
};

export default Profile;
