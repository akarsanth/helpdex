import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Link,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import type { Ticket } from "../../types";

interface Props {
  attachments: Ticket["attachments"];
}

const TicketAttachmentsAccordion = ({ attachments }: Props) => (
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
      aria-controls="attachments-content"
      sx={{
        borderLeft: 4,
        borderColor: "primary.main",
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
      }}
    >
      <Typography fontWeight="bold">Attachments</Typography>
    </AccordionSummary>

    <AccordionDetails sx={{ borderTop: 1, borderColor: "grey.100", py: 3 }}>
      {attachments && attachments.length > 0 ? (
        <List dense>
          {attachments.map((file) => (
            <ListItem
              key={file._id}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <InsertDriveFileIcon fontSize="small" sx={{ mr: 1 }} />
              <Link
                href={file.path}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                underline="hover"
                sx={{ color: "primary.main" }}
              >
                {file.original_name}
              </Link>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No attachments found.
        </Typography>
      )}
    </AccordionDetails>
  </Accordion>
);

export default TicketAttachmentsAccordion;
