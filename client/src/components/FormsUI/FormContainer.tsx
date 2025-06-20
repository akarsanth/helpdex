// MUI import
import { Box, Grid, Link, type LinkProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "react-router-dom";

// Merge the props from MUI Link and React Router Link
type FormLinkProps = LinkProps & RouterLinkProps;

// Styled Components
// For links in the forms
export const FormLink = styled((props: FormLinkProps) => (
  <Link component={RouterLink} {...props} />
))(({ theme }) => ({
  "&:hover": {
    color: theme.palette.text.primary,
  },
}));

// Props type
interface FormContainerProps {
  children: React.ReactNode;
}

// Main Component
const FormContainer = ({ children }: FormContainerProps) => {
  return (
    <Box sx={{ my: "auto" }}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 8, mb: 10 }}
      >
        <Grid
          size={{ xs: 11, sm: 10, md: 7, lg: 6, xl: 4 }}
          sx={(theme) => ({
            py: 3,
            px: { xs: 2, sm: 5 },
            boxShadow: theme.palette.mode === "light" ? 2 : "none",
            border: theme.palette.mode === "dark" ? "1px solid" : "none",
            borderColor:
              theme.palette.mode === "dark"
                ? theme.custom.borderColor.form
                : "transparent",
          })}
        >
          {children}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormContainer;
