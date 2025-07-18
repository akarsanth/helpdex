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
import {
  fetchTicketSummary,
  fetchAvgResolutionTime,
} from "../../services/ticket-service";
import {
  STATUS_ORDER,
  statusBorderColorMap,
  rolePathMap,
} from "../../utils/status-transition";
import { useNavigate } from "react-router-dom";
import { type TicketSummaryResponse } from "../../services/ticket-service";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getFullDayRange } from "../../utils/date";

const QADashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [summary, setSummary] = useState<TicketSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AVG RESOLUTION TIME STATE
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [avg, setAvg] = useState<{
    avgResolutionTimeStr: string;
    count: number;
  } | null>(null);
  const [loadingAvg, setLoadingAvg] = useState(false);

  const [dateError, setDateError] = useState<string | null>(null);
  const handleFromChange = (date: Date | null) => {
    setFrom(date);
    if (date && to && date > to) {
      setDateError('"From" date cannot be after "To" date');
      setTo(null);
    } else {
      setDateError(null);
    }
  };

  const handleToChange = (date: Date | null) => {
    setTo(date);
    if (from && date && date < from) {
      setDateError('"To" date cannot be before "From" date');
    } else {
      setDateError(null);
    }
  };

  // Ticket summary
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

  // Avg resolution time (only if both from and to or none)
  useEffect(() => {
    if (dateError) return;

    const fetch = async () => {
      setLoadingAvg(true);
      try {
        let res;
        if (from && to) {
          // Use the whole range from start of FROM to end of TO (local time)
          const [fromIso] = getFullDayRange(from);
          const [, toIso] = getFullDayRange(to);
          res = await fetchAvgResolutionTime(fromIso, toIso);
        } else if (!from && !to) {
          res = await fetchAvgResolutionTime();
        } else {
          setAvg(null);
          return;
        }
        setAvg(res);
      } finally {
        setLoadingAvg(false);
      }
    };
    fetch();
  }, [from, to, dateError]);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 3, mb: 8 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
        Welcome, {currentUser?.name}!
      </Typography>

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

      {/* --- Average Ticket Resolution Time with Date Filter --- */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box mb={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Show average resolution time for tickets <b>resolved</b> between
            these dates:
          </Typography>
        </Box>
        <Box>
          <Box display="flex" gap={2}>
            <DatePicker
              label="From"
              value={from}
              onChange={handleFromChange}
              maxDate={to ?? undefined}
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="To"
              value={to}
              onChange={handleToChange}
              minDate={from ?? undefined}
              slotProps={{ textField: { size: "small" } }}
            />
          </Box>

          {dateError && (
            <Typography color="error" variant="caption" sx={{ ml: 1, mt: 1 }}>
              {dateError}
            </Typography>
          )}

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mt={1}>
              Avg. Resolution Time:
            </Typography>
            <Typography>
              {loadingAvg
                ? "Loading..."
                : avg
                ? `${avg.avgResolutionTimeStr} ${
                    avg.count > 0 ? `(${avg.count} tickets)` : ""
                  }`
                : "-"}
            </Typography>
          </Box>
        </Box>
      </LocalizationProvider>

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
      {!error && (
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
            Overdue Tickets
          </Typography>
          {(summary?.overdueTickets ?? []).length === 0 ? (
            <Typography>No overdue tickets.</Typography>
          ) : (
            <Grid container spacing={2} mb={3}>
              {(summary?.overdueTickets ?? []).map((ticket) => (
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
    </Box>
  );
};

export default QADashboard;
