import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Ticket } from "../../types";

interface Props {
  ticket: Ticket;
}

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleString() : "-";

const TicketInfoAccordion = ({ ticket }: Props) => (
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
      <Typography fontWeight="bold">Ticket Information</Typography>
    </AccordionSummary>

    <AccordionDetails sx={{ borderTop: 1, borderColor: "grey.100", py: 3 }}>
      <Grid container spacing={2}>
        {[
          { label: "Priority Level", value: ticket.priority },
          { label: "Category", value: ticket.category?.name },
          { label: "Ticket Description", value: ticket.description },
          { label: "Assigned To (Developer)", value: ticket.assigned_to?.name },
          { label: "Assigned By (QA)", value: ticket.assigned_by?.name },
          { label: "Assignment Date", value: formatDate(ticket.assigned_at) },
          { label: "Resolution Date", value: formatDate(ticket.resolved_at) },
          { label: "Closed By (QA)", value: ticket.closed_by?.name },
          { label: "Closure Date", value: formatDate(ticket.closed_at) },
          { label: "Reopened On (QA)", value: formatDate(ticket.reopened_at) },
          { label: "Deadline", value: formatDate(ticket.deadline) },
          { label: "Created At", value: formatDate(ticket.createdAt) },
          { label: "Last Updated", value: formatDate(ticket.updatedAt) },
        ].map(({ label, value }) => (
          <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value || "-"}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

export default TicketInfoAccordion;
