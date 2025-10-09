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
  Event,
  Save,
  ArrowBack,
  Add,
  Close,
  Image as ImageIcon,
  AttachFile,
  Upload,
  LocationOn,
  Schedule,
  Category,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EventCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    venue: "",
    county: "",
    sub_county: "",
    event_date: "",
    start_time: "",
    end_time: "",
    category: "",
    commission_rate: 10.0,
    status: "pending",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]);

  const categoryOptions = [
    { value: "Music", label: "Music" },
    { value: "Sports", label: "Sports" },
    { value: "Conference", label: "Conference" },
    { value: "Workshop", label: "Workshop" },
    { value: "Festival", label: "Festival" },
    { value: "Exhibition", label: "Exhibition" },
    { value: "Theater", label: "Theater" },
    { value: "Comedy", label: "Comedy" },
    { value: "Other", label: "Other" },
  ];

  const countyOptions = [
    { value: "Baringo", label: "Baringo" },
    { value: "Bomet", label: "Bomet" },
    { value: "Bungoma", label: "Bungoma" },
    { value: "Busia", label: "Busia" },
    { value: "Elgeyo-Marakwet", label: "Elgeyo-Marakwet" },
    { value: "Embu", label: "Embu" },
    { value: "Garissa", label: "Garissa" },
    { value: "Homa Bay", label: "Homa Bay" },
    { value: "Isiolo", label: "Isiolo" },
    { value: "Kajiado", label: "Kajiado" },
    { value: "Kakamega", label: "Kakamega" },
    { value: "Kericho", label: "Kericho" },
    { value: "Kiambu", label: "Kiambu" },
    { value: "Kilifi", label: "Kilifi" },
    { value: "Kirinyaga", label: "Kirinyaga" },
    { value: "Kisii", label: "Kisii" },
    { value: "Kisumu", label: "Kisumu" },
    { value: "Kitui", label: "Kitui" },
    { value: "Kwale", label: "Kwale" },
    { value: "Laikipia", label: "Laikipia" },
    { value: "Lamu", label: "Lamu" },
    { value: "Machakos", label: "Machakos" },
    { value: "Makueni", label: "Makueni" },
    { value: "Mandera", label: "Mandera" },
    { value: "Marsabit", label: "Marsabit" },
    { value: "Meru", label: "Meru" },
    { value: "Migori", label: "Migori" },
    { value: "Mombasa", label: "Mombasa" },
    { value: "Murang'a", label: "Murang'a" },
    { value: "Nairobi", label: "Nairobi" },
    { value: "Nakuru", label: "Nakuru" },
    { value: "Nandi", label: "Nandi" },
    { value: "Narok", label: "Narok" },
    { value: "Nyamira", label: "Nyamira" },
    { value: "Nyandarua", label: "Nyandarua" },
    { value: "Nyeri", label: "Nyeri" },
    { value: "Samburu", label: "Samburu" },
    { value: "Siaya", label: "Siaya" },
    { value: "Taita-Taveta", label: "Taita-Taveta" },
    { value: "Tana River", label: "Tana River" },
    { value: "Tharaka-Nithi", label: "Tharaka-Nithi" },
    { value: "Trans Nzoia", label: "Trans Nzoia" },
    { value: "Turkana", label: "Turkana" },
    { value: "Uasin Gishu", label: "Uasin Gishu" },
    { value: "Vihiga", label: "Vihiga" },
    { value: "Wajir", label: "Wajir" },
    { value: "West Pokot", label: "West Pokot" },
  ];

  const handleInputChange = (field, value) => {
    setEventForm((prev) => ({
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

  const handleCreate = async () => {
    try {
      setSaving(true);

      // Prepare form data for event creation
      const formData = new FormData();

      // Add all event form fields
      Object.keys(eventForm).forEach((key) => {
        if (eventForm[key] !== null && eventForm[key] !== undefined) {
          formData.append(key, eventForm[key]);
        }
      });

      // Add image files
      selectedFiles.forEach((file) => {
        formData.append("image", file);
      });

      const token = localStorage.getItem("token");
      const response = await fetch("/api/events", {
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
          text: "Event created successfully! It will be reviewed by admin before going live.",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate("/events");
      } else {
        throw new Error(result.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create event",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      eventForm.title.trim() &&
      eventForm.venue.trim() &&
      eventForm.event_date &&
      eventForm.start_time &&
      eventForm.category
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
              onClick={() => navigate("/events")}
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
            <Event sx={{ fontSize: 40 }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Create New Event
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
                  <Event sx={{ color: "#667eea" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Event Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
                    <TextField
                      fullWidth
                      label="Event Title"
                      value={eventForm.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Event sx={{ color: "#667eea" }} />
                          </InputAdornment>
                        ),
                      }}
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
                      value={eventForm.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your event in detail..."
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
                      label="Venue"
                      value={eventForm.venue}
                      onChange={(e) =>
                        handleInputChange("venue", e.target.value)
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn sx={{ color: "#667eea" }} />
                          </InputAdornment>
                        ),
                      }}
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
                      <InputLabel>County</InputLabel>
                      <Select
                        value={eventForm.county}
                        onChange={(e) =>
                          handleInputChange("county", e.target.value)
                        }
                        label="County"
                      >
                        {countyOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sub County"
                      value={eventForm.sub_county}
                      onChange={(e) =>
                        handleInputChange("sub_county", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Event Date"
                      type="date"
                      value={eventForm.event_date}
                      onChange={(e) =>
                        handleInputChange("event_date", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Schedule sx={{ color: "#667eea" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={eventForm.start_time}
                      onChange={(e) =>
                        handleInputChange("start_time", e.target.value)
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
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={eventForm.end_time}
                      onChange={(e) =>
                        handleInputChange("end_time", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
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
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={eventForm.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        label="Category"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Category sx={{ color: "#667eea" }} />
                            </InputAdornment>
                          ),
                        }}
                      >
                        {categoryOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Commission Rate (%)"
                      type="number"
                      value={eventForm.commission_rate}
                      onChange={(e) =>
                        handleInputChange(
                          "commission_rate",
                          parseFloat(e.target.value)
                        )
                      }
                      inputProps={{ min: 0, max: 50, step: 0.1 }}
                      helperText="Platform commission percentage (0-50%)"
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

            {/* Event Image Upload */}
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
                  <ImageIcon sx={{ color: "#fa709a" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Event Image
                  </Typography>
                </Box>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
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
                    Select Event Image
                  </Button>
                </label>

                {selectedFiles.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" mb={1}>
                      Selected Image:
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
                            {filePreviews[index] && (
                              <img
                                src={filePreviews[index]}
                                alt={file.name}
                                style={{
                                  width: "100%",
                                  height: "200px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginBottom: "4px",
                                }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
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
                    {saving ? "Creating..." : "Create Event"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/events")}
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

export default EventCreate;
