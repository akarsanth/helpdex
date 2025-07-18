import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { fetchTicketSummary } from "../../services/ticket-service";
import {
  STATUS_ORDER,
  statusBorderColorMap,
  rolePathMap,
} from "../../utils/status-transition";
import { useNavigate } from "react-router-dom";
import { type TicketSummaryResponse } from "../../services/ticket-service";

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [summary, setSummary] = useState<TicketSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchTicketSummary();
        setSummary(res);
      } catch (err) {
        const message = (err as Error)?.message || "Failed to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 4, mb: 8 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h5" sx={{ mb: 2 }} gutterBottom>
        Welcome, {currentUser?.name}!
      </Typography>

      {/* Ticket Stats */}
      {!error && (
        <Grid container spacing={2} mb={3}>
          {STATUS_ORDER.map((status) => (
            <Grid size={{ xs: 6, md: 4, lg: 3 }} key={status}>
              <Card
                sx={{
                  borderTop: `6px solid`,
                  borderColor: statusBorderColorMap[status] || "grey.300",
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1">
                    {status.toUpperCase()}
                  </Typography>
                  <Typography variant="h6">
                    {summary?.statusCounts[status] || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        endIcon={<ArrowForwardIcon />}
        onClick={() => {
          const role = currentUser?.role;
          const path = role ? rolePathMap[role] : undefined;
          if (path) navigate(path);
        }}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        View All Tickets
      </Button>

      {/* Recently Assigned Tickets */}
      {!error && summary?.recentAssignedTickets && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recently Assigned Tickets
          </Typography>
          {summary.recentAssignedTickets.length === 0 ? (
            <Typography>No recently assigned tickets.</Typography>
          ) : (
            <Grid container spacing={2} mb={3}>
              {summary.recentAssignedTickets.map((ticket) => (
                <Grid size={{ xs: 12, md: 4 }} key={ticket._id}>
                  <Card
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      const path = rolePathMap[currentUser?.role || ""];
                      if (path) navigate(`${path}/${ticket._id}`);
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2">
                        Assigned:{" "}
                        {new Date(ticket.assigned_at!).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Status: {ticket.status}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Upcoming Deadlines */}
      {!error && (
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
            Tickets Near Deadline
          </Typography>
          {(summary?.upcomingTickets ?? []).length === 0 ? (
            <Typography>No upcoming deadlines.</Typography>
          ) : (
            <Grid container spacing={2} mb={3}>
              {(summary?.upcomingTickets ?? []).map((ticket) => (
                <Grid size={{ xs: 12, md: 4 }} key={ticket._id}>
                  <Card
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      const role = currentUser?.role;
                      const path = role ? rolePathMap[role] : undefined;
                      if (path) navigate(`${path}/${ticket._id}`);
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2">
                        Deadline: {new Date(ticket.deadline!).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Status: {ticket.status}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Overdue Tickets */}
      {!error && summary?.overdueTickets && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Overdue Tickets
          </Typography>
          {summary.overdueTickets.length === 0 ? (
            <Typography>No overdue tickets.</Typography>
          ) : (
            <Grid container spacing={2} mb={3}>
              {summary.overdueTickets.map((ticket) => (
                <Grid size={{ xs: 12, md: 4 }} key={ticket._id}>
                  <Card
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      const path = rolePathMap[currentUser?.role || ""];
                      if (path) navigate(`${path}/${ticket._id}`);
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2">
                        Deadline: {new Date(ticket.deadline!).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Status: {ticket.status}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DeveloperDashboard;
