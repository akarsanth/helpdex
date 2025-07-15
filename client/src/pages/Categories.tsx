import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CategoryAddEditModal from "../components/Categories/CategoryAddEditModal";
import { type AppDispatch, type RootState } from "../redux/store";
import { fetchMeta } from "../redux/store/global/global-slice";
import { deleteCategory } from "../services/category-service";
import type { Category } from "../types/category";
import { setMessage } from "../redux/store/message/message-slice";

const Categories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, error } = useSelector((state: RootState) => state.meta);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<Category | null>(null);
  const [actionType, setActionType] = useState<"Add" | "Edit">("Add");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [deleteError, setDeleteError] = useState("");

  const columns: MRT_ColumnDef<Category>[] = [
    {
      accessorKey: "_id",
      header: "ID",
      Cell: ({ cell }) => cell.getValue<string>().slice(-4),
      size: 60,
    },
    {
      accessorKey: "name",
      header: "Category Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        return val?.length > 60 ? `${val.slice(0, 60)}...` : val || "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      size: 60,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() => {
              setEditRow(row.original);
              setActionType("Edit");
              setModalOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setDeletingCategory(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleDeleteConfirmed = async () => {
    if (deletingCategory) {
      try {
        await deleteCategory(deletingCategory._id);
        dispatch(
          setMessage({
            type: "success",
            message: `Category #${deletingCategory._id} deleted.`,
          })
        );
        dispatch(fetchMeta());
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Category delete failed.";
        setDeleteError(msg);
      }
    }
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {deleteError && <Alert severity="error">{deleteError}</Alert>}

      <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditRow(null);
            setActionType("Add");
            setModalOpen(true);
          }}
        >
          Add Category
        </Button>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={categories}
        enableSorting
        enableGlobalFilter
        enableColumnFilters={false}
        enablePagination
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete this category?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>No</Button>
          <Button onClick={handleDeleteConfirmed} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {modalOpen && (
        <CategoryAddEditModal
          open={modalOpen}
          initialValues={editRow}
          actionType={actionType}
          onClose={() => setModalOpen(false)}
          onSuccess={() => dispatch(fetchMeta())}
        />
      )}
    </>
  );
};

export default Categories;
