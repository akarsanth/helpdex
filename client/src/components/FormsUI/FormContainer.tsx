// MUI import
import { Link, Container, Box, Grid, type LinkProps } from "@mui/material";
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

// For Name fields (First name and last name)
export const NameFields = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
}));

// Props type
interface FormContainerProps {
  children: React.ReactNode;
}

// Main Component
const FormContainer = ({ children }: FormContainerProps) => {
  return (
    <Container>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 8, mb: 10 }}
      >
        <Grid
          size={{ xs: 12, md: 8, lg: 5.5 }}
          sx={{
            py: 3,
            px: { xs: 2, sm: 5 },
            border: "primary.main",
            boxShadow: 2,
          }}
        >
          {children}
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormContainer;
