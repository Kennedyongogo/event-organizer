import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Assignment as TaskIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Engineering as EngineerIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Construction as ProjectIcon,
  Build as MaterialIcon,
  Construction as EquipmentIcon,
  Work as LaborIcon,
  TrendingUp as ProgressIcon,
  Warning as IssueIcon,
  Notes as NotesIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Image as ImageIcon,
  People as PeopleIcon,
  AccountBalanceWallet as BudgetIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Tabs, Tab } from "@mui/material";

const TaskView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [budgetResources, setBudgetResources] = useState(null);
  const [loadingResources, setLoadingResources] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loadingBudgetSummary, setLoadingBudgetSummary] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loadingProgressUpdates, setLoadingProgressUpdates] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [openAddImagesDialog, setOpenAddImagesDialog] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    resource_type: "", // material, equipment, labor, manual
    resource_id: "",
    quantity: 1,
    amount: "",
    type: "budgeted",
    date: new Date().toISOString().split("T")[0],
  });
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [creatingBudget, setCreatingBudget] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTask(result.data);
      } else {
        setError(result.message || "Failed to fetch task details");
      }
    } catch (err) {
      setError("Failed to fetch task details");
      console.error("Error fetching task:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetResources = async () => {
    try {
      setLoadingResources(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/budgets/resources/task/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBudgetResources(result.data);
      } else {
        console.error("Failed to fetch budget resources:", result.message);
      }
    } catch (err) {
      console.error("Error fetching budget resources:", err);
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchBudgetSummary = async () => {
    try {
      setLoadingBudgetSummary(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/budgets/total/task/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBudgetSummary(result.data);
      } else {
        console.error("Failed to fetch budget summary:", result.message);
      }
    } catch (err) {
      console.error("Error fetching budget summary:", err);
    } finally {
      setLoadingBudgetSummary(false);
    }
  };

  const fetchProgressUpdates = async () => {
    try {
      setLoadingProgressUpdates(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/progress-updates/task/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProgressUpdates(result.data || []);
      } else {
        console.error("Failed to fetch progress updates:", result.message);
      }
    } catch (err) {
      console.error("Error fetching progress updates:", err);
    } finally {
      setLoadingProgressUpdates(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "info";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "on_hold":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount, currency = "KES") => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      // Progress Updates tab
      fetchProgressUpdates();
    } else if (newValue === 2) {
      // Budget Resources tab
      if (!budgetResources) {
        fetchBudgetResources();
      }
      fetchBudgetSummary();
    }
  };

  const handleCreateBudget = async () => {
    try {
      setCreatingBudget(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const budgetData = {
        task_id: id,
        category: budgetForm.category,
        entry_type:
          budgetForm.resource_type === "manual" ? "manual" : "resource_based",
        type: budgetForm.type,
        date: budgetForm.date,
        amount: parseFloat(budgetForm.amount),
        quantity: budgetForm.quantity,
      };

      // Add resource-specific fields
      if (budgetForm.resource_type === "material") {
        budgetData.material_id = budgetForm.resource_id;
      } else if (budgetForm.resource_type === "equipment") {
        budgetData.equipment_id = budgetForm.resource_id;
      } else if (budgetForm.resource_type === "labor") {
        budgetData.labor_id = budgetForm.resource_id;
      }

      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Reset form and close dialog
        setBudgetForm({
          category: "",
          resource_type: "",
          resource_id: "",
          quantity: 1,
          amount: "",
          type: "budgeted",
          date: new Date().toISOString().split("T")[0],
        });
        setOpenBudgetDialog(false);

        // Refresh budget resources and summary
        fetchBudgetResources();
        fetchBudgetSummary();

        // Show success message with SweetAlert2
        Swal.fire({
          icon: "success",
          title: "Budget Created!",
          text: "Budget entry has been created successfully.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: "center",
        });
      } else {
        console.error("Failed to create budget:", result.message);
        Swal.fire({
          icon: "error",
          title: "Budget Creation Failed",
          text: result.message || "Failed to create budget entry.",
          confirmButtonText: "Try Again",
        });
      }
    } catch (err) {
      console.error("Error creating budget:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An error occurred while creating budget.",
        confirmButtonText: "OK",
      });
    } finally {
      setCreatingBudget(false);
    }
  };

  const handleResourceTypeChange = (resourceType) => {
    setBudgetForm({
      ...budgetForm,
      resource_type: resourceType,
      resource_id: "",
      amount: "",
    });
  };

  const handleResourceSelect = (resourceId, amount) => {
    setBudgetForm({
      ...budgetForm,
      resource_id: resourceId,
      amount: amount.toString(),
    });
  };

  const handleAddImagesToUpdate = (updateId) => {
    setSelectedUpdateId(updateId);
    setSelectedImages([]);
    setImagePreviews([]);
    setOpenAddImagesDialog(true);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);

    // Create preview URLs for the selected images
    const previews = files.map((file) => ({
      file: file,
      preview: URL.createObjectURL(file),
    }));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (indexToRemove) => {
    // Clean up the object URL for the removed image
    URL.revokeObjectURL(imagePreviews[indexToRemove].preview);

    // Remove from both arrays
    const updatedSelectedImages = selectedImages.filter(
      (_, index) => index !== indexToRemove
    );
    const updatedImagePreviews = imagePreviews.filter(
      (_, index) => index !== indexToRemove
    );

    setSelectedImages(updatedSelectedImages);
    setImagePreviews(updatedImagePreviews);
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Images Selected",
        text: "Please select at least one image to upload.",
      });
      return;
    }

    try {
      setUploadingImages(true);
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again.",
        });
        return;
      }

      const formData = new FormData();
      selectedImages.forEach((image) => {
        formData.append("progress_images", image);
      });

      const response = await fetch(
        `/api/progress-updates/${selectedUpdateId}/upload-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Clean up preview URLs
        imagePreviews.forEach((preview) =>
          URL.revokeObjectURL(preview.preview)
        );

        // Close dialog and reset state
        setOpenAddImagesDialog(false);
        setSelectedUpdateId(null);
        setSelectedImages([]);
        setImagePreviews([]);

        // Refresh progress updates to show new images
        fetchProgressUpdates();

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Images Added!",
          text: `${selectedImages.length} image(s) added to progress update successfully.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: "center",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: result.message || "Failed to upload images. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while uploading images.",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/tasks")}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Task not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/tasks")}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="lg" sx={{ px: 0 }}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
            borderRadius: "0 0 16px 16px",
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
            justifyContent="space-between"
            alignItems="center"
            position="relative"
            zIndex={1}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/tasks")}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Back
              </Button>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {task.name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Task Details
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ px: 3, pt: 2 }}>
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
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <TaskIcon />
                  <span>Task Details</span>
                </Box>
              }
            />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <ProgressIcon />
                  <span>Progress Updates</span>
                </Box>
              }
            />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <BudgetIcon />
                  <span>Budget Resources</span>
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <TaskIcon sx={{ color: "#667eea" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Basic Information
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TaskIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Task Status
                          </Typography>
                          <Chip
                            label={task.status?.toUpperCase()}
                            color={getStatusColor(task.status)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProjectIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Project
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {task.project?.name || "Not specified"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Start Date
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {formatDate(task.start_date)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Due Date
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {formatDate(task.due_date)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProgressIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Progress
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {task.progress_percent || 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Assigned Admin */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <PeopleIcon sx={{ color: "#fa709a" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Assigned Admin
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      {task.assignedAdmin ? (
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: "#667eea" }}>
                            {task.assignedAdmin.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ color: "#333" }}>
                              {task.assignedAdmin.name}
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mb={0.5}
                            >
                              <EmailIcon sx={{ fontSize: 16, color: "#666" }} />
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                {task.assignedAdmin.email}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ color: "#999", mt: 0.5 }}
                            >
                              Role:{" "}
                              {task.assignedAdmin.role
                                ?.replace("_", " ")
                                .toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ color: "#666" }}>
                          No admin assigned
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Task Summary */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <DescriptionIcon sx={{ color: "#4facfe" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Task Summary
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, color: "#333" }}
                          >
                            {task.materials?.length || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Materials
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, color: "#333" }}
                          >
                            {task.equipment?.length || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Equipment
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, color: "#333" }}
                          >
                            {task.labor?.length || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Workers
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Description */}
              {task.description && (
                <Grid item xs={12} sx={{ width: "100%" }}>
                  <Card
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                      width: "100%",
                      maxWidth: "none",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <DescriptionIcon sx={{ color: "#a8edea" }} />
                        <Typography variant="h5" sx={{ color: "#333" }}>
                          Description
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: "#333" }}>
                        {task.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Task Materials */}
              {task.materials && task.materials.length > 0 && (
                <Grid item xs={12} sx={{ width: "100%" }}>
                  <Card
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                      width: "100%",
                      maxWidth: "none",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <MaterialIcon sx={{ color: "#f093fb" }} />
                        <Typography variant="h5" sx={{ color: "#333" }}>
                          Materials ({task.materials.length})
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {task.materials.map((material, index) => {
                          const totalCost =
                            parseFloat(material.quantity_required || 0) *
                            parseFloat(material.unit_cost || 0);
                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box
                                sx={{
                                  p: 2,
                                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                                  borderRadius: 2,
                                  border: "2px solid rgba(255, 255, 255, 0.3)",
                                  height: "100%",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                                >
                                  {material.name || `Material ${index + 1}`}
                                </Typography>

                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    Unit:{" "}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666" }}
                                  >
                                    {material.unit || "N/A"}
                                  </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    Required:{" "}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666" }}
                                  >
                                    {material.quantity_required || 0}
                                  </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    Used:{" "}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666" }}
                                  >
                                    {material.quantity_used || 0}
                                  </Typography>
                                </Box>

                                {material.unit_cost && (
                                  <Box sx={{ mb: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666", fontWeight: 600 }}
                                    >
                                      Unit Cost:{" "}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666" }}
                                    >
                                      {formatCurrency(material.unit_cost)}
                                    </Typography>
                                  </Box>
                                )}

                                {totalCost > 0 && (
                                  <Box sx={{ mb: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666", fontWeight: 600 }}
                                    >
                                      Total Cost:{" "}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666", fontWeight: 600 }}
                                    >
                                      {formatCurrency(totalCost)}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Task Equipment */}
              {task.equipment && task.equipment.length > 0 && (
                <Grid item xs={12} sx={{ width: "100%" }}>
                  <Card
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                      width: "100%",
                      maxWidth: "none",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <EquipmentIcon sx={{ color: "#4facfe" }} />
                        <Typography variant="h5" sx={{ color: "#333" }}>
                          Equipment ({task.equipment.length})
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {task.equipment.map((equipment, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                height: "100%",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                              >
                                {equipment.name || `Equipment ${index + 1}`}
                              </Typography>

                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  Type:{" "}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666" }}
                                >
                                  {equipment.type || "N/A"}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  Status:{" "}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: equipment.availability
                                      ? "#4caf50"
                                      : "#f44336",
                                    fontWeight: 600,
                                  }}
                                >
                                  {equipment.availability
                                    ? "AVAILABLE"
                                    : "UNAVAILABLE"}
                                </Typography>
                              </Box>

                              {equipment.rental_cost_per_day && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    Daily Rate:{" "}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    {formatCurrency(
                                      equipment.rental_cost_per_day
                                    )}
                                  </Typography>
                                </Box>
                              )}

                              <Box
                                sx={{
                                  mt: 1,
                                  p: 1,
                                  backgroundColor: equipment.availability
                                    ? "rgba(76, 175, 80, 0.1)"
                                    : "rgba(244, 67, 54, 0.1)",
                                  borderRadius: 1,
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#333", fontWeight: 600 }}
                                >
                                  {equipment.availability
                                    ? "Ready for Use"
                                    : "Currently Unavailable"}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Task Labor */}
              {task.labor && task.labor.length > 0 && (
                <Grid item xs={12} sx={{ width: "100%" }}>
                  <Card
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                      width: "100%",
                      maxWidth: "none",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <LaborIcon sx={{ color: "#fa709a" }} />
                        <Typography variant="h5" sx={{ color: "#333" }}>
                          Labor ({task.labor.length})
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {task.labor.map((worker, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                height: "100%",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                              >
                                {worker.worker_name || `Worker ${index + 1}`}
                              </Typography>

                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  Type:{" "}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666" }}
                                >
                                  {worker.worker_type
                                    ?.replace("_", " ")
                                    .toUpperCase() || "N/A"}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  Status:{" "}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666" }}
                                >
                                  {worker.status?.toUpperCase() || "N/A"}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  Rate:{" "}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666" }}
                                >
                                  {formatCurrency(worker.hourly_rate)}/hr
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  Hours:{" "}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666" }}
                                >
                                  {worker.hours_worked || 0}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  Total:{" "}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontWeight: 600 }}
                                >
                                  {formatCurrency(worker.total_cost)}
                                </Typography>
                              </Box>

                              {worker.phone && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    Phone:{" "}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666" }}
                                  >
                                    {worker.phone}
                                  </Typography>
                                </Box>
                              )}

                              {worker.start_date && worker.end_date && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    Period:{" "}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666" }}
                                  >
                                    {formatDate(worker.start_date)} -{" "}
                                    {formatDate(worker.end_date)}
                                  </Typography>
                                </Box>
                              )}

                              {worker.skills && worker.skills.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      fontWeight: 600,
                                      display: "block",
                                      mb: 0.5,
                                    }}
                                  >
                                    Skills:
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 0.5,
                                    }}
                                  >
                                    {worker.skills.map((skill, skillIndex) => (
                                      <Box
                                        key={skillIndex}
                                        sx={{
                                          px: 1,
                                          py: 0.25,
                                          backgroundColor: "#e0e0e0",
                                          borderRadius: 1,
                                          fontSize: "0.65rem",
                                          color: "#333",
                                        }}
                                      >
                                        {skill}
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              {worker.is_requirement && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666", fontWeight: 600 }}
                                  >
                                    Required Qty:{" "}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666" }}
                                  >
                                    {worker.required_quantity || 1}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Task Budgets */}
              {task.budgets && task.budgets.length > 0 && (
                <Grid item xs={12} sx={{ width: "100%" }}>
                  <Card
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                      width: "100%",
                      maxWidth: "none",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <MoneyIcon sx={{ color: "#43e97b" }} />
                        <Typography variant="h5" sx={{ color: "#333" }}>
                          Budget Details ({task.budgets.length})
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {task.budgets.map((budget, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                              >
                                {budget.category || `Budget ${index + 1}`}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#666" }}
                              >
                                Type: {budget.type || "N/A"}
                              </Typography>
                              <br />
                              <Typography
                                variant="caption"
                                sx={{ color: "#666" }}
                              >
                                Amount: {formatCurrency(budget.amount)}
                              </Typography>
                              <br />
                              <Typography
                                variant="caption"
                                sx={{ color: "#666" }}
                              >
                                Date: {formatDate(budget.date)}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* Progress Updates Tab */}
          {activeTab === 1 && (
            <Box>
              {loadingProgressUpdates ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="200px"
                >
                  <CircularProgress />
                </Box>
              ) : progressUpdates && progressUpdates.length > 0 ? (
                <Box>
                  {/* Progress Updates Header */}
                  <Card
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                      mb: 3,
                      width: "100%",
                      maxWidth: "none",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <ProgressIcon sx={{ color: "#667eea" }} />
                        <Typography variant="h5" sx={{ color: "#333" }}>
                          Progress Updates ({progressUpdates.length})
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        Track the progress and updates for this task
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Progress Updates List */}
                  <Grid container spacing={3}>
                    {progressUpdates.map((update, index) => (
                      <Grid item xs={12} key={update.id}>
                        <Card
                          sx={{
                            backgroundColor: "white",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #e0e0e0",
                            width: "100%",
                            maxWidth: "none",
                          }}
                        >
                          <CardContent>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              mb={2}
                            >
                              <Box>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 600, color: "#333" }}
                                >
                                  Update #{index + 1}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#666" }}
                                >
                                  {formatDate(update.date)}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${update.progress_percent}%`}
                                color="primary"
                                sx={{
                                  backgroundColor: "#667eea",
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                            </Box>

                            <Typography
                              variant="body1"
                              sx={{ mb: 3, color: "#333" }}
                            >
                              {update.description}
                            </Typography>

                            {/* Progress Update Images */}
                            {update.images && update.images.length > 0 && (
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ mb: 2, color: "#666" }}
                                >
                                  Progress Images ({update.images.length})
                                </Typography>
                                <Grid container spacing={2}>
                                  {update.images.map((imageUrl, imageIndex) => (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={6}
                                      md={4}
                                      key={imageIndex}
                                    >
                                      <Box
                                        sx={{
                                          position: "relative",
                                          width: "100%",
                                          height: 200,
                                          borderRadius: 2,
                                          overflow: "hidden",
                                          border: "1px solid #e0e0e0",
                                        }}
                                      >
                                        <img
                                          src={`${window.location.origin}${imageUrl}`}
                                          alt={`Progress image ${
                                            imageIndex + 1
                                          }`}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                              "flex";
                                          }}
                                        />
                                        <Box
                                          sx={{
                                            display: "none",
                                            width: "100%",
                                            height: "100%",
                                            backgroundColor: "#f8f9fa",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <ImageIcon
                                            sx={{ fontSize: 48, color: "#666" }}
                                          />
                                          <Typography
                                            variant="caption"
                                            sx={{ color: "#666" }}
                                          >
                                            Image not available
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}

                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mt={2}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#999" }}
                              >
                                Created: {formatDate(update.createdAt)}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() =>
                                    handleAddImagesToUpdate(update.id)
                                  }
                                  sx={{
                                    borderColor: "#667eea",
                                    color: "#667eea",
                                    fontSize: "0.75rem",
                                    py: 0.5,
                                    px: 1,
                                    "&:hover": {
                                      borderColor: "#5a6fd8",
                                      backgroundColor:
                                        "rgba(102, 126, 234, 0.1)",
                                    },
                                  }}
                                >
                                  Add Photos
                                </Button>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#999" }}
                                >
                                  Updated: {formatDate(update.updatedAt)}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <ProgressIcon sx={{ fontSize: 64, color: "#666", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#666" }}>
                    No progress updates available
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Progress updates will appear here when they are created for
                    this task.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Budget Resources Tab */}
          {activeTab === 2 && (
            <Box>
              {loadingResources ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="200px"
                >
                  <CircularProgress />
                </Box>
              ) : budgetResources ? (
                <Box>
                  {/* Budget Resources Summary - Full Width Header */}
                  <Card
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e0e0e0",
                      mb: 3,
                      width: "100%",
                      maxWidth: "none",
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <BudgetIcon sx={{ color: "#667eea" }} />
                        <Typography variant="h5" sx={{ color: "#333" }}>
                          Budget Resources Summary
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center">
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 800, color: "#333" }}
                            >
                              {budgetResources.materials?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              Materials
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center">
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 800, color: "#333" }}
                            >
                              {budgetResources.equipment?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              Equipment
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center">
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 800, color: "#333" }}
                            >
                              {budgetResources.labor?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              Workers
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Budget Summary */}
                  {budgetSummary && (
                    <Card
                      sx={{
                        backgroundColor: "white",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e0e0e0",
                        mb: 3,
                        width: "100%",
                        maxWidth: "none",
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                          <BudgetIcon sx={{ color: "#667eea" }} />
                          <Typography variant="h5" sx={{ color: "#333" }}>
                            Total Budget Summary
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box textAlign="center">
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 800, color: "#333" }}
                              >
                                {formatCurrency(budgetSummary.total_budgeted)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                Total Budgeted
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box textAlign="center">
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 800, color: "#333" }}
                              >
                                {formatCurrency(budgetSummary.total_actual)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                Total Actual
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box textAlign="center">
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 800, color: "#333" }}
                              >
                                {formatCurrency(budgetSummary.total_overall)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                Total Overall
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box textAlign="center">
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 800, color: "#333" }}
                              >
                                {budgetSummary.budget_entries?.length || 0}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
                                Budget Entries
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Category Breakdown */}
                        {Object.keys(budgetSummary.by_category).length > 0 && (
                          <Box mt={3}>
                            <Typography
                              variant="subtitle1"
                              gutterBottom
                              sx={{ color: "#333" }}
                            >
                              Budget by Category:
                            </Typography>
                            <Grid container spacing={2}>
                              {Object.entries(budgetSummary.by_category).map(
                                ([category, data]) => (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={category}
                                  >
                                    <Box
                                      sx={{
                                        p: 2,
                                        bgcolor: "#f8f9fa",
                                        borderRadius: 1,
                                        textAlign: "center",
                                        border: "1px solid #e0e0e0",
                                      }}
                                    >
                                      <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600, color: "#333" }}
                                      >
                                        {category}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: "#666" }}
                                      >
                                        Budgeted:{" "}
                                        {formatCurrency(data.budgeted)}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: "#666" }}
                                      >
                                        Actual: {formatCurrency(data.actual)}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: "#666", fontWeight: 600 }}
                                      >
                                        Total: {formatCurrency(data.total)}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )
                              )}
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Budget Materials */}
                  {budgetResources.materials &&
                    budgetResources.materials.length > 0 && (
                      <Card
                        sx={{
                          backgroundColor: "white",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #e0e0e0",
                          width: "100%",
                          maxWidth: "none",
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={3}
                          >
                            <MaterialIcon sx={{ color: "#f093fb" }} />
                            <Typography variant="h5" sx={{ color: "#333" }}>
                              Budget Materials (
                              {budgetResources.materials.length})
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            {budgetResources.materials.map(
                              (material, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                  <Box
                                    sx={{
                                      p: 2,
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.2)",
                                      borderRadius: 2,
                                      border:
                                        "2px solid rgba(255, 255, 255, 0.3)",
                                      height: "100%",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: "#333",
                                      }}
                                    >
                                      {material.name}
                                    </Typography>

                                    <Box sx={{ mb: 1 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666", fontWeight: 600 }}
                                      >
                                        Unit:{" "}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666" }}
                                      >
                                        {material.unit}
                                      </Typography>
                                    </Box>

                                    <Box sx={{ mb: 1 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666", fontWeight: 600 }}
                                      >
                                        Required:{" "}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666" }}
                                      >
                                        {material.quantity_required}
                                      </Typography>
                                    </Box>

                                    <Box sx={{ mb: 1 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666", fontWeight: 600 }}
                                      >
                                        Unit Cost:{" "}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666" }}
                                      >
                                        {formatCurrency(material.unit_cost)}
                                      </Typography>
                                    </Box>

                                    <Box
                                      sx={{
                                        mt: 1,
                                        p: 1,
                                        backgroundColor: "#e0e0e0",
                                        borderRadius: 1,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#333", fontWeight: 600 }}
                                      >
                                        Estimated Cost:{" "}
                                        {formatCurrency(
                                          material.estimated_cost || 0
                                        )}
                                      </Typography>
                                    </Box>

                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<AddIcon />}
                                      onClick={() => {
                                        setBudgetForm({
                                          ...budgetForm,
                                          resource_type: "material",
                                          resource_id: material.id,
                                          category: "Materials",
                                          amount: (
                                            material.estimated_cost || 0
                                          ).toString(),
                                          quantity: parseFloat(
                                            material.quantity_required || 1
                                          ),
                                        });
                                        setOpenBudgetDialog(true);
                                      }}
                                      sx={{
                                        mt: 1,
                                        width: "100%",
                                        background: "#f093fb",
                                        color: "white",
                                        border: "1px solid #f093fb",
                                        "&:hover": {
                                          background: "#e085e8",
                                        },
                                        textTransform: "none",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Create Budget
                                    </Button>
                                  </Box>
                                </Grid>
                              )
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                  {/* Budget Equipment */}
                  {budgetResources.equipment &&
                    budgetResources.equipment.length > 0 && (
                      <Card
                        sx={{
                          backgroundColor: "white",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #e0e0e0",
                          width: "100%",
                          maxWidth: "none",
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={3}
                          >
                            <EquipmentIcon sx={{ color: "#4facfe" }} />
                            <Typography variant="h5" sx={{ color: "#333" }}>
                              Budget Equipment (
                              {budgetResources.equipment.length})
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            {budgetResources.equipment.map(
                              (equipment, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                  <Box
                                    sx={{
                                      p: 2,
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.2)",
                                      borderRadius: 2,
                                      border:
                                        "2px solid rgba(255, 255, 255, 0.3)",
                                      height: "100%",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: "#333",
                                      }}
                                    >
                                      {equipment.name}
                                    </Typography>

                                    <Box sx={{ mb: 1 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666", fontWeight: 600 }}
                                      >
                                        Type:{" "}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666" }}
                                      >
                                        {equipment.type}
                                      </Typography>
                                    </Box>

                                    <Box sx={{ mb: 1 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666", fontWeight: 600 }}
                                      >
                                        Status:{" "}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: equipment.availability
                                            ? "#4caf50"
                                            : "#f44336",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {equipment.availability
                                          ? "AVAILABLE"
                                          : "UNAVAILABLE"}
                                      </Typography>
                                    </Box>

                                    <Box
                                      sx={{
                                        mt: 1,
                                        p: 1,
                                        backgroundColor: "#e0e0e0",
                                        borderRadius: 1,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "#333",
                                          fontWeight: 600,
                                        }}
                                      >
                                        Daily Rate:{" "}
                                        {formatCurrency(
                                          equipment.daily_rate || 0
                                        )}
                                      </Typography>
                                    </Box>

                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<AddIcon />}
                                      onClick={() => {
                                        setBudgetForm({
                                          ...budgetForm,
                                          resource_type: "equipment",
                                          resource_id: equipment.id,
                                          category: "Equipment",
                                          amount: equipment.daily_rate || "0",
                                          quantity: 1,
                                        });
                                        setOpenBudgetDialog(true);
                                      }}
                                      sx={{
                                        mt: 1,
                                        width: "100%",
                                        background: "#4facfe",
                                        color: "white",
                                        border: "1px solid #4facfe",
                                        "&:hover": {
                                          background: "#3d8bfe",
                                        },
                                        textTransform: "none",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Create Budget
                                    </Button>
                                  </Box>
                                </Grid>
                              )
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                  {/* Budget Labor */}
                  {budgetResources.labor &&
                    budgetResources.labor.length > 0 && (
                      <Card
                        sx={{
                          backgroundColor: "white",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #e0e0e0",
                          width: "100%",
                          maxWidth: "none",
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={3}
                          >
                            <LaborIcon sx={{ color: "#fa709a" }} />
                            <Typography variant="h5" sx={{ color: "#333" }}>
                              Budget Labor ({budgetResources.labor.length})
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            {budgetResources.labor.map((worker, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box
                                  sx={{
                                    p: 2,
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    borderRadius: 2,
                                    border:
                                      "2px solid rgba(255, 255, 255, 0.3)",
                                    height: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      mb: 1,
                                      color: "#333",
                                    }}
                                  >
                                    {worker.worker_name}
                                  </Typography>

                                  <Box sx={{ mb: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666", fontWeight: 600 }}
                                    >
                                      Type:{" "}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666" }}
                                    >
                                      {worker.worker_type
                                        ?.replace("_", " ")
                                        .toUpperCase()}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ mb: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666", fontWeight: 600 }}
                                    >
                                      Rate:{" "}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666" }}
                                    >
                                      {formatCurrency(worker.hourly_rate)}/hr
                                    </Typography>
                                  </Box>

                                  <Box sx={{ mb: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666", fontWeight: 600 }}
                                    >
                                      Hours:{" "}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666" }}
                                    >
                                      {worker.hours_worked}
                                    </Typography>
                                  </Box>

                                  {worker.is_requirement && (
                                    <Box sx={{ mb: 1 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666", fontWeight: 600 }}
                                      >
                                        Required Qty:{" "}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#666" }}
                                      >
                                        {worker.required_quantity}
                                      </Typography>
                                    </Box>
                                  )}

                                  <Box
                                    sx={{
                                      mt: 1,
                                      p: 1,
                                      backgroundColor: "#e0e0e0",
                                      borderRadius: 1,
                                      textAlign: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#333", fontWeight: 600 }}
                                    >
                                      Estimated Cost:{" "}
                                      {formatCurrency(
                                        worker.estimated_cost || 0
                                      )}
                                    </Typography>
                                  </Box>

                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                      setBudgetForm({
                                        ...budgetForm,
                                        resource_type: "labor",
                                        resource_id: worker.id,
                                        category: "Labor",
                                        amount: (
                                          worker.estimated_cost || 0
                                        ).toString(),
                                        quantity: worker.required_quantity || 1,
                                      });
                                      setOpenBudgetDialog(true);
                                    }}
                                    sx={{
                                      mt: 1,
                                      width: "100%",
                                      background: "#fa709a",
                                      color: "white",
                                      border: "1px solid #fa709a",
                                      "&:hover": {
                                        background: "#f85a8a",
                                      },
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Create Budget
                                  </Button>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    )}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" sx={{ color: "#666" }}>
                    No budget resources available
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Budget Creation Dialog */}
        <Dialog
          open={openBudgetDialog}
          onClose={() => setOpenBudgetDialog(false)}
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
            <BudgetIcon
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
                Create Budget Entry
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Add a new budget entry for this task
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}
          >
            <Box
              component="form"
              noValidate
              sx={{ maxHeight: "55vh", overflowY: "auto" }}
            >
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {/* Resource Type */}
                <FormControl fullWidth variant="outlined" size="small" required>
                  <InputLabel>Resource Type</InputLabel>
                  <Select
                    value={budgetForm.resource_type}
                    onChange={(e) => handleResourceTypeChange(e.target.value)}
                    label="Resource Type"
                  >
                    <MenuItem value="material">Material</MenuItem>
                    <MenuItem value="equipment">Equipment</MenuItem>
                    <MenuItem value="labor">Labor</MenuItem>
                    <MenuItem value="manual">Manual Entry</MenuItem>
                  </Select>
                </FormControl>

                {/* Category */}
                <TextField
                  fullWidth
                  label="Category"
                  value={budgetForm.category}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, category: e.target.value })
                  }
                  placeholder="e.g., Materials, Labor, Equipment"
                  required
                  variant="outlined"
                  size="small"
                />

                {/* Selected Resource Info */}
                {budgetForm.resource_type &&
                  budgetForm.resource_type !== "manual" &&
                  budgetForm.resource_id && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                        sx={{ mb: 1 }}
                      >
                        Selected{" "}
                        {budgetForm.resource_type.charAt(0).toUpperCase() +
                          budgetForm.resource_type.slice(1)}
                        :
                      </Typography>
                      <Card
                        sx={{
                          p: 2,
                          bgcolor: "rgba(102, 126, 234, 0.05)",
                          border: "2px solid rgba(102, 126, 234, 0.2)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="primary"
                        >
                          {budgetForm.resource_type === "material" &&
                            budgetResources?.materials?.find(
                              (m) => m.id === budgetForm.resource_id
                            )?.name}
                          {budgetForm.resource_type === "equipment" &&
                            budgetResources?.equipment?.find(
                              (e) => e.id === budgetForm.resource_id
                            )?.name}
                          {budgetForm.resource_type === "labor" &&
                            budgetResources?.labor?.find(
                              (l) => l.id === budgetForm.resource_id
                            )?.worker_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {budgetForm.resource_type === "material" &&
                            `${
                              budgetResources?.materials?.find(
                                (m) => m.id === budgetForm.resource_id
                              )?.unit_cost
                            } per ${
                              budgetResources?.materials?.find(
                                (m) => m.id === budgetForm.resource_id
                              )?.unit
                            }`}
                          {budgetForm.resource_type === "equipment" &&
                            `${
                              budgetResources?.equipment?.find(
                                (e) => e.id === budgetForm.resource_id
                              )?.daily_rate
                            } per day`}
                          {budgetForm.resource_type === "labor" &&
                            `${budgetResources?.labor
                              ?.find((l) => l.id === budgetForm.resource_id)
                              ?.worker_type.replace("_", " ")
                              .toUpperCase()}`}
                        </Typography>
                      </Card>
                    </Box>
                  )}

                {/* Resource Selection Dropdown */}
                {budgetForm.resource_type &&
                  budgetForm.resource_type !== "manual" &&
                  !budgetForm.resource_id && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                        sx={{ mb: 1 }}
                      >
                        Select{" "}
                        {budgetForm.resource_type.charAt(0).toUpperCase() +
                          budgetForm.resource_type.slice(1)}
                        :
                      </Typography>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>
                          Select{" "}
                          {budgetForm.resource_type.charAt(0).toUpperCase() +
                            budgetForm.resource_type.slice(1)}
                        </InputLabel>
                        <Select
                          value={budgetForm.resource_id}
                          onChange={(e) => {
                            const resourceId = e.target.value;
                            let amount = 0;

                            if (budgetForm.resource_type === "material") {
                              const material = budgetResources?.materials?.find(
                                (m) => m.id === resourceId
                              );
                              amount = material?.estimated_cost || 0;
                            } else if (
                              budgetForm.resource_type === "equipment"
                            ) {
                              const equipment =
                                budgetResources?.equipment?.find(
                                  (eq) => eq.id === resourceId
                                );
                              amount = equipment?.daily_rate || 0;
                            } else if (budgetForm.resource_type === "labor") {
                              const worker = budgetResources?.labor?.find(
                                (l) => l.id === resourceId
                              );
                              amount = worker?.estimated_cost || 0;
                            }

                            handleResourceSelect(resourceId, amount);
                          }}
                          label={
                            "Select " +
                            budgetForm.resource_type.charAt(0).toUpperCase() +
                            budgetForm.resource_type.slice(1)
                          }
                        >
                          {budgetForm.resource_type === "material" &&
                            budgetResources?.materials?.map((material) => (
                              <MenuItem key={material.id} value={material.id}>
                                {material.name} -{" "}
                                {formatCurrency(material.unit_cost)} per{" "}
                                {material.unit}
                              </MenuItem>
                            ))}
                          {budgetForm.resource_type === "equipment" &&
                            budgetResources?.equipment?.map((equipment) => (
                              <MenuItem key={equipment.id} value={equipment.id}>
                                {equipment.name} -{" "}
                                {formatCurrency(equipment.daily_rate)} per day
                              </MenuItem>
                            ))}
                          {budgetForm.resource_type === "labor" &&
                            budgetResources?.labor?.map((worker) => (
                              <MenuItem key={worker.id} value={worker.id}>
                                {worker.worker_name} -{" "}
                                {worker.worker_type
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                {/* Amount and Quantity Row */}
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={1.5}
                >
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={budgetForm.amount}
                    onChange={(e) =>
                      setBudgetForm({ ...budgetForm, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    required
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 1, fontSize: "0.875rem" }}>
                          KES
                        </Typography>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label={
                      budgetForm.resource_type === "equipment"
                        ? "Quantity (Days)"
                        : "Quantity"
                    }
                    type="number"
                    value={budgetForm.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      setBudgetForm({
                        ...budgetForm,
                        quantity: newQuantity,
                        // Auto-update amount for equipment based on daily rate
                        amount:
                          budgetForm.resource_type === "equipment" &&
                          budgetResources?.equipment?.find(
                            (eq) => eq.id === budgetForm.resource_id
                          )
                            ? (
                                parseFloat(
                                  budgetResources.equipment.find(
                                    (eq) => eq.id === budgetForm.resource_id
                                  ).daily_rate || 0
                                ) * newQuantity
                              ).toString()
                            : budgetForm.amount,
                      });
                    }}
                    placeholder={
                      budgetForm.resource_type === "equipment"
                        ? "Enter number of days"
                        : "Enter quantity"
                    }
                    required
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                </Box>

                {/* Budget Type and Date Row */}
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={1.5}
                >
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Budget Type</InputLabel>
                    <Select
                      value={budgetForm.type}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, type: e.target.value })
                      }
                      label="Budget Type"
                    >
                      <MenuItem value="budgeted">Budgeted</MenuItem>
                      <MenuItem value="actual">Actual</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={budgetForm.date}
                    onChange={(e) =>
                      setBudgetForm({ ...budgetForm, date: e.target.value })
                    }
                    required
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => setOpenBudgetDialog(false)}
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
              onClick={handleCreateBudget}
              variant="contained"
              disabled={
                creatingBudget || !budgetForm.category || !budgetForm.amount
              }
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            >
              {creatingBudget ? "Creating..." : "Create Budget"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Images Dialog */}
        <Dialog
          open={openAddImagesDialog}
          onClose={() => {
            // Clean up preview URLs
            imagePreviews.forEach((preview) =>
              URL.revokeObjectURL(preview.preview)
            );
            setOpenAddImagesDialog(false);
            setSelectedUpdateId(null);
            setSelectedImages([]);
            setImagePreviews([]);
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
            <ImageIcon sx={{ position: "relative", zIndex: 1, fontSize: 28 }} />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Add Photos to Progress Update
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Upload additional images for this progress update
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Box
              sx={{
                border: "2px dashed #667eea",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                backgroundColor: "rgba(102, 126, 234, 0.05)",
                mb: 3,
              }}
            >
              <ImageIcon sx={{ fontSize: 48, color: "#667eea", mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 1, color: "#667eea" }}>
                Select Images
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose multiple images to add to this progress update
              </Typography>

              {imagePreviews.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                    Selected Images ({imagePreviews.length}):
                  </Typography>
                  <Grid container spacing={2}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: 120,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "2px solid rgba(102, 126, 234, 0.3)",
                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                            "&:hover .remove-icon": {
                              opacity: 1,
                            },
                          }}
                        >
                          <img
                            src={preview.preview}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />

                          {/* Remove button */}
                          <IconButton
                            className="remove-icon"
                            onClick={() => handleRemoveImage(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              backgroundColor: "rgba(0, 0, 0, 0.6)",
                              color: "white",
                              width: 24,
                              height: 24,
                              opacity: 0,
                              transition: "opacity 0.2s ease",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.8)",
                              },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Box
                            sx={{
                              display: "none",
                              width: "100%",
                              height: "100%",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "column",
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                            }}
                          >
                            <ImageIcon
                              sx={{
                                fontSize: 32,
                                color: "#667eea",
                                opacity: 0.7,
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "#667eea", opacity: 0.7 }}
                            >
                              Preview Error
                            </Typography>
                          </Box>

                          {/* Image info overlay */}
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background:
                                "linear-gradient(transparent, rgba(0,0,0,0.7))",
                              color: "white",
                              p: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {preview.file.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.65rem",
                                opacity: 0.8,
                              }}
                            >
                              {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                id="image-upload"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="contained"
                  component="span"
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {selectedImages.length > 0
                    ? "Change Images"
                    : "Choose Images"}
                </Button>
              </label>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            <Button
              onClick={() => {
                // Clean up preview URLs
                imagePreviews.forEach((preview) =>
                  URL.revokeObjectURL(preview.preview)
                );
                setOpenAddImagesDialog(false);
                setSelectedUpdateId(null);
                setSelectedImages([]);
                setImagePreviews([]);
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
              onClick={handleUploadImages}
              variant="contained"
              disabled={uploadingImages || imagePreviews.length === 0}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            >
              {uploadingImages
                ? "Uploading..."
                : `Upload ${imagePreviews.length} Image(s)`}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default TaskView;
