import { useState } from "react";
import axios from "axios";
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

interface FileUploadProps {
  onUploadSuccess: (id: string) => void;
  onUploadError: (msg: string) => void;
  setUploading: (uploading: boolean) => void;
  uploading: boolean;
}

interface UploadedFileMeta {
  name: string;
  url: string;
}

// Component
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

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "/api/v1/attachments/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const percent = Math.round(
                (event.loaded * 100) / (event.total || 1)
              );
              setUploadProgress((prev) => ({ ...prev, [file.name]: percent }));
            },
          }
        );

        const id = response.data._id;
        const url = response.data.path; // Cloudinary secure URL
        const name = response.data.original_name;
        console.log(url);
        onUploadSuccess(id);
        setUploadedFiles((prev) => [...prev, { name, url }]);
      } catch (error) {
        const message =
          axios.isAxiosError(error) && error.response?.data?.error
            ? error.response.data.error
            : `Upload failed: ${file.name}`;
        onUploadError(message);
      }
    }

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
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Uploaded Files
          </Typography>
          <List dense>
            {uploadedFiles.map((file) => (
              <ListItem
                key={file.name}
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
