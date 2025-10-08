import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

const QuotationGenerator = ({ projectId, projectName, onClose, open }) => {
  const [loading, setLoading] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [error, setError] = useState(null);
  const [budgetTypes, setBudgetTypes] = useState({
    budgeted: true,
    actual: true,
  });
  const [quotationType, setQuotationType] = useState("both"); // "budgeted", "actual", or "both"

  const fetchQuotationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `/api/quotations/project/${projectId}/data?quotationType=${quotationType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch quotation data");
      }

      const result = await response.json();
      setQuotationData(result.data);
    } catch (err) {
      console.error("Error fetching quotation data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `/api/quotations/project/${projectId}/pdf?quotationType=${quotationType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quotation-${projectName.replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuotationData(null);
    setError(null);
    onClose();
  };

  const formatCurrency = (amount, currency = "KES") => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PdfIcon color="primary" />
            <Typography variant="h6">Generate Project Quotation</Typography>
          </Box>
          <Button onClick={handleClose} size="small">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!quotationData ? (
          <Box>
            <Typography variant="body1" gutterBottom textAlign="center">
              Generate a professional PDF quotation for{" "}
              <strong>{projectName}</strong>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
              textAlign="center"
            >
              This will include project details, budget summaries, and task
              breakdowns
            </Typography>

            {/* Budget Type Selection */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Budget Type for Quotation
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={quotationType}
                    onChange={(e) => setQuotationType(e.target.value)}
                  >
                    <FormControlLabel
                      value="both"
                      control={<Radio />}
                      label="Both Budgeted and Actual Costs (Comparison)"
                    />
                    <FormControlLabel
                      value="budgeted"
                      control={<Radio />}
                      label="Budgeted Costs Only (Estimate)"
                    />
                    <FormControlLabel
                      value="actual"
                      control={<Radio />}
                      label="Actual Costs Only (Final)"
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>

            <Box textAlign="center">
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={fetchQuotationData}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  "Preview Quotation Data"
                )}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {/* Project Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Project Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {quotationData.project.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Client
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {quotationData.project.client_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {quotationData.project.location_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Currency
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {quotationData.project.currency}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Budget Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        {formatCurrency(
                          quotationData.budgetSummary.totalBudgeted,
                          quotationData.project.currency
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Budgeted
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="secondary">
                        {formatCurrency(
                          quotationData.budgetSummary.totalActual,
                          quotationData.project.currency
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Actual
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h6"
                        color={
                          quotationData.budgetSummary.totalVariance >= 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {formatCurrency(
                          quotationData.budgetSummary.totalVariance,
                          quotationData.project.currency
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Variance
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="info.main">
                        {quotationData.budgetSummary.taskSummaries.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tasks
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Task Breakdown Preview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Breakdown Preview
                </Typography>
                <Stack spacing={1}>
                  {quotationData.budgetSummary.taskSummaries
                    .slice(0, 5)
                    .map((task, index) => (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {task.taskName}
                        </Typography>
                        <Box display="flex" gap={2}>
                          <Chip
                            label={formatCurrency(
                              task.budgeted,
                              quotationData.project.currency
                            )}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={formatCurrency(
                              task.actual,
                              quotationData.project.currency
                            )}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${task.variancePercentage}%`}
                            size="small"
                            color={task.variance >= 0 ? "success" : "error"}
                          />
                        </Box>
                      </Box>
                    ))}
                  {quotationData.budgetSummary.taskSummaries.length > 5 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                    >
                      ... and{" "}
                      {quotationData.budgetSummary.taskSummaries.length - 5}{" "}
                      more tasks
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Category Breakdown Preview */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Breakdown Preview
                </Typography>
                <Stack spacing={1}>
                  {Object.entries(quotationData.budgetSummary.categoryBreakdown)
                    .slice(0, 5)
                    .map(([category, amounts], index) => {
                      const variance = amounts.actual - amounts.budgeted;
                      const variancePercentage =
                        amounts.budgeted > 0
                          ? ((variance / amounts.budgeted) * 100).toFixed(2)
                          : 0;
                      return (
                        <Box
                          key={index}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {category}
                          </Typography>
                          <Box display="flex" gap={2}>
                            <Chip
                              label={formatCurrency(
                                amounts.budgeted,
                                quotationData.project.currency
                              )}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={formatCurrency(
                                amounts.actual,
                                quotationData.project.currency
                              )}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                            <Chip
                              label={`${variancePercentage}%`}
                              size="small"
                              color={variance >= 0 ? "success" : "error"}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {quotationData && (
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
            onClick={generatePDF}
            disabled={loading}
            color="primary"
          >
            {loading ? "Generating..." : "Generate & Download PDF"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuotationGenerator;
