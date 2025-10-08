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
  Construction as ProjectIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AttachMoney as MoneyIcon,
  Engineering as EngineerIcon,
  Assignment,
} from "@mui/icons-material";
import { Tabs, Tab } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const Tasks = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [requiresProgressUpdate, setRequiresProgressUpdate] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: "pending",
    progress_percent: 0,
    start_date: "",
    due_date: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    status: "pending",
    progress_percent: 0,
    start_date: "",
    due_date: "",
    project_id: "",
    assigned_to_admin: "",
  });
  const [progressForm, setProgressForm] = useState({
    description: "",
    progress_percent: 0,
    date: "",
    images: [],
  });
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
  });
  const [projects, setProjects] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Task status tabs configuration
  const statusTabs = [
    { label: "All Tasks", value: "all", count: tabCounts.all },
    { label: "Pending", value: "pending", count: tabCounts.pending },
    {
      label: "In Progress",
      value: "in_progress",
      count: tabCounts.in_progress,
    },
    { label: "Completed", value: "completed", count: tabCounts.completed },
  ];

  useEffect(() => {
    fetchTasks();
  }, [page, rowsPerPage, activeTab]);

  // Fetch all tasks for tab counts on component mount
  useEffect(() => {
    fetchAllTasksForCounts();
    fetchProjects();
    fetchAdmins();
  }, []);

  const fetchTasks = async () => {
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

      const currentStatus = statusTabs[activeTab]?.value;
      if (currentStatus && currentStatus !== "all") {
        queryParams.append("status", currentStatus);
      }

      const response = await fetch(`/api/tasks?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTasks(data.data || []);
        setTotalTasks(data.count || 0);

        // Don't update tab counts here - they should only be updated from fetchAllTasksForCounts
        // to avoid incorrect counts when switching tabs
      } else {
        setError("Failed to fetch tasks: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching tasks: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "info";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  const updateTabCounts = (tasksData) => {
    const counts = {
      all: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
    };

    tasksData.forEach((task) => {
      counts.all++; // Count all tasks
      if (counts.hasOwnProperty(task.status)) {
        counts[task.status]++;
      }
    });

    setTabCounts(counts);
  };

  const fetchAllTasksForCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/tasks?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        updateTabCounts(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching task counts:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/projects?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/admins`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Admins response:", data); // Debug log
      if (data.success) {
        setAdmins(data.data || []);
      } else {
        console.error("Failed to fetch admins:", data.message);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  const handleViewTask = (task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setEditForm({
      name: task.name,
      description: task.description || "",
      status: task.status,
      progress_percent: task.progress_percent || 0,
      start_date: task.start_date,
      due_date: task.due_date,
    });
    setProgressForm({
      description: "",
      progress_percent: task.progress_percent || 0,
      date: new Date().toISOString().split("T")[0],
      images: [],
    });
    setRequiresProgressUpdate(false);
    setOpenEditDialog(true);
  };

  const handleStatusChange = (newStatus) => {
    const currentStatus = selectedTask?.status;
    const currentProgress = selectedTask?.progress_percent || 0;

    // Always update the form status first
    setEditForm({ ...editForm, status: newStatus });

    // Check if progress update is required
    const statusChangingFromPending =
      currentStatus === "pending" && newStatus !== "pending";
    const statusChangingFromInProgress =
      currentStatus === "in_progress" && newStatus === "completed";
    const progressChangingFromZero =
      currentProgress === 0 && editForm.progress_percent > 0;

    if (
      statusChangingFromPending ||
      statusChangingFromInProgress ||
      progressChangingFromZero
    ) {
      setRequiresProgressUpdate(true);
      setOpenProgressDialog(true);
    }
  };

  const handleProgressUpdateSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      // Create FormData for progress update with images
      const formData = new FormData();
      formData.append("task_id", selectedTask.id);
      formData.append("description", progressForm.description);
      formData.append("progress_percent", progressForm.progress_percent);
      formData.append("date", progressForm.date);

      // Append images if any
      if (progressForm.images && progressForm.images.length > 0) {
        progressForm.images.forEach((file, index) => {
          if (file instanceof File) {
            formData.append("progress_images", file);
          }
        });
      }

      // Create progress update
      const response = await fetch(`/api/progress-updates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create progress update");
      }

      // Update the edit form with the new status and progress
      // Include the progress_update data so the task update knows it's already been created
      setEditForm({
        ...editForm,
        status: editForm.status,
        progress_percent: progressForm.progress_percent,
        progress_update: {
          description: progressForm.description,
          progress_percent: progressForm.progress_percent,
          date: progressForm.date,
          images: progressForm.images.map((file) =>
            file instanceof File
              ? `/uploads/progress-updates/${file.name}`
              : file
          ),
        },
        progress_update_already_created: true,
      });

      // Clean up object URLs
      progressForm.images.forEach((file) => {
        if (file instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });

      // Reset progress form
      setProgressForm({
        description: "",
        progress_percent: selectedTask?.progress_percent || 0,
        date: new Date().toISOString().split("T")[0],
        images: [],
      });

      setOpenProgressDialog(false);
      setRequiresProgressUpdate(false);

      // Now proceed with the task update
      const taskUpdateData = {
        ...editForm,
        status: editForm.status,
        progress_percent: progressForm.progress_percent,
        progress_update_already_created: true,
      };

      const updateResponse = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskUpdateData),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update task");
      }

      // Refresh tasks
      fetchTasks();
      fetchAllTasksForCounts();

      // Close edit dialog
      setOpenEditDialog(false);
      setSelectedTask(null);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Progress Updated!",
        text: "Progress update has been created and task updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error creating progress update:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create progress update. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdateCancel = () => {
    setOpenProgressDialog(false);
    setRequiresProgressUpdate(false);

    // Clean up object URLs to prevent memory leaks
    progressForm.images.forEach((file) => {
      if (file instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
    });

    // Reset progress form
    setProgressForm({
      description: "",
      progress_percent: selectedTask?.progress_percent || 0,
      date: new Date().toISOString().split("T")[0],
      images: [],
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create task");
      }

      // Close dialog and refresh tasks
      setOpenCreateDialog(false);
      setCreateForm({
        name: "",
        description: "",
        status: "pending",
        progress_percent: 0,
        start_date: "",
        due_date: "",
        project_id: "",
        assigned_to_admin: "",
      });
      fetchTasks();
      fetchAllTasksForCounts(); // Refresh tab counts

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Created!",
        text: "Task has been created successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error creating task:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create task. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update task");
      }

      // Close dialog and refresh tasks
      setOpenEditDialog(false);
      setSelectedTask(null);
      fetchTasks();
      fetchAllTasksForCounts(); // Refresh tab counts

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Task has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } catch (err) {
      console.error("Error updating task:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update task. Please try again.",
        customClass: {
          container: "swal-z-index-fix",
        },
        didOpen: () => {
          const swalContainer = document.querySelector(".swal-z-index-fix");
          if (swalContainer) {
            swalContainer.style.zIndex = "9999";
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${task.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        container: "swal-z-index-fix",
      },
      didOpen: () => {
        const swalContainer = document.querySelector(".swal-z-index-fix");
        if (swalContainer) {
          swalContainer.style.zIndex = "9999";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete task");
        }

        // Refresh tasks list
        fetchTasks();
        fetchAllTasksForCounts(); // Refresh tab counts

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Task has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } catch (err) {
        console.error("Error deleting task:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete task. Please try again.",
          customClass: {
            container: "swal-z-index-fix",
          },
          didOpen: () => {
            const swalContainer = document.querySelector(".swal-z-index-fix");
            if (swalContainer) {
              swalContainer.style.zIndex = "9999";
            }
          },
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (error) {
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
                Tasks Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Create and manage construction tasks
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
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
              Create New Task
            </Button>
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: "calc(100vh - 200px)" }}
        >
          {/* Status Tabs */}
          <Box mb={3}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#667eea",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minHeight: 48,
                  color: "#666",
                  "&.Mui-selected": {
                    color: "#667eea",
                  },
                  "&:hover": {
                    color: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.04)",
                  },
                },
              }}
            >
              {statusTabs.map((tab, index) => (
                <Tab
                  key={tab.value}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{tab.label}</span>
                      <Chip
                        label={tab.count}
                        size="small"
                        sx={{
                          backgroundColor:
                            activeTab === index ? "#667eea" : "#e0e0e0",
                          color: activeTab === index ? "white" : "#666",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 20,
                          minWidth: 20,
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Tasks Table */}
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
                  <TableCell>Task Name</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="error" variant="h6">
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No tasks found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task, idx) => (
                    <TableRow
                      key={task.id}
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
                          {task.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ProjectIcon
                            sx={{ color: "#9b59b6", fontSize: 18 }}
                          />
                          <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                            {task.project?.name || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PeopleIcon sx={{ color: "#e74c3c", fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                            {task.assignedAdmin?.name || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ProjectIcon
                            sx={{ color: "#9b59b6", fontSize: 18 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", fontWeight: 600 }}
                          >
                            {task.progress_percent || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Task Details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewTask(task)}
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
                          <Tooltip title="Edit Task" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditTask(task)}
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
                          <Tooltip title="Delete Task" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTask(task)}
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
            count={totalTasks}
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

        {/* Edit Task Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedTask(null);
            setRequiresProgressUpdate(false);
            setEditForm({
              name: "",
              description: "",
              status: "pending",
              progress_percent: 0,
              start_date: "",
              due_date: "",
            });
            setProgressForm({
              description: "",
              progress_percent: 0,
              date: "",
              images: [],
            });
          }}
          maxWidth="sm"
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
            <Assignment
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
                Edit Task
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Update task information
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Task Name */}
              <TextField
                fullWidth
                label="Task Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
                variant="outlined"
                size="small"
              />

              {/* Description */}
              <TextField
                fullWidth
                label="Description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                multiline
                rows={3}
                variant="outlined"
                size="small"
              />

              {/* Start Date and Due Date Row */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, start_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, due_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                />
              </Box>

              {/* Status and Progress Row */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Progress (%)"
                  type="number"
                  value={editForm.progress_percent}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      progress_percent: parseInt(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0, max: 100 }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setSelectedTask(null);
                setRequiresProgressUpdate(false);
                setEditForm({
                  name: "",
                  description: "",
                  status: "pending",
                  progress_percent: 0,
                  start_date: "",
                  due_date: "",
                });
                setProgressForm({
                  description: "",
                  progress_percent: 0,
                  date: "",
                  images: [],
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
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTask}
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(45deg, #5a6fd8, #6a4c93)",
                },
              }}
            >
              {loading ? "Updating..." : "Update Task"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Task Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={() => {
            setOpenCreateDialog(false);
            setCreateForm({
              name: "",
              description: "",
              status: "pending",
              progress_percent: 0,
              start_date: "",
              due_date: "",
              project_id: "",
              assigned_to_admin: "",
            });
          }}
          maxWidth="sm"
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
            <Assignment
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
                Create New Task
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Add a new task to the system
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Task Name */}
              <TextField
                fullWidth
                label="Task Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                required
                variant="outlined"
                size="small"
              />

              {/* Description */}
              <TextField
                fullWidth
                label="Description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                multiline
                rows={3}
                variant="outlined"
                size="small"
              />

              {/* Project and Assigned To Row */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={createForm.project_id}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        project_id: e.target.value,
                      })
                    }
                    label="Project"
                    required
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={createForm.assigned_to_admin}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        assigned_to_admin: e.target.value,
                      })
                    }
                    label="Assigned To"
                    required
                  >
                    {admins.length > 0 ? (
                      admins.map((admin) => (
                        <MenuItem key={admin.id} value={admin.id}>
                          {admin.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        {loading ? "Loading admins..." : "No admins available"}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>

              {/* Start Date and Due Date Row */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={createForm.start_date}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, start_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  required
                />
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={createForm.due_date}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, due_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  required
                />
              </Box>

              {/* Status and Progress Row */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, status: e.target.value })
                    }
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Progress (%)"
                  type="number"
                  value={createForm.progress_percent}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      progress_percent: parseInt(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0, max: 100 }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                setOpenCreateDialog(false);
                setCreateForm({
                  name: "",
                  description: "",
                  status: "pending",
                  progress_percent: 0,
                  start_date: "",
                  due_date: "",
                  project_id: "",
                  assigned_to_admin: "",
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
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(45deg, #5a6fd8, #6a4c93)",
                },
              }}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Progress Update Dialog */}
        <Dialog
          open={openProgressDialog}
          onClose={handleProgressUpdateCancel}
          maxWidth="sm"
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
            <Assignment
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
                Progress Update Required
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Please provide progress details for status change from{" "}
                {getStatusLabel(selectedTask?.status || "pending")} to{" "}
                {getStatusLabel(editForm.status)}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Progress Description */}
              <TextField
                fullWidth
                label="Progress Description"
                value={progressForm.description}
                onChange={(e) =>
                  setProgressForm({
                    ...progressForm,
                    description: e.target.value,
                  })
                }
                multiline
                rows={3}
                variant="outlined"
                size="small"
                required
                placeholder="Describe what work has been completed..."
              />

              {/* Progress Percentage and Date Row */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <TextField
                  fullWidth
                  label="Progress (%)"
                  type="number"
                  value={progressForm.progress_percent}
                  onChange={(e) =>
                    setProgressForm({
                      ...progressForm,
                      progress_percent: parseInt(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0, max: 100 }}
                  variant="outlined"
                  size="small"
                  required
                />
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={progressForm.date}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  required
                />
              </Box>

              {/* Image Upload Section */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Progress Images (Optional):
                </Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setProgressForm({
                      ...progressForm,
                      images: [...progressForm.images, ...files],
                    });
                  }}
                  style={{ display: "none" }}
                  id="progress-image-upload"
                />
                <label htmlFor="progress-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    size="small"
                    sx={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderColor: "#5a6fd8",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                      },
                    }}
                  >
                    Add Images
                  </Button>
                </label>

                {/* Selected Images Preview */}
                {progressForm.images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Selected Images ({progressForm.images.length}):
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                    >
                      {progressForm.images.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newImages = progressForm.images.filter(
                                (_, i) => i !== index
                              );
                              setProgressForm({
                                ...progressForm,
                                images: newImages,
                              });
                            }}
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              color: "error.main",
                              width: 20,
                              height: 20,
                              "&:hover": {
                                backgroundColor: "error.main",
                                color: "white",
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Status Display */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                  borderRadius: 2,
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Status Change:
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    label={getStatusLabel(selectedTask?.status || "pending")}
                    color="info"
                    size="small"
                  />
                  <Typography variant="body2">→</Typography>
                  <Chip
                    label={getStatusLabel(editForm.status)}
                    color="warning"
                    size="small"
                  />
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={handleProgressUpdateCancel}
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
              Cancel
            </Button>
            <Button
              onClick={handleProgressUpdateSubmit}
              variant="contained"
              disabled={
                !progressForm.description ||
                !progressForm.date ||
                progressForm.progress_percent < 0 ||
                progressForm.progress_percent > 100
              }
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(45deg, #5a6fd8, #6a4c93)",
                },
                "&:disabled": {
                  background: "rgba(102, 126, 234, 0.3)",
                  color: "rgba(255, 255, 255, 0.6)",
                },
              }}
            >
              Continue with Update
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Tasks;
