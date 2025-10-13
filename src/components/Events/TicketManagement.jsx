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
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const TicketManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetchEventAndTickets();
  }, [id]);

  const fetchEventAndTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      // Fetch event details
      const eventResponse = await fetch(`/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (eventResponse.ok) {
        const eventResult = await eventResponse.json();
        if (eventResult.success) {
          setEvent(eventResult.data);
        }
      }

      // Fetch tickets for this event
      const ticketsResponse = await fetch(`/api/ticket-types/event/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (ticketsResponse.ok) {
        const ticketsResult = await ticketsResponse.json();
        if (ticketsResult.success) {
          setTickets(ticketsResult.data);
        } else {
          setError(ticketsResult.message || "Failed to fetch tickets");
        }
      } else {
        throw new Error(
          `HTTP ${ticketsResponse.status}: ${ticketsResponse.statusText}`
        );
      }
    } catch (err) {
      setError(`Failed to fetch tickets: ${err.message}`);
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket.id);
    setEditForm({
      name: ticket.name,
      price: ticket.price,
      total_quantity: ticket.total_quantity,
    });
  };

  const handleCancelEdit = () => {
    setEditingTicket(null);
    setEditForm({});
  };

  const handleSaveEdit = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/ticket-types/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Success!",
          text: "Ticket updated successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Refresh tickets
        await fetchEventAndTickets();
        setEditingTicket(null);
        setEditForm({});
      } else {
        throw new Error(result.message || "Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update ticket",
        icon: "error",
        confirmButtonColor: "#667eea",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isEditFormValid = () => {
    return (
      editForm.name?.trim() !== "" &&
      editForm.price !== undefined &&
      editForm.price > 0 &&
      editForm.total_quantity !== undefined &&
      editForm.total_quantity > 0
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
          onClick={() => navigate(`/events/${id}`)}
        >
          Back to Event
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
                  Ticket Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {event?.event_name || "Manage Event Tickets"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {tickets.length === 0 ? (
            <Card
              sx={{
                backgroundColor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e0e0e0",
                textAlign: "center",
                p: 4,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "#666" }}>
                No tickets found for this event
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "#999" }}>
                Create your first ticket type to start selling tickets
              </Typography>
            </Card>
          ) : (
            <Stack spacing={3}>
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    border: "none",
                    width: "100%",
                    maxWidth: "none",
                    "& .MuiCardContent-root": {
                      padding: 0,
                      "&:last-child": {
                        paddingBottom: 0,
                      },
                    },
                  }}
                >
                  <CardContent>
                    {editingTicket === ticket.id ? (
                      // Edit Mode
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background:
                            "linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)",
                          border: "2px solid #ffc107",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background:
                              "linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 3,
                            p: 2,
                            backgroundColor: "rgba(255, 193, 7, 0.1)",
                            borderRadius: 2,
                            border: "1px solid rgba(255, 193, 7, 0.3)",
                          }}
                        >
                          <EditIcon sx={{ color: "#ffc107", fontSize: 24 }} />
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#856404",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Editing: {ticket.name}
                          </Typography>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#495057",
                                  fontWeight: 600,
                                  mb: 1,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Ticket Name
                              </Typography>
                              <TextField
                                fullWidth
                                placeholder="Enter ticket name"
                                value={editForm.name || ""}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor: "#ffffff",
                                    "& fieldset": {
                                      borderColor: "#dee2e6",
                                    },
                                    "&:hover fieldset": {
                                      borderColor: "#667eea",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#667eea",
                                      borderWidth: 2,
                                    },
                                  },
                                  "& .MuiInputBase-input": {
                                    padding: "12px 16px",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                  },
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#495057",
                                  fontWeight: 600,
                                  mb: 1,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Price (KES)
                              </Typography>
                              <TextField
                                fullWidth
                                type="number"
                                placeholder="0.00"
                                value={editForm.price || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "price",
                                    parseFloat(e.target.value)
                                  )
                                }
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor: "#ffffff",
                                    "& fieldset": {
                                      borderColor: "#dee2e6",
                                    },
                                    "&:hover fieldset": {
                                      borderColor: "#667eea",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#667eea",
                                      borderWidth: 2,
                                    },
                                  },
                                  "& .MuiInputBase-input": {
                                    padding: "12px 16px",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                  },
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#495057",
                                  fontWeight: 600,
                                  mb: 1,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Total Quantity
                              </Typography>
                              <TextField
                                fullWidth
                                type="number"
                                placeholder="0"
                                value={editForm.total_quantity || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "total_quantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                inputProps={{ min: 1 }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor: "#ffffff",
                                    "& fieldset": {
                                      borderColor: "#dee2e6",
                                    },
                                    "&:hover fieldset": {
                                      borderColor: "#667eea",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#667eea",
                                      borderWidth: 2,
                                    },
                                  },
                                  "& .MuiInputBase-input": {
                                    padding: "12px 16px",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                  },
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                                mt: 2,
                                pt: 3,
                                borderTop: "1px solid rgba(255, 193, 7, 0.3)",
                              }}
                            >
                              <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={handleCancelEdit}
                                sx={{
                                  borderColor: "#6c757d",
                                  color: "#6c757d",
                                  padding: "10px 24px",
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontWeight: 600,
                                  "&:hover": {
                                    borderColor: "#495057",
                                    backgroundColor: "rgba(108, 117, 125, 0.1)",
                                  },
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={() => handleSaveEdit(ticket.id)}
                                disabled={!isEditFormValid()}
                                sx={{
                                  backgroundColor: "#28a745",
                                  padding: "10px 24px",
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontWeight: 600,
                                  boxShadow:
                                    "0 4px 12px rgba(40, 167, 69, 0.3)",
                                  "&:hover": {
                                    backgroundColor: "#218838",
                                    boxShadow:
                                      "0 6px 16px rgba(40, 167, 69, 0.4)",
                                    transform: "translateY(-1px)",
                                  },
                                  "&:disabled": {
                                    backgroundColor: "#6c757d",
                                    boxShadow: "none",
                                  },
                                  transition: "all 0.3s ease",
                                }}
                              >
                                Save Changes
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      // View Mode
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 3,
                          borderRadius: 3,
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                          border: "1px solid #e9ecef",
                          transition: "all 0.3s ease",
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-3px)",
                            borderColor: "#667eea",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background:
                              "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          },
                        }}
                      >
                        {/* Left Section - Ticket Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: "#2c3e50",
                              mb: 1,
                              fontSize: { xs: "1.1rem", md: "1.4rem" },
                              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            {ticket.name}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 800,
                              color: "#667eea",
                              fontSize: { xs: "1.8rem", md: "2.2rem" },
                              textShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            KES {parseFloat(ticket.price)?.toLocaleString()}
                          </Typography>
                        </Box>

                        {/* Center Section - Statistics */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: { xs: 3, md: 6 },
                            mx: { xs: 2, md: 4 },
                            flex: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Box textAlign="center" sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                backgroundColor: "rgba(73, 80, 87, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="h4"
                                sx={{
                                  fontWeight: 800,
                                  color: "#495057",
                                  fontSize: { xs: "1.2rem", md: "1.4rem" },
                                }}
                              >
                                {ticket.total_quantity}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#6c757d",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                fontSize: "0.7rem",
                              }}
                            >
                              Total
                            </Typography>
                          </Box>
                          <Box textAlign="center" sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                backgroundColor: "rgba(40, 167, 69, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="h4"
                                sx={{
                                  fontWeight: 800,
                                  color: "#28a745",
                                  fontSize: { xs: "1.2rem", md: "1.4rem" },
                                }}
                              >
                                {ticket.remaining_quantity}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#6c757d",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                fontSize: "0.7rem",
                              }}
                            >
                              Available
                            </Typography>
                          </Box>
                          <Box textAlign="center" sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                backgroundColor: "rgba(220, 53, 69, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="h4"
                                sx={{
                                  fontWeight: 800,
                                  color: "#dc3545",
                                  fontSize: { xs: "1.2rem", md: "1.4rem" },
                                }}
                              >
                                {(ticket.total_quantity || 0) -
                                  (ticket.remaining_quantity || 0)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#6c757d",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                fontSize: "0.7rem",
                              }}
                            >
                              Sold
                            </Typography>
                          </Box>
                        </Box>

                        {/* Right Section - Status & Actions */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 2,
                            minWidth: "fit-content",
                          }}
                        >
                          <Chip
                            label={
                              ticket.remaining_quantity === 0
                                ? "Sold Out"
                                : ticket.remaining_quantity <
                                  ticket.total_quantity * 0.2
                                ? "Almost Sold Out"
                                : "Available"
                            }
                            sx={{
                              backgroundColor:
                                ticket.remaining_quantity === 0
                                  ? "#dc3545"
                                  : ticket.remaining_quantity <
                                    ticket.total_quantity * 0.2
                                  ? "#ffc107"
                                  : "#28a745",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              height: "32px",
                              borderRadius: "16px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                              "& .MuiChip-label": {
                                px: 3,
                                py: 0.5,
                              },
                            }}
                          />
                          <Tooltip title="Edit Ticket" arrow placement="top">
                            <IconButton
                              onClick={() => handleEditTicket(ticket)}
                              sx={{
                                color: "#667eea",
                                backgroundColor: "rgba(102, 126, 234, 0.1)",
                                border: "2px solid rgba(102, 126, 234, 0.2)",
                                "&:hover": {
                                  backgroundColor: "rgba(102, 126, 234, 0.2)",
                                  transform: "scale(1.1)",
                                  boxShadow:
                                    "0 4px 12px rgba(102, 126, 234, 0.3)",
                                },
                                transition: "all 0.3s ease",
                                width: 44,
                                height: 44,
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default TicketManagement;
