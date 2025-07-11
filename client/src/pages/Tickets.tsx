import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Chip, Link as MuiLink, Typography } from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type { MRT_ColumnFiltersState } from "material-react-table";

import { fetchTickets } from "../services/ticket-service";
import type { Ticket } from "../types/ticket";

// Redux
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { STATUS_ORDER } from "../utils/status-transition";

const rolePathMap: Record<string, string | undefined> = {
  client: "/dashboard/my-tickets",
  developer: "/dashboard/assigned",
  qa: "/dashboard/all-tickets",
};

const TicketList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const { categories } = useSelector((state: RootState) => state.meta);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      try {
        const res = await fetchTickets({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          search: globalFilter,
          filters: columnFilters,
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

    loadTickets();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

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
      Cell: ({ cell }) => <Chip label={String(cell.getValue())} />,
      filterVariant: "select",
      filterSelectOptions: STATUS_ORDER,
    },
    {
      accessorKey: "category_id",
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
        return val ? new Date(val).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      enableColumnFilter: false,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
  ];

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="h6" fontWeight="bold" sx={{ my: 3 }}>
        Ticket List
      </Typography>

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
    </>
  );
};

export default TicketList;
