import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import type { FC, ReactNode } from "react";

interface ModalWrapperProps {
  open: boolean;
  handleClose: () => void;
  children: ReactNode;
}

interface CloseButtonProps {
  handleClose: () => void;
}

const CloseButton: FC<CloseButtonProps> = ({ handleClose }) => (
  <IconButton
    aria-label="close"
    sx={{ position: "absolute", right: 16, top: 8 }}
    onClick={handleClose}
  >
    <CloseIcon color="secondary" fontSize="large" />
  </IconButton>
);

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90%",
    sm: "80%",
    md: "55%",
    lg: "45%",
  },
  bgcolor: "background.paper",
  border: "2px solid #999",
  boxShadow: 24,
  p: 4,
  overflowY: "scroll",
  maxHeight: "100vh",
};

const ModalWrapper: FC<ModalWrapperProps> = ({
  open,
  handleClose,
  children,
}) => (
  <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <CloseButton handleClose={handleClose} />
      {children}
    </Box>
  </Modal>
);

export default ModalWrapper;
