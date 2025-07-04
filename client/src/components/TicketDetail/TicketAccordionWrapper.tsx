import { Box } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

// Main Component
const TicketAccordionWrapper = ({ children }: Props) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {children}
    </Box>
  );
};

export default TicketAccordionWrapper;
