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
  ConfirmationNumber as TicketIcon,
  Save,
  ArrowBack,
  AttachMoney as MoneyIcon,
  Inventory as QuantityIcon,
  Label as NameIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const TicketCreate = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams(); // Get event ID from URL params
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    event_id: eventId,
    name: "",
    price: "",
    total_quantity: "",
  });

  // Fetch event details on component mount
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEvent(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleInputChange = (field, value) => {
    setTicketForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch("/api/ticket-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: ticketForm.event_id,
          name: ticketForm.name,
          price: parseFloat(ticketForm.price),
          total_quantity: parseInt(ticketForm.total_quantity),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Ticket type created successfully!",
          icon: "success",
          confirmButtonColor: "#667eea",
        });
        navigate(`/events/${eventId}`);
      } else {
        throw new Error(result.message || "Failed to create ticket type");
      }
    } catch (error) {
      console.error("Error creating ticket type:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to create ticket type",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      ticketForm.name.trim() &&
      ticketForm.price &&
      ticketForm.total_quantity &&
      parseFloat(ticketForm.price) > 0 &&
      parseInt(ticketForm.total_quantity) > 0
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
              onClick={() => navigate(`/events/${eventId}`)}
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
            <TicketIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Create New Ticket Type
              </Typography>
              {event && (
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  for {event.event_name}
                </Typography>
              )}
            </Box>
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
          {/* Ticket Information */}
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
                  <TicketIcon sx={{ color: "#667eea" }} />
                  <Typography variant="h5" sx={{ color: "#333" }}>
                    Ticket Information
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ flexDirection: "column" }}>
                  <Grid item xs={12} sx={{ width: "100%", maxWidth: "100%" }}>
                    <TextField
                      fullWidth
                      label="Ticket Name"
                      value={ticketForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                      placeholder="e.g., VIP, General, Early Bird"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NameIcon sx={{ color: "#667eea" }} />
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
                    <TextField
                      fullWidth
                      label="Price (KES)"
                      type="number"
                      value={ticketForm.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      required
                      inputProps={{ min: 0, step: 0.01 }}
                      placeholder="0.00"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MoneyIcon sx={{ color: "#667eea" }} />
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
                    <TextField
                      fullWidth
                      label="Total Quantity"
                      type="number"
                      value={ticketForm.total_quantity}
                      onChange={(e) =>
                        handleInputChange("total_quantity", e.target.value)
                      }
                      required
                      inputProps={{ min: 1 }}
                      placeholder="100"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <QuantityIcon sx={{ color: "#667eea" }} />
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
                </Grid>
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
                    {saving ? "Creating..." : "Create Ticket Type"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate(`/events/${eventId}`)}
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

export default TicketCreate;
