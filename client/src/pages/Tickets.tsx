import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Chip, Link as MuiLink, Typography } from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type { MRT_ColumnFiltersState } from "material-react-table";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { fetchTickets } from "../services/ticket-service";
import type { Ticket } from "../types/ticket";

// Redux hooks/types
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  STATUS_ORDER,
  statusColorMap,
  type StatusName,
  rolePathMap,
} from "../utils/status-transition";
import { getFullDayRange } from "../utils/date";

const TicketList = () => {
  const navigate = useNavigate();
  // Table & ticket state
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Redux state for role & categories
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const { categories } = useSelector((state: RootState) => state.meta);

  // MRT table filter, pagination, and global search state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  // --- Date Range Filter State and Logic ---
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // "From" date picker handler
  const handleFromChange = (date: Date | null) => {
    setFrom(date);
    if (date && to && date > to) {
      setDateError('"From" date cannot be after "To" date');
      setTo(null); // Optionally reset "to" if invalid
    } else {
      setDateError(null);
    }
  };

  // "To" date picker handler
  const handleToChange = (date: Date | null) => {
    setTo(date);
    if (from && date && date < from) {
      setDateError('"To" date cannot be before "From" date');
    } else {
      setDateError(null);
    }
  };

  // --- Fetch Tickets Effect ---
  useEffect(() => {
    // Only fetch if no date validation error
    const loadTickets = async () => {
      setIsLoading(true);
      try {
        // Pass date range to backend as from/to (must be supported by backend)
        const [fromIso] = getFullDayRange(from);
        const [, toIso] = getFullDayRange(to);

        const res = await fetchTickets({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          search: globalFilter,
          filters: columnFilters,
          from: fromIso,
          to: toIso,
        });
        setTickets(res.tickets);
        setTotal(res.total);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load tickets.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    if (!dateError) loadTickets();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    columnFilters,
    from,
    to,
    dateError,
  ]);

  // --- Material React Table Column Definitions ---
  const columns: MRT_ColumnDef<Ticket>[] = [
    {
      accessorKey: "_id",
      header: "ID",
      Cell: ({ cell }) => {
        const id = cell.getValue<string>();
        const basePath = role ? rolePathMap[role] : undefined;
        if (!basePath) return <>{id.slice(-4)}</>;
        return (
          <MuiLink
            component={RouterLink}
            to={`${basePath}/${id}`}
            underline="none"
            color="primary"
            sx={{ ":hover": { textDecoration: "underline" } }}
          >
            {id.slice(-4)}
          </MuiLink>
        );
      },
      size: 60,
      enableColumnFilter: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      enableColumnFilter: false,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      Cell: ({ cell }) => <Chip label={String(cell.getValue())} />,
      filterVariant: "select",
      filterSelectOptions: ["low", "medium", "high", "urgent"],
    },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ cell }) => {
        const status = String(cell.getValue()) as StatusName;
        const color = statusColorMap[status];
        return <Chip label={status} color={color} />;
      },
      filterVariant: "select",
      filterSelectOptions: STATUS_ORDER,
    },
    {
      accessorKey: "category.name",
      header: "Category",
      filterVariant: "select",
      filterFn: "equals",
      filterSelectOptions: categories.map((cat) => ({
        value: cat._id,
        label: cat.name,
      })),
      Cell: ({ row }) => row.original.category?.name || "-",
    },
    {
      accessorKey: "created_by.name",
      header: "Created By",
      enableColumnFilter: false,
      Cell: ({ cell }) => String(cell.getValue() || "-"),
    },
    {
      accessorKey: "assigned_to.name",
      header: "Assigned To",
      enableColumnFilter: false,
      Cell: ({ cell }) => String(cell.getValue() || "-"),
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      enableColumnFilter: false,
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        return val ? new Date(val).toLocaleString() : "-";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      enableColumnFilter: false,
      Cell: ({ cell }) =>
        new Date(cell.getValue<string>()).toLocaleDateString(),
    },
  ];

  console.log(tickets);

  return (
    <Box sx={{ my: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="h6" gutterBottom mb={2}>
        Ticket List
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Show ticket list between the two dates.
      </Typography>
      {/* --- Date Range Filter --- */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box display="flex" gap={2} alignItems="flex-start" mb={2}>
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
            {/* Error message if invalid range */}
            {dateError && (
              <Typography color="error" variant="caption" sx={{ ml: 1, mt: 1 }}>
                {dateError}
              </Typography>
            )}
          </Box>
        </Box>
      </LocalizationProvider>

      {/* --- Tickets Table --- */}
      <Box>
        <MaterialReactTable
          columns={columns}
          data={tickets}
          rowCount={total}
          state={{
            isLoading,
            pagination,
            globalFilter,
            columnFilters,
          }}
          onPaginationChange={setPagination}
          onGlobalFilterChange={setGlobalFilter}
          onColumnFiltersChange={setColumnFilters}
          manualPagination
          manualFiltering
          enableGlobalFilter
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              const ticketId = row.original._id;
              const basePath = role ? rolePathMap[role] : undefined;
              if (basePath) navigate(`${basePath}/${ticketId}`);
            },
            sx: { cursor: "pointer" },
          })}
        />
      </Box>
    </Box>
  );
};

export default TicketList;
