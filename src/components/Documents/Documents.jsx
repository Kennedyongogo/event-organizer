import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Folder,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const Documents = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filter, setFilter] = useState("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [documentForm, setDocumentForm] = useState({
    document_type: "company_document",
    category: "",
    description: "",
    file_name: "",
    file_type: "",
    file_url: "",
    uploaded_by_admin_id: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage, filter, documentTypeFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (filter !== "all") {
        queryParams.append("category", filter);
      }

      if (documentTypeFilter !== "all") {
        queryParams.append("document_type", documentTypeFilter);
      } else {
        // Only exclude project_document when showing "All Documents"
        // Project documents are stored in the Project model, not Document model
        queryParams.append("exclude_types", "project_document");
      }

      const response = await fetch(`/api/documents?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.data || []);
        setTotalDocuments(data.count || 0);
      } else {
        setError(
          "Failed to fetch documents: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching documents: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case "company_document":
        return "primary";
      case "project_document":
        return "secondary";
      case "template":
        return "success";
      case "policy":
        return "warning";
      case "contract":
        return "error";
      default:
        return "default";
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case ".pdf":
        return "📄";
      case ".doc":
      case ".docx":
        return "📝";
      case ".xls":
      case ".xlsx":
        return "📊";
      case ".jpg":
      case ".jpeg":
      case ".png":
        return "🖼️";
      default:
        return "📁";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setOpenViewDialog(true);
  };

  const handleDeleteDocument = async (document) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${document.file_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/documents/${document.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete document");
        }

        // Refresh documents list
        fetchDocuments();

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Document has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error deleting document:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete document. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadDocument = (document) => {
    const downloadUrl = `${window.location.origin}${document.file_url}`;
    window.open(downloadUrl, "_blank");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDocumentForm({
        ...documentForm,
        file_name: file.name,
        file_type: file.name.split(".").pop().toLowerCase(),
      });
    }
  };

  const handleCreateDocument = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      if (!selectedFile) {
        Swal.fire({
          icon: "error",
          title: "No File Selected",
          text: "Please select a file to upload.",
        });
        return;
      }

      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        setError("User information not found. Please login again.");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("general_documents", selectedFile);
      formData.append("document_type", documentForm.document_type);
      formData.append("category", documentForm.category);
      formData.append("description", documentForm.description);
      formData.append("uploaded_by_admin_id", user.id);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create document");
      }

      // Reset form and close dialog
      setDocumentForm({
        document_type: "company_document",
        category: "",
        description: "",
        file_name: "",
        file_type: "",
        file_url: "",
        uploaded_by_admin_id: "",
      });
      setSelectedFile(null);
      setOpenCreateDialog(false);
      setSelectedDocument(null);

      // Refresh documents list
      fetchDocuments();

      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Document uploaded successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error creating document:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Failed to create document. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (error && documents.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "none",
          boxShadow: "none",
          minHeight: "100vh",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={{ xs: 2, sm: 0 }}
            position="relative"
            zIndex={1}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                Document Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage company documents and files
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedDocument(null);
                setDocumentForm({
                  document_type: "company_document",
                  category: "",
                  description: "",
                  file_name: "",
                  file_type: "",
                  file_url: "",
                  uploaded_by_admin_id: "",
                });
                setOpenCreateDialog(true);
              }}
              sx={{
                background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                borderRadius: 3,
                px: { xs: 2, sm: 4 },
                py: 1.5,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  background: "linear-gradient(45deg, #FF5252, #26A69A)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 35px rgba(255, 107, 107, 0.4)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Add New Document
            </Button>
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: "calc(100vh - 200px)" }}
        >
          {/* Document Type Filter Tabs */}
          <Box mb={3}>
            <Tabs
              value={documentTypeFilter}
              onChange={(e, newValue) => setDocumentTypeFilter(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: 2,
                border: "1px solid rgba(102, 126, 234, 0.1)",
                "& .MuiTabs-indicator": {
                  backgroundColor: "#667eea",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  textTransform: "capitalize",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  minHeight: 48,
                  color: "#666",
                  "&.Mui-selected": {
                    color: "#667eea",
                    fontWeight: 700,
                  },
                  "&:hover": {
                    color: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.05)",
                  },
                },
              }}
            >
              <Tab label="All Documents" value="all" />
              <Tab label="Company Documents" value="company_document" />
              <Tab label="Templates" value="template" />
              <Tab label="Policies" value="policy" />
              <Tab label="Contracts" value="contract" />
            </Tabs>
          </Box>

          {/* Documents Table */}
          <TableContainer
            sx={{
              borderRadius: 3,
              overflowX: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(102, 126, 234, 0.1)",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(102, 126, 234, 0.3)",
                borderRadius: 4,
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.5)",
                },
              },
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "& .MuiTableCell-head": {
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "0.8rem", sm: "0.95rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      border: "none",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>No</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                      <Button
                        variant="contained"
                        onClick={fetchDocuments}
                        sx={{
                          background:
                            "linear-gradient(45deg, #667eea, #764ba2)",
                        }}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No documents found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((document, idx) => (
                    <TableRow
                      key={document.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "rgba(102, 126, 234, 0.02)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.08)",
                          transform: { xs: "none", sm: "scale(1.01)" },
                        },
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          padding: { xs: "8px 4px", sm: "16px" },
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#667eea" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography sx={{ fontSize: "1.2rem" }}>
                            {getFileTypeIcon(document.file_type)}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            sx={{ color: "#2c3e50" }}
                          >
                            {document.file_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={document.document_type.replace("_", " ")}
                          color={getDocumentTypeColor(document.document_type)}
                          size="small"
                          variant="outlined"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: "#7f8c8d", fontWeight: 600 }}
                        >
                          {formatDate(document.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Download Document" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadDocument(document)}
                              sx={{
                                color: "#27ae60",
                                backgroundColor: "rgba(39, 174, 96, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(39, 174, 96, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <UploadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Document Details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDocument(document)}
                              sx={{
                                color: "#3498db",
                                backgroundColor: "rgba(52, 152, 219, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(52, 152, 219, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Document" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteDocument(document)}
                              sx={{
                                color: "#e74c3c",
                                backgroundColor: "rgba(231, 76, 60, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(231, 76, 60, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalDocuments}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderTop: "1px solid rgba(102, 126, 234, 0.1)",
              "& .MuiTablePagination-toolbar": {
                color: "#667eea",
                fontWeight: 600,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#2c3e50",
                  fontWeight: 600,
                },
            }}
          />
        </Box>

        {/* Document Dialog */}
        <Dialog
          open={openViewDialog || openCreateDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setOpenCreateDialog(false);
            setSelectedDocument(null);
            setDocumentForm({
              document_type: "company_document",
              category: "",
              description: "",
              file_name: "",
              file_type: "",
              file_url: "",
              uploaded_by_admin_id: "",
            });
          }}
          maxWidth="xs"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              maxHeight: "85vh",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              overflow: "hidden",
            },
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -15,
                left: -15,
                width: 80,
                height: 80,
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <Folder sx={{ position: "relative", zIndex: 1, fontSize: 28 }} />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {openViewDialog ? "Document Details" : "Add New Document"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {openViewDialog
                  ? "View document information"
                  : "Add a new document to the system"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            {openViewDialog ? (
              // View Document Details - Simple UI
              <Box>
                <Typography
                  variant="h5"
                  sx={{ mb: 3, fontWeight: 600, color: "#667eea" }}
                >
                  Document Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      File Name
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: "1.5rem" }}>
                        {getFileTypeIcon(selectedDocument.file_type)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedDocument.file_name}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Document Type
                    </Typography>
                    <Chip
                      label={selectedDocument.document_type.replace("_", " ")}
                      color={getDocumentTypeColor(
                        selectedDocument.document_type
                      )}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Category
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedDocument.category || "Uncategorized"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      File Type
                    </Typography>
                    <Chip
                      label={selectedDocument.file_type}
                      color="default"
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Uploaded By
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedDocument.uploadedBy?.name || "Unknown"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Upload Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(selectedDocument.createdAt)}
                    </Typography>
                  </Grid>

                  {selectedDocument.description && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedDocument.description}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => handleDownloadDocument(selectedDocument)}
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        mt: 2,
                      }}
                    >
                      Download Document
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              // Create/Edit Worker Form
              <Box
                component="form"
                noValidate
                sx={{ maxHeight: "45vh", overflowY: "auto" }}
              >
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {/* Task Selection */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    size="small"
                    required
                  >
                    <InputLabel>Select Task</InputLabel>
                    <Select
                      value={documentForm.document_type}
                      onChange={(e) =>
                        setDocumentForm({
                          ...documentForm,
                          document_type: e.target.value,
                        })
                      }
                      label="Document Type"
                    >
                      <MenuItem value="company_document">
                        Company Document
                      </MenuItem>
                      <MenuItem value="template">Template</MenuItem>
                      <MenuItem value="policy">Policy</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Category */}
                  <TextField
                    fullWidth
                    label="Category"
                    value={documentForm.category}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        category: e.target.value,
                      })
                    }
                    variant="outlined"
                    size="small"
                    placeholder="e.g., HR, Finance, Legal"
                  />

                  {/* Description */}
                  <TextField
                    fullWidth
                    label="Description"
                    value={documentForm.description}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        description: e.target.value,
                      })
                    }
                    variant="outlined"
                    size="small"
                    multiline
                    rows={3}
                    placeholder="Document description or notes"
                  />

                  {/* File Upload Section */}
                  <Box
                    sx={{
                      border: "2px dashed #667eea",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                    }}
                  >
                    <UploadIcon
                      sx={{ fontSize: 48, color: "#667eea", mb: 1 }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, color: "#667eea" }}>
                      Upload Document
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Drag and drop files here, or click to select files
                    </Typography>
                    {selectedFile && (
                      <Box
                        sx={{
                          mb: 2,
                          p: 1,
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#667eea" }}
                        >
                          Selected: {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </Typography>
                      </Box>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      id="file-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="contained"
                        component="span"
                        sx={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {selectedFile ? "Change File" : "Choose File"}
                      </Button>
                    </label>
                  </Box>
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setOpenCreateDialog(false);
                setSelectedDocument(null);
                setDocumentForm({
                  document_type: "company_document",
                  category: "",
                  description: "",
                  file_name: "",
                  file_type: "",
                  file_url: "",
                  uploaded_by_admin_id: "",
                });
              }}
              variant="outlined"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  borderColor: "#5a6fd8",
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                },
              }}
            >
              {openViewDialog ? "Close" : "Cancel"}
            </Button>
            {openCreateDialog && (
              <Button
                onClick={handleCreateDocument}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                  },
                  "&:disabled": {
                    background: "rgba(102, 126, 234, 0.3)",
                    color: "rgba(255, 255, 255, 0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
                disabled={
                  !documentForm.document_type ||
                  !documentForm.category ||
                  !documentForm.description ||
                  !selectedFile
                }
              >
                Add Document
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Documents;
