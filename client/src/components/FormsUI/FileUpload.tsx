import { useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  List,
  ListItem,
  Link,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import axiosInstance from "../../utils/axios";
import type { AxiosError } from "axios";

interface FileUploadProps {
  onUploadSuccess: (id: string) => void;
  onUploadError: (msg: string) => void;
  setUploading: (uploading: boolean) => void;
  uploading: boolean;
}

interface UploadedFileMeta {
  _id: string;
  name: string;
  url: string;
}

const FileUpload = ({
  onUploadSuccess,
  onUploadError,
  setUploading,
  uploading,
}: FileUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMeta[]>([]);

  const handleFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const uploadTasks = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        try {
          const { data } = await axiosInstance.post(
            "/api/v1/attachments/upload",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (event) => {
                const percent = Math.round(
                  (event.loaded * 100) / (event.total || 1)
                );
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: percent,
                }));
              },
            }
          );
          const { _id, path, original_name } = data.attachment;
          onUploadSuccess(_id);
          setUploadedFiles((prev) => [
            ...prev,
            { _id, name: original_name, url: path },
          ]);
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          const message =
            axiosError.response?.data?.message ||
            axiosError.message ||
            `Upload failed: ${file.name}`;
          onUploadError(message);
        }
      } finally {
        setUploadProgress((prev) => {
          const { [file.name]: _, ...rest } = prev;
          return rest;
        });
      }
    });

    await Promise.allSettled(uploadTasks);
    setUploading(false);
  };

  return (
    <Box sx={{ my: 2 }}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
        disabled={uploading}
      >
        Upload Files
        <input type="file" hidden multiple onChange={handleFilesChange} />
      </Button>

      {Object.keys(uploadProgress).length > 0 && (
        <List dense sx={{ mt: 2 }}>
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <ListItem key={name} sx={{ px: 0 }}>
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2">{name}</Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 700 }}>
            Uploaded Files
          </Typography>
          <List dense>
            {uploadedFiles.map((file) => (
              <ListItem
                key={file._id}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <InsertDriveFileIcon fontSize="small" sx={{ mr: 1 }} />
                <Link
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  underline="none"
                  sx={{ color: "primary.main" }}
                >
                  {file.name}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
