import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Ticket } from "../types";

// MUI Components
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Service
import { getTicketById } from "../services/ticket-service";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch ticket by ID
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTicketById(ticketId!);
        setTicket(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [ticketId]);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!ticket) return <Alert severity="error">Ticket not found.</Alert>;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" gutterBottom>
        Ticket Details
      </Typography>

      <Typography>
        <strong>Title:</strong> {ticket.title}
      </Typography>
      <Typography>
        <strong>Description:</strong> {ticket.description || "-"}
      </Typography>
      <Typography>
        <strong>Priority:</strong> {ticket.priority}
      </Typography>
      <Typography>
        <strong>Status:</strong> {ticket.status.name}
      </Typography>
      <Typography>
        <strong>Category:</strong> {ticket.category.name}
      </Typography>
      <Typography>
        <strong>Created By:</strong> {ticket.created_by.name}
      </Typography>
      <Typography>
        <strong>Created At:</strong>{" "}
        {new Date(ticket.createdAt).toLocaleString()}
      </Typography>

      {ticket.assigned_to && (
        <Typography>
          <strong>Assigned To:</strong> {ticket.assigned_to.name}
        </Typography>
      )}

      {ticket.assigned_by && (
        <Typography>
          <strong>Assigned By:</strong> {ticket.assigned_by.name}
        </Typography>
      )}

      {ticket.verified_by && (
        <Typography>
          <strong>Verified By:</strong> {ticket.verified_by.name}
        </Typography>
      )}

      {ticket.assigned_at && (
        <Typography>
          <strong>Assigned At:</strong>{" "}
          {new Date(ticket.assigned_at).toLocaleString()}
        </Typography>
      )}

      {ticket.deadline && (
        <Typography>
          <strong>Deadline:</strong>{" "}
          {new Date(ticket.deadline).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
};

export default TicketDetail;
