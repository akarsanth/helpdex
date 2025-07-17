import { useState, useEffect } from "react";
import { Box, Chip, Typography, Button } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { Ticket } from "../../types";
import {
  getNextStatusForRole,
  getActionLabel,
  requiresAssignment,
  type StatusName,
} from "../../utils/status-transition";
import AssignDeveloperModal from "./AssignDeveloperModal";
import { fetchDevelopers, type Developer } from "../../services/ticket-service";
import { statusColorMap } from "../../utils/status-transition";

interface Props {
  ticket: Ticket;
  onStatusOrAssignment: (
    action: "status" | "assign",
    payload: StatusName | { developerId: string }
  ) => void;
}

const TicketHeaderSection = ({ ticket, onStatusOrAssignment }: Props) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const role = currentUser!.role;

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const currentStatus = ticket.status as StatusName;
  const nextStatus = getNextStatusForRole(currentStatus, role);
  const buttonLabel = getActionLabel(currentStatus, role);
  const needsAssignment = requiresAssignment(currentStatus, role);

  useEffect(() => {
    if (needsAssignment) {
      fetchDevelopers().then(setDevelopers);
    }
  }, [needsAssignment]);

  const handleClick = () => {
    if (needsAssignment) {
      handleOpen();
    } else if (nextStatus) {
      onStatusOrAssignment("status", nextStatus);
    }
  };

  const handleAssignSuccess = (developerId: string) => {
    onStatusOrAssignment("assign", { developerId });
    handleClose();
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      sx={{
        mb: 3,
        mt: 3,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      {/* Status */}
      <Box>
        <Chip
          label={ticket.status}
          color={statusColorMap[currentStatus]}
          sx={{ fontWeight: "bold" }}
        />
      </Box>

      {/* Title & Reporter */}
      <Box sx={{ flexGrow: 1, minWidth: 200 }}>
        <Typography variant="h6" fontWeight="bold">
          {ticket.title} (#{ticket._id.slice(-6)})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reported by: {ticket.created_by.name}
        </Typography>
      </Box>

      {/* Status/Assign Button */}
      {nextStatus && buttonLabel && (
        <Box display="flex" gap={1}>
          <Button variant="contained" color="primary" onClick={handleClick}>
            {buttonLabel}
          </Button>
        </Box>
      )}

      {/* Assign Modal */}
      {open && (
        <AssignDeveloperModal
          open={open}
          ticketId={ticket._id}
          developers={developers}
          onClose={handleClose}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </Box>
  );
};

export default TicketHeaderSection;
