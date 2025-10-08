import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Construction,
  Save,
  ArrowBack,
  Add,
  Close,
  Image as ImageIcon,
  AttachFile,
  Upload,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    location_name: "",
    latitude: "",
    longitude: "",
    status: "planning",
    start_date: "",
    end_date: "",
    budget_estimate: "",
    actual_cost: "",
    currency: "KES",
    contractor_name: "",
    client_name: "",
    funding_source: "",
    engineer_in_charge: "",
    progress_percent: 0,
    notes: "",
    floor_size: "",
    construction_type: "building",
  });
  const [blueprintFiles, setBlueprintFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);
  const [blueprintPreviews, setBlueprintPreviews] = useState([]);

  const statusOptions = [
    { value: "planning", label: "Planning", color: "#ff9800" },
    { value: "in_progress", label: "In Progress", color: "#2196f3" },
    { value: "completed", label: "Completed", color: "#4caf50" },
    { value: "on_hold", label: "On Hold", color: "#f44336" },
    { value: "cancelled", label: "Cancelled", color: "#9e9e9e" },
  ];

  const currencyOptions = [
    { value: "KES", label: "Kenyan Shilling (KES)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
  ];

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setEngineers(result.data);
      }
    } catch (err) {
      console.error("Error fetching engineers:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setProjectForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Generate previews for image files
    const newPreviews = [...filePreviews];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          setFilePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push(null);
        setFilePreviews([...newPreviews]);
      }
    });
  };

  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleBlueprintFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [...blueprintFiles, ...files];
    setBlueprintFiles(newFiles);

    // Generate previews for image files
    const newPreviews = [...blueprintPreviews];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          setBlueprintPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push(null);
        setBlueprintPreviews([...newPreviews]);
      }
    });
  };

  const removeBlueprintFile = (index) => {
    const newFiles = blueprintFiles.filter((_, i) => i !== index);
    const newPreviews = blueprintPreviews.filter((_, i) => i !== index);
    setBlueprintFiles(newFiles);
    setBlueprintPreviews(newPreviews);
  };

  const handleCreate = async () => {
    try {
      setSaving(true);

      // Prepare form data for project creation with both blueprint and document files
      const formData = new FormData();

      // Add all project form fields
      Object.keys(projectForm).forEach((key) => {
        if (projectForm[key] !== null && projectForm[key] !== undefined) {
          formData.append(key, projectForm[key]);
        }
      });

      // Add document files directly (not through document API)
      selectedFiles.forEach((file) => {
        formData.append("documents", file);
      });

      // Add blueprint files
      blueprintFiles.forEach((file) => {
        formData.append("blueprints", file);
      });

      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Project created successfully!",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/projects");
      } else {
        throw new Error(result.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create project",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      projectForm.name.trim() &&
      projectForm.location_name.trim() &&
      projectForm.start_date &&
      projectForm.engineer_in_charge
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            mb: 4,
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
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <IconButton
              onClick={() => navigate("/projects")}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Construction sx={{ fontSize: 40 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Create New Project
            </Typography>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2, position: "relative", zIndex: 1 }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <Grid container spacing={4} sx={{ width: "100%" }}>
          {/* Basic Information */}
          <Grid item xs={12} sx={{ width: "100%" }}>
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Construction sx={{ color: "#667eea" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
                    <TextField
                      fullWidth
                      label="Project Name"
                      value={projectForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={projectForm.location_name}
                      onChange={(e) =>
                        handleInputChange("location_name", e.target.value)
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={projectForm.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={projectForm.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      value={projectForm.latitude}
                      onChange={(e) =>
                        handleInputChange("latitude", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      value={projectForm.longitude}
                      onChange={(e) =>
                        handleInputChange("longitude", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Construction sx={{ color: "#f093fb" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Financial Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Budget Estimate"
                      type="number"
                      value={projectForm.budget_estimate}
                      onChange={(e) =>
                        handleInputChange("budget_estimate", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Actual Cost"
                      type="number"
                      value={projectForm.actual_cost}
                      onChange={(e) =>
                        handleInputChange("actual_cost", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={projectForm.currency}
                        onChange={(e) =>
                          handleInputChange("currency", e.target.value)
                        }
                        label="Currency"
                      >
                        {currencyOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Stakeholders */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Construction sx={{ color: "#4facfe" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Stakeholders
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contractor Name"
                      value={projectForm.contractor_name}
                      onChange={(e) =>
                        handleInputChange("contractor_name", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={projectForm.client_name}
                      onChange={(e) =>
                        handleInputChange("client_name", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Funding Source"
                      value={projectForm.funding_source}
                      onChange={(e) =>
                        handleInputChange("funding_source", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={projectForm.engineer_in_charge}
                      onChange={(e) =>
                        handleInputChange("engineer_in_charge", e.target.value)
                      }
                      required
                      select
                      placeholder="Engineer in Charge"
                      SelectProps={{
                        native: false,
                        displayEmpty: true,
                        renderValue: (selected) => {
                          if (!selected) {
                            return (
                              <span style={{ color: "#999" }}>
                                Engineer in Charge
                              </span>
                            );
                          }
                          const engineer = engineers.find(
                            (eng) => eng.id === selected
                          );
                          return engineer
                            ? `${engineer.name} (${engineer.role})`
                            : "";
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      {engineers.map((engineer) => (
                        <MenuItem key={engineer.id} value={engineer.id}>
                          {engineer.name} ({engineer.role})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Project Status & Progress */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Construction sx={{ color: "#43e97b" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Project Status & Progress
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={projectForm.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        label="Status"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: option.color,
                                }}
                              />
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Progress Percentage"
                      type="number"
                      value={projectForm.progress_percent}
                      onChange={(e) =>
                        handleInputChange("progress_percent", e.target.value)
                      }
                      inputProps={{ min: 0, max: 100 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={projectForm.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Floor Size (m²)"
                      type="number"
                      value={projectForm.floor_size}
                      onChange={(e) =>
                        handleInputChange("floor_size", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <InputLabel>Construction Type</InputLabel>
                      <Select
                        value={projectForm.construction_type}
                        onChange={(e) =>
                          handleInputChange("construction_type", e.target.value)
                        }
                        label="Construction Type"
                      >
                        <MenuItem value="building">Building</MenuItem>
                        <MenuItem value="infrastructure">
                          Infrastructure
                        </MenuItem>
                        <MenuItem value="industrial">Industrial</MenuItem>
                        <MenuItem value="specialized">Specialized</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Upload sx={{ color: "#fa709a" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    File Upload
                  </Typography>
                </Box>

                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Add />}
                    fullWidth
                    sx={{
                      color: "#fa709a",
                      borderColor: "#fa709a",
                      "&:hover": {
                        borderColor: "#fa709a",
                        backgroundColor: "rgba(250, 112, 154, 0.1)",
                      },
                    }}
                  >
                    Select Files
                  </Button>
                </label>

                {selectedFiles.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" mb={1}>
                      Selected Files:
                    </Typography>
                    <Grid container spacing={1}>
                      {selectedFiles.map((file, index) => (
                        <Grid item xs={12} key={index}>
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 1,
                              border: "1px solid #e0e0e0",
                              position: "relative",
                            }}
                          >
                            <IconButton
                              onClick={() => removeSelectedFile(index)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                color: "#666",
                                p: 0.5,
                              }}
                              size="small"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                            {filePreviews[index] ? (
                              <img
                                src={filePreviews[index]}
                                alt={file.name}
                                style={{
                                  width: "100%",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                }}
                              />
                            ) : (
                              <Box display="flex" alignItems="center" gap={1}>
                                <AttachFile />
                                <Typography variant="caption">
                                  {file.name}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Blueprint Management */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Construction sx={{ color: "#ff6b6b" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Project Blueprints
                  </Typography>
                </Box>

                {/* Blueprint File Upload */}
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                  onChange={handleBlueprintFileSelect}
                  style={{ display: "none" }}
                  id="blueprint-upload"
                />
                <label htmlFor="blueprint-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Add />}
                    fullWidth
                    sx={{
                      color: "#ff6b6b",
                      borderColor: "#ff6b6b",
                      "&:hover": {
                        borderColor: "#ff6b6b",
                        backgroundColor: "rgba(255, 107, 107, 0.1)",
                      },
                      mb: 2,
                    }}
                  >
                    Select Blueprint Files
                  </Button>
                </label>

                {/* Selected Blueprint Files */}
                {blueprintFiles.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" mb={1}>
                      Selected Blueprint Files:
                    </Typography>
                    <Grid container spacing={1}>
                      {blueprintFiles.map((file, index) => (
                        <Grid item xs={12} key={index}>
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 1,
                              border: "1px solid #e0e0e0",
                              position: "relative",
                            }}
                          >
                            <IconButton
                              onClick={() => removeBlueprintFile(index)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                color: "#666",
                                p: 0.5,
                              }}
                              size="small"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                            {blueprintPreviews[index] ? (
                              <img
                                src={blueprintPreviews[index]}
                                alt={file.name}
                                style={{
                                  width: "100%",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                }}
                              />
                            ) : (
                              <Box display="flex" alignItems="center" gap={1}>
                                <AttachFile />
                                <Typography variant="caption">
                                  {file.name}
                                </Typography>
                              </Box>
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                display: "block",
                                textAlign: "center",
                                wordBreak: "break-word",
                              }}
                            >
                              {file.name}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent>
                <Box display="flex">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <Save />
                    }
                    onClick={handleCreate}
                    disabled={!isFormValid() || saving}
                    sx={{
                      flex: 1,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                      },
                      "&:disabled": {
                        background: "#e0e0e0",
                        color: "#999",
                      },
                    }}
                  >
                    {saving ? "Creating..." : "Create Project"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/projects")}
                    sx={{
                      flex: 1,
                      color: "#667eea",
                      borderColor: "#667eea",
                      "&:hover": {
                        borderColor: "#667eea",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProjectCreate;
