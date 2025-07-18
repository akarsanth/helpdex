import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useNavigate, useParams } from "react-router-dom";
import type { Ticket } from "../types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import TicketHeaderSection from "../components/TicketDetail/TicketHeaderSection";
import TicketAccordionWrapper from "../components/TicketDetail/TicketAccordionWrapper";
import TicketCommentsAccordion from "../components/TicketDetail/TicketCommentsAccordion";
import TicketInfoAccordion from "../components/TicketDetail/TicketInfoAccordion";
import TicketEditAccordion from "../components/TicketDetail/TicketEditAccordion";
import TicketAttachmentsAccordion from "../components/TicketDetail/TicketAttachmentsAccordion";
import {
  getTicketById,
  updateTicketStatus,
  assignDeveloper,
} from "../services/ticket-service";
import type { StatusName } from "../utils/status-transition";

// Main Component
const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const role = currentUser?.role;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicket = useCallback(async () => {
    try {
      const data = await getTicketById(ticketId!);
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  console.log(ticket);

  const handleStatusOrAssignment = async (
    action: "status" | "assign",
    payload: StatusName | { developerId: string }
  ) => {
    try {
      const updated =
        action === "status"
          ? await updateTicketStatus(ticketId!, payload as StatusName)
          : await assignDeveloper(
              ticketId!,
              (payload as { developerId: string }).developerId
            );

      setTicket(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket.");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!ticket) return <Alert severity="error">Ticket not found.</Alert>;

  // For go back button
  const getBackRoute = () => {
    switch (role) {
      case "qa":
        return "/dashboard/all-tickets";
      case "developer":
        return "/dashboard/assigned";
      case "client":
      default:
        return "/dashboard/my-tickets";
    }
  };

  return (
    <Box sx={{ mx: "auto", mt: 4, px: 2 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(getBackRoute())}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        View All Tickets
      </Button>

      <TicketHeaderSection
        ticket={ticket}
        onStatusOrAssignment={handleStatusOrAssignment}
      />

      <TicketAccordionWrapper>
        <TicketInfoAccordion ticket={ticket} />
        <TicketEditAccordion ticket={ticket} onUpdate={fetchTicket} />
        <TicketAttachmentsAccordion attachments={ticket.attachments} />
        <TicketCommentsAccordion
          ticketId={ticket._id}
          initialComments={ticket.comments}
        />
      </TicketAccordionWrapper>
    </Box>
  );
};

export default TicketDetail;
