import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  ticketId: string;
}

// Main Component
const TicketAttachmentsAccordion = ({ ticketId }: Props) => {
  console.log(ticketId);
  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: "grey.200",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        sx={{
          borderLeft: 4,
          borderColor: "primary.main",
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      >
        <Typography fontWeight="bold">Attachments</Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{ borderTop: 1, borderColor: "grey.100", py: 3 }}
      ></AccordionDetails>
    </Accordion>
  );
};

export default TicketAttachmentsAccordion;
