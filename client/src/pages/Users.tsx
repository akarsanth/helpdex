import { useCallback, useEffect, useState } from "react";
import { Alert, Box, IconButton, Typography, Chip } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import UserEditModal from "../components/Users/UserEditModal";

import { fetchUsers } from "../services/user-service";
import type { User } from "../types";

const roleOptions = ["client", "developer", "qa", "admin"];
const roleColorMap: Record<
  User["role"],
  "default" | "primary" | "info" | "secondary"
> = {
  client: "default",
  developer: "primary",
  qa: "info",
  admin: "secondary",
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        filters: columnFilters,
      });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch users.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, columnFilters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const columns: MRT_ColumnDef<User>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "companyName", header: "Company" },
    {
      accessorKey: "role",
      header: "Role",
      filterVariant: "select",
      filterSelectOptions: roleOptions,
      Cell: ({ cell }) => {
        const role = cell.getValue<User["role"]>();
        return <Chip label={role} color={roleColorMap[role]} size="small" />;
      },
    },

    {
      accessorKey: "isEmailVerified",
      header: "Email Verified",
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Verified", value: "true" },
        { label: "Not Verified", value: "false" },
      ],
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <CheckIcon color="primary" fontSize="small" />
        ) : (
          <CloseIcon sx={{ color: "error.main" }} fontSize="small" />
        ),
    },
    {
      accessorKey: "isApprovedByAdmin",
      header: "Admin Approved",
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Approved", value: "true" },
        { label: "Not Approved", value: "false" },
      ],
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <CheckIcon color="primary" fontSize="small" />
        ) : (
          <CloseIcon sx={{ color: "error.main" }} fontSize="small" />
        ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() => {
              setEditRow(row.original);
              setModalOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="h6" fontWeight="bold" sx={{ my: 3 }}>
        User Management
      </Typography>

      <MaterialReactTable
        columns={columns}
        data={users}
        rowCount={total}
        state={{
          isLoading: loading,
          pagination,
          columnFilters,
        }}
        onPaginationChange={setPagination}
        onColumnFiltersChange={setColumnFilters}
        manualPagination
        manualFiltering
        enableGlobalFilter={false}
        enableColumnFilters
        enableSorting
        enableColumnActions
        enableColumnOrdering
        enableTableHead
      />

      {modalOpen && editRow && (
        <UserEditModal
          open={modalOpen}
          user={editRow}
          onClose={() => setModalOpen(false)}
          onSuccess={loadUsers}
        />
      )}
    </>
  );
};

export default Users;
