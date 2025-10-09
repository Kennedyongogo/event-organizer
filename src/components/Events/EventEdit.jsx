import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Add,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");

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

  // Helper to build URL for uploaded assets
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEvent(result.data);
        setEventForm({
          title: result.data.event_name || result.data.title || "",
          description: result.data.description || "",
          venue: result.data.venue || "",
          county: result.data.county || "",
          sub_county: result.data.sub_county || "",
          event_date: result.data.event_date
            ? result.data.event_date.split("T")[0]
            : "",
          start_time: result.data.start_time || "",
          end_time: result.data.end_time || "",
          category: result.data.category || "",
          commission_rate: result.data.commission_rate || 10.0,
          status: result.data.status || "pending",
        });
        setCurrentImage(result.data.image_url || result.data.image || "");
      } else {
        setError(result.message || "Failed to fetch event details");
      }
    } catch (err) {
      setError("Failed to fetch event details");
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEventForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      // Add all event form fields
      Object.keys(eventForm).forEach((key) => {
        if (eventForm[key] !== null && eventForm[key] !== undefined) {
          formData.append(key, eventForm[key]);
        }
      });

      // Add image file if selected
      if (selectedFile) {
        formData.append("event_image", selectedFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Event updated successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(`/events/${id}`);
      } else {
        throw new Error(result.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update event",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      eventForm.title.trim() !== "" &&
      eventForm.venue.trim() !== "" &&
      eventForm.event_date !== "" &&
      eventForm.start_time !== "" &&
      eventForm.category !== ""
    );
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
          onClick={() => navigate("/events")}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Event not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/events")}
        >
          Back to Events
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
                onClick={() => navigate(`/events/${id}`)}
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
                  Edit Event
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {event.event_name || event.title}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isFormValid() || saving}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:disabled": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ flexDirection: "column" }}>
            {/* Event Information */}
            <Grid item xs={12}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <EventIcon sx={{ color: "#667eea" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Event Information
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
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
                            <EventIcon sx={{ color: "#667eea" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
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
                    />
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
                            <LocationIcon sx={{ color: "#667eea" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
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
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
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
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={eventForm.category}
                            onChange={(e) =>
                              handleInputChange("category", e.target.value)
                            }
                            label="Category"
                            required
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
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Event Image */}
            <Grid item xs={12}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ImageIcon sx={{ color: "#fa709a" }} />
                    <Typography variant="h6" sx={{ color: "#333" }}>
                      Event Image
                    </Typography>
                  </Box>

                  {/* Current Image */}
                  {currentImage && !filePreview && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" mb={2}>
                        Current Image:
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <img
                          src={buildImageUrl(currentImage)}
                          alt="Current event"
                          style={{
                            width: "100%",
                            height: "300px",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* New Image Preview */}
                  {filePreview && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" mb={2}>
                        New Image:
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <IconButton
                          onClick={removeSelectedFile}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                            zIndex: 2,
                          }}
                          size="small"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <img
                          src={filePreview}
                          alt="New event"
                          style={{
                            width: "100%",
                            height: "300px",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* File Upload Button */}
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
                      {currentImage || filePreview
                        ? "Change Event Image"
                        : "Select Event Image"}
                    </Button>
                  </label>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default EventEdit;
