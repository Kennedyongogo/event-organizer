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
  Divider,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  ConfirmationNumber as TicketIcon,
} from "@mui/icons-material";

const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);

  // Helper to build URL for uploaded assets using Vite proxy
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Use relative URLs - Vite proxy will handle routing to backend
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  useEffect(() => {
    fetchEvent();
    fetchTicketTypes();
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

  const fetchTicketTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/ticket-types/event/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setTicketTypes(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching ticket types:", err);
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
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "cancelled":
        return "default";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Music":
        return "primary";
      case "Sports":
        return "secondary";
      case "Conference":
        return "success";
      case "Workshop":
        return "warning";
      case "Festival":
        return "info";
      default:
        return "default";
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
                onClick={() => navigate("/events")}
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
                  {event.event_name || event.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Event Details
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/events/${id}/edit`)}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                Edit Event
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Event Image */}
            {event.image && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={buildImageUrl(event.image_url || event.image)}
                    alt={event.event_name || event.title}
                    style={{
                      width: "100%",
                      height: "400px",
                      objectFit: "cover",
                    }}
                  />
                </Card>
              </Grid>
            )}

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
                    <EventIcon sx={{ color: "#667eea" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Event Information
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EventIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Status
                        </Typography>
                        <Chip
                          label={event.status?.toUpperCase()}
                          color={getStatusColor(event.status)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CategoryIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Category
                        </Typography>
                        <Chip
                          label={event.category}
                          color={getCategoryColor(event.category)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Venue
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {event.venue || "Not specified"}
                        </Typography>
                        {event.county && (
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {event.county}{" "}
                            {event.sub_county && `- ${event.sub_county}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Event Date
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatDate(event.event_date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimeIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Time
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatTime(event.start_time)} -{" "}
                          {formatTime(event.end_time)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Commission Rate
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {event.commission_rate || 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Description */}
            {event.description && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <DescriptionIcon sx={{ color: "#4facfe" }} />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Description
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: "#333" }}>
                      {event.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Ticket Types */}
            {ticketTypes.length > 0 && (
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
                      <TicketIcon sx={{ color: "#ff6b6b" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Ticket Types ({ticketTypes.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {ticketTypes.map((ticket, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card
                            sx={{
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "white",
                              borderRadius: 3,
                              p: 2,
                              height: "100%",
                              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-5px)",
                                boxShadow:
                                  "0 12px 35px rgba(102, 126, 234, 0.4)",
                              },
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, mb: 2 }}
                            >
                              {ticket.name}
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 800, mb: 2 }}
                            >
                              KES {ticket.price?.toLocaleString()}
                            </Typography>
                            <Divider
                              sx={{
                                my: 2,
                                backgroundColor: "rgba(255,255,255,0.3)",
                              }}
                            />
                            <Stack spacing={1}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="body2">
                                  Available:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {ticket.quantity_available || 0}
                                </Typography>
                              </Box>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="body2">Sold:</Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {ticket.quantity_sold || 0}
                                </Typography>
                              </Box>
                              {ticket.description && (
                                <Typography
                                  variant="caption"
                                  sx={{ mt: 1, opacity: 0.9 }}
                                >
                                  {ticket.description}
                                </Typography>
                              )}
                            </Stack>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default EventView;
