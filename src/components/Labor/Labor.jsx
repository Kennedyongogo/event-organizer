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
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const Labor = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [labor, setLabor] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState(null);
  const [filter, setFilter] = useState("all");
  const [workerTypeFilter, setWorkerTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLabor, setTotalLabor] = useState(0);
  const [laborForm, setLaborForm] = useState({
    task_id: "",
    worker_name: "",
    worker_type: "unskilled_worker",
    hourly_rate: "",
    hours_worked: "",
    start_date: "",
    end_date: "",
    status: "active",
    phone: "",
    skills: "",
    required_quantity: 1,
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchLabor();
    fetchTasks();
  }, [page, rowsPerPage, filter, workerTypeFilter]);

  const fetchLabor = async () => {
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
        queryParams.append("status", filter);
      }

      if (workerTypeFilter !== "all") {
        queryParams.append("worker_type", workerTypeFilter);
      }

      const response = await fetch(`/api/labor?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLabor(data.data || []);
        setTotalLabor(data.count || 0);
      } else {
        setError("Failed to fetch labor: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching labor: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTasks(data.data || []);
      } else {
        console.error("Failed to fetch tasks:", data.message);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "default";
      case "on_leave":
        return "warning";
      default:
        return "default";
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

  const handleViewWorker = (worker) => {
    setSelectedLabor(worker);
    setOpenViewDialog(true);
  };

  const handleEditWorker = (worker) => {
    setSelectedLabor(worker);
    setLaborForm({
      task_id: worker.task_id || "",
      worker_name: worker.worker_name || "",
      worker_type: worker.worker_type || "unskilled_worker",
      hourly_rate: worker.hourly_rate || "",
      hours_worked: worker.hours_worked || "",
      start_date: worker.start_date ? worker.start_date.split("T")[0] : "",
      end_date: worker.end_date ? worker.end_date.split("T")[0] : "",
      status: worker.status || "active",
      phone: worker.phone || "",
      skills: Array.isArray(worker.skills)
        ? worker.skills.join(", ")
        : worker.skills || "",
      required_quantity: worker.required_quantity || 1,
    });
    setOpenEditDialog(true);
  };

  const handleDeleteWorker = async (worker) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${worker.worker_name}"?`,
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

        const response = await fetch(`/api/labor/${worker.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete worker");
        }

        // Refresh labor list
        fetchLabor();

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Worker has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error deleting worker:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete worker. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateWorker = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      // Process skills - convert comma-separated string to array
      const skillsArray = laborForm.skills
        ? laborForm.skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const laborData = {
        task_id: laborForm.task_id,
        worker_name: laborForm.worker_name,
        worker_type: laborForm.worker_type,
        hourly_rate: laborForm.hourly_rate,
        hours_worked: laborForm.hours_worked,
        start_date: laborForm.start_date,
        end_date: laborForm.end_date,
        status: laborForm.status,
        phone: laborForm.phone,
        skills: skillsArray,
        required_quantity: laborForm.required_quantity,
      };

      const response = await fetch(`/api/labor/${selectedLabor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(laborData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update worker");
      }

      // Reset form and close dialog
      setLaborForm({
        task_id: "",
        worker_name: "",
        worker_type: "unskilled_worker",
        hourly_rate: "",
        hours_worked: "",
        start_date: "",
        end_date: "",
        status: "active",
        phone: "",
        skills: "",
        required_quantity: 1,
      });
      setOpenEditDialog(false);
      setSelectedLabor(null);

      // Refresh labor list
      fetchLabor();

      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Worker has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error updating worker:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update worker. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      // Process skills - convert comma-separated string to array
      const skillsArray = laborForm.skills
        ? laborForm.skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const laborData = {
        task_id: laborForm.task_id,
        worker_name: laborForm.worker_name,
        worker_type: laborForm.worker_type,
        hourly_rate: laborForm.hourly_rate,
        hours_worked: laborForm.hours_worked,
        start_date: laborForm.start_date,
        end_date: laborForm.end_date,
        status: laborForm.status,
        phone: laborForm.phone,
        skills: skillsArray,
        required_quantity: laborForm.required_quantity,
      };

      const response = await fetch("/api/labor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(laborData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create worker");
      }

      // Reset form and close dialog
      setLaborForm({
        task_id: "",
        worker_name: "",
        worker_type: "unskilled_worker",
        hourly_rate: "",
        hours_worked: "",
        start_date: "",
        end_date: "",
        status: "active",
        phone: "",
        skills: "",
        required_quantity: 1,
      });
      setOpenCreateDialog(false);
      setSelectedLabor(null);

      // Refresh labor list
      fetchLabor();

      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Worker added successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error creating worker:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Failed to create worker. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (error && labor.length === 0) {
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
                Labor Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage construction workers and staff
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedLabor(null);
                setLaborForm({
                  worker_name: "",
                  worker_type: "unskilled_worker",
                  hourly_rate: "",
                  hours_worked: "",
                  start_date: "",
                  end_date: "",
                  status: "active",
                  phone: "",
                  skills: "",
                  required_quantity: 1,
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
              Add New Worker
            </Button>
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: "calc(100vh - 200px)" }}
        >
          {/* Worker Type Filter Tabs */}
          <Box mb={3}>
            <Tabs
              value={workerTypeFilter}
              onChange={(e, newValue) => setWorkerTypeFilter(newValue)}
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
              <Tab label="All Workers" value="all" />
              <Tab label="Foreman" value="foreman" />
              <Tab label="Skilled Worker" value="skilled_worker" />
              <Tab label="Unskilled Worker" value="unskilled_worker" />
              <Tab label="Engineer" value="engineer" />
              <Tab label="Supervisor" value="supervisor" />
            </Tabs>
          </Box>

          {/* Labor Table */}
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
                  <TableCell>Worker Name</TableCell>
                  <TableCell>Worker Type</TableCell>
                  <TableCell>Hourly Rate</TableCell>
                  <TableCell>Hours Worked</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                      <Button
                        variant="contained"
                        onClick={fetchLabor}
                        sx={{
                          background:
                            "linear-gradient(45deg, #667eea, #764ba2)",
                        }}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : labor.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No workers found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  labor.map((worker, idx) => (
                    <TableRow
                      key={worker.id}
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
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{ color: "#2c3e50" }}
                        >
                          {worker.worker_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={worker.worker_type}
                          color="primary"
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
                          ${worker.hourly_rate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: "#7f8c8d", fontWeight: 600 }}
                        >
                          {worker.hours_worked}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: "#27ae60", fontWeight: 600 }}
                        >
                          ${worker.total_cost}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={worker.status}
                          color={getStatusColor(worker.status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Worker Details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewWorker(worker)}
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
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Worker" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditWorker(worker)}
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
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Worker" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteWorker(worker)}
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
            count={totalLabor}
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

        {/* Worker Dialog */}
        <Dialog
          open={openViewDialog || openEditDialog || openCreateDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setOpenEditDialog(false);
            setOpenCreateDialog(false);
            setSelectedLabor(null);
            setLaborForm({
              worker_name: "",
              worker_type: "unskilled_worker",
              hourly_rate: "",
              hours_worked: "",
              start_date: "",
              end_date: "",
              status: "active",
              phone: "",
              skills: "",
              required_quantity: 1,
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
            <PeopleIcon
              sx={{ position: "relative", zIndex: 1, fontSize: 28 }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {openViewDialog
                  ? "Worker Details"
                  : openEditDialog
                  ? "Edit Worker"
                  : "Add New Worker"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {openViewDialog
                  ? "View worker information"
                  : openEditDialog
                  ? "Update worker details"
                  : "Add a new worker to the project"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            {openViewDialog ? (
              // View Worker Details - Simple UI
              <Box>
                <Typography
                  variant="h5"
                  sx={{ mb: 3, fontWeight: 600, color: "#667eea" }}
                >
                  Worker Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Worker Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedLabor.worker_name}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Assigned Task
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedLabor.task?.name || "Unknown Task"}
                    </Typography>
                    {selectedLabor.task?.project && (
                      <Typography variant="caption" color="text.secondary">
                        Project: {selectedLabor.task.project.name}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Worker Type
                    </Typography>
                    <Chip
                      label={selectedLabor.worker_type.replace("_", " ")}
                      color="primary"
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
                      Hourly Rate
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      ${selectedLabor.hourly_rate}/hour
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Hours Worked
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedLabor.hours_worked} hours
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Total Cost
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, color: "#27ae60" }}
                    >
                      ${selectedLabor.total_cost}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Status
                    </Typography>
                    <Chip
                      label={selectedLabor.status}
                      color={getStatusColor(selectedLabor.status)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Grid>

                  {selectedLabor.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedLabor.phone}
                      </Typography>
                    </Grid>
                  )}

                  {selectedLabor.required_quantity && (
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Required Quantity
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedLabor.required_quantity}
                      </Typography>
                    </Grid>
                  )}

                  {selectedLabor.skills && selectedLabor.skills.length > 0 && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Skills
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {Array.isArray(selectedLabor.skills) ? (
                          selectedLabor.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2">
                            {selectedLabor.skills}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}
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
                      value={laborForm.task_id}
                      onChange={(e) =>
                        setLaborForm({
                          ...laborForm,
                          task_id: e.target.value,
                        })
                      }
                      label="Select Task"
                    >
                      {tasks.map((task) => (
                        <MenuItem key={task.id} value={task.id}>
                          {task.name} -{" "}
                          {task.project?.name || "Unknown Project"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Worker Name */}
                  <TextField
                    fullWidth
                    label="Worker Name"
                    value={laborForm.worker_name}
                    onChange={(e) =>
                      setLaborForm({
                        ...laborForm,
                        worker_name: e.target.value,
                      })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />

                  {/* Worker Type */}
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Worker Type</InputLabel>
                    <Select
                      value={laborForm.worker_type}
                      onChange={(e) =>
                        setLaborForm({
                          ...laborForm,
                          worker_type: e.target.value,
                        })
                      }
                      label="Worker Type"
                    >
                      <MenuItem value="foreman">Foreman</MenuItem>
                      <MenuItem value="skilled_worker">Skilled Worker</MenuItem>
                      <MenuItem value="unskilled_worker">
                        Unskilled Worker
                      </MenuItem>
                      <MenuItem value="engineer">Engineer</MenuItem>
                      <MenuItem value="supervisor">Supervisor</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Hourly Rate and Hours Worked Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Hourly Rate"
                      type="number"
                      value={laborForm.hourly_rate}
                      onChange={(e) =>
                        setLaborForm({
                          ...laborForm,
                          hourly_rate: e.target.value,
                        })
                      }
                      required
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Hours Worked"
                      type="number"
                      value={laborForm.hours_worked}
                      onChange={(e) =>
                        setLaborForm({
                          ...laborForm,
                          hours_worked: e.target.value,
                        })
                      }
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Start Date and End Date Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={laborForm.start_date}
                      onChange={(e) =>
                        setLaborForm({
                          ...laborForm,
                          start_date: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={laborForm.end_date}
                      onChange={(e) =>
                        setLaborForm({ ...laborForm, end_date: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Phone and Status Row */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1.5}
                  >
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={laborForm.phone}
                      onChange={(e) =>
                        setLaborForm({
                          ...laborForm,
                          phone: e.target.value,
                        })
                      }
                      variant="outlined"
                      size="small"
                    />
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={laborForm.status}
                        onChange={(e) =>
                          setLaborForm({ ...laborForm, status: e.target.value })
                        }
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="on_leave">On Leave</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Required Quantity */}
                  <TextField
                    fullWidth
                    label="Required Quantity"
                    type="number"
                    value={laborForm.required_quantity}
                    onChange={(e) =>
                      setLaborForm({
                        ...laborForm,
                        required_quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 1 }}
                  />

                  {/* Skills */}
                  <TextField
                    fullWidth
                    label="Skills (comma-separated)"
                    value={laborForm.skills}
                    onChange={(e) =>
                      setLaborForm({
                        ...laborForm,
                        skills: e.target.value,
                      })
                    }
                    variant="outlined"
                    size="small"
                    placeholder="e.g., welding, carpentry, safety"
                    multiline
                    rows={3}
                    sx={{
                      "& .MuiInputBase-root": {
                        alignItems: "flex-start",
                      },
                    }}
                  />
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
                setOpenEditDialog(false);
                setOpenCreateDialog(false);
                setSelectedLabor(null);
                setLaborForm({
                  worker_name: "",
                  worker_type: "unskilled_worker",
                  hourly_rate: "",
                  hours_worked: "",
                  start_date: "",
                  end_date: "",
                  status: "active",
                  phone: "",
                  skills: "",
                  required_quantity: 1,
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
            {(openEditDialog || openCreateDialog) && (
              <Button
                onClick={
                  openEditDialog ? handleUpdateWorker : handleCreateWorker
                }
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
                  !laborForm.task_id ||
                  !laborForm.worker_name ||
                  !laborForm.hourly_rate ||
                  !laborForm.hours_worked ||
                  !laborForm.required_quantity
                }
              >
                {openEditDialog ? "Update Worker" : "Add Worker"}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Labor;
