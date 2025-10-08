import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Construction as ProjectIcon,
  Build as MaterialIcon,
  Construction as EquipmentIcon,
  Work as LaborIcon,
  TrendingUp as ProgressIcon,
  AccountBalanceWallet as BudgetIcon,
} from "@mui/icons-material";
import { Tabs, Tab } from "@mui/material";

const BudgetView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchBudget();
  }, [id]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/budgets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBudget(result.data);
      } else {
        setError(result.message || "Failed to fetch budget details");
      }
    } catch (err) {
      setError("Failed to fetch budget details");
      console.error("Error fetching budget:", err);
    } finally {
      setLoading(false);
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
          onClick={() => navigate("/budget")}
        >
          Back to Budgets
        </Button>
      </Container>
    );
  }

  if (!budget) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Budget not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/budget")}
        >
          Back to Budgets
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
                onClick={() => navigate("/budget")}
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
                  {budget.category} - {formatCurrency(budget.amount)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Budget Details
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
                  <BudgetIcon />
                  <span>Budget Details</span>
                </Box>
              }
            />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <TaskIcon />
                  <span>Task Information</span>
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Budget Information */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Budget Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BudgetIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Category
                          </Typography>
                          <Typography variant="body1">
                            {budget.category}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <MoneyIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Amount
                          </Typography>
                          <Typography variant="body1">
                            {formatCurrency(budget.amount)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={budget.type?.toUpperCase()}
                          color={
                            budget.type === "budgeted" ? "info" : "success"
                          }
                          size="small"
                        />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Type
                          </Typography>
                          <Typography variant="body1">{budget.type}</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(budget.date)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Entry Type
                          </Typography>
                          <Typography variant="body1">
                            {budget.entry_type?.replace("_", " ").toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Quantity
                        </Typography>
                        <Typography variant="body1">
                          {budget.quantity}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Resource Information */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resource Information
                    </Typography>
                    <Stack spacing={2}>
                      {budget.material && (
                        <Box display="flex" alignItems="center" gap={2}>
                          <MaterialIcon />
                          <Box>
                            <Typography variant="h6">
                              {budget.material.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {formatCurrency(budget.material.unit_cost)} per{" "}
                              {budget.material.unit}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {budget.equipment && (
                        <Box display="flex" alignItems="center" gap={2}>
                          <EquipmentIcon />
                          <Box>
                            <Typography variant="h6">
                              {budget.equipment.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {budget.equipment.type} -{" "}
                              {formatCurrency(
                                budget.equipment.rental_cost_per_day
                              )}
                              /day
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {budget.labor && (
                        <Box display="flex" alignItems="center" gap={2}>
                          <LaborIcon />
                          <Box>
                            <Typography variant="h6">
                              {budget.labor.worker_name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {budget.labor.worker_type
                                ?.replace("_", " ")
                                .toUpperCase()}{" "}
                              - {formatCurrency(budget.labor.hourly_rate)}/hr
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {!budget.material &&
                        !budget.equipment &&
                        !budget.labor && (
                          <Typography variant="body1" sx={{ opacity: 0.8 }}>
                            Manual Entry
                          </Typography>
                        )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Budget Summary */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "white",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <BudgetIcon />
                      <Typography variant="h6">Budget Summary</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {formatCurrency(budget.amount)}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Budget Amount
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {budget.quantity}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Quantity
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {formatCurrency(
                              budget.calculated_amount || budget.amount
                            )}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Calculated Amount
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {budget.entry_type?.replace("_", " ").toUpperCase()}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Entry Type
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Task Information Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {/* Task Basic Information */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Task Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TaskIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Task Name
                          </Typography>
                          <Typography variant="body1">
                            {budget.task?.name || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={budget.task?.status?.toUpperCase()}
                          color={getStatusColor(budget.task?.status)}
                          size="small"
                        />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Status
                          </Typography>
                          <Typography variant="body1">
                            {budget.task?.status || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProgressIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Progress
                          </Typography>
                          <Typography variant="body1">
                            {budget.task?.progress_percent || 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Project Information */}
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Project Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProjectIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Project Name
                          </Typography>
                          <Typography variant="body1">
                            {budget.task?.project?.name || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={budget.task?.project?.status?.toUpperCase()}
                          color={getStatusColor(budget.task?.project?.status)}
                          size="small"
                        />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Project Status
                          </Typography>
                          <Typography variant="body1">
                            {budget.task?.project?.status || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProgressIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Project Progress
                          </Typography>
                          <Typography variant="body1">
                            {budget.task?.project?.progress_percent || 0}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Start Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(budget.task?.project?.start_date)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            End Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(budget.task?.project?.end_date)}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default BudgetView;
