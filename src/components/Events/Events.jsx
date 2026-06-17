import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Tabs,
  Tab,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  tickahub,
  swalDark,
  pageShellSx,
  primaryButtonSx,
  tabsSx,
  eventStatusColor,
  PageHeader,
} from "../shared/tickahubPageStyles";

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  });

  const statusTabs = [
    { label: "All", value: "all", count: tabCounts.all },
    { label: "Pending", value: "pending", count: tabCounts.pending },
    { label: "Approved", value: "approved", count: tabCounts.approved },
    { label: "Rejected", value: "rejected", count: tabCounts.rejected },
    { label: "Cancelled", value: "cancelled", count: tabCounts.cancelled },
    { label: "Completed", value: "completed", count: tabCounts.completed },
  ];

  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage, activeTab]);

  useEffect(() => {
    fetchAllEventsForCounts();
  }, []);

  const fetchEvents = async () => {
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

      const response = await fetch(`/api/events?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setEvents(data.data || []);
        setTotalEvents(data.count || 0);
      } else {
        setError(data.message || "Failed to fetch events");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const updateTabCounts = (eventsData) => {
    const counts = { all: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, completed: 0 };
    eventsData.forEach((event) => {
      counts.all++;
      if (Object.prototype.hasOwnProperty.call(counts, event.status)) counts[event.status]++;
    });
    setTabCounts(counts);
  };

  const fetchAllEventsForCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("/api/events?limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) updateTabCounts(data.data || []);
    } catch (err) {
      console.error("Error fetching event counts:", err);
    }
  };

  const handleDeleteEvent = async (event) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this event?",
      text: `"${event.event_name || event.title}" will be permanently removed.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ff6b6b",
      ...swalDark,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete event");
      fetchEvents();
      fetchAllEventsForCounts();
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false, ...swalDark });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.message, ...swalDark });
    } finally {
      setLoading(false);
    }
  };

  const actionBtnSx = (color) => ({
    color,
    bgcolor: alpha(color, 0.12),
    borderRadius: 2,
    "&:hover": { bgcolor: alpha(color, 0.22) },
  });

  const hideOnMobileSx = { display: { xs: "none", md: "table-cell" } };

  if (error && !events.length) {
    return (
      <Box sx={pageShellSx}>
        <Typography sx={{ color: "#ff6b6b" }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={EventIcon}
        title="My events"
        subtitle="Create and manage your events"
        inlineActionOnMobile
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ display: { xs: "none", sm: "inline-flex" } }} />}
            onClick={() => navigate("/events/create")}
            sx={{
              ...primaryButtonSx,
              flexShrink: 0,
              whiteSpace: "nowrap",
              fontSize: { xs: "0.75rem", md: "0.875rem" },
              px: { xs: 1.5, md: 2.5 },
              minWidth: "auto",
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Create event
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Create
            </Box>
          </Button>
        }
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          bgcolor: tickahub.surface,
          border: `1px solid ${tickahub.borderSubtle}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: 1.5, borderBottom: `1px solid ${tickahub.borderSubtle}` }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={tabsSx}>
            {statusTabs.map((tab, index) => (
              <Tab
                key={tab.value}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <span>{tab.label}</span>
                    <Chip
                      label={tab.count}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: activeTab === index ? `${tickahub.cyan}33` : alpha("#fff", 0.06),
                        color: activeTab === index ? tickahub.cyan : tickahub.textMuted,
                      }}
                    />
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        <TableContainer sx={{ overflowX: { xs: "hidden", md: "auto" } }}>
          <Table sx={{ minWidth: { xs: 0, md: 720 }, tableLayout: { xs: "fixed", md: "auto" }, width: "100%" }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: tickahub.navyLight,
                  "& .MuiTableCell-head": {
                    color: tickahub.textMuted,
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: `1px solid ${tickahub.borderSubtle}`,
                    py: 1.25,
                  },
                }}
              >
                <TableCell sx={hideOnMobileSx}>#</TableCell>
                <TableCell>Event</TableCell>
                <TableCell sx={hideOnMobileSx}>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={hideOnMobileSx}>Commission</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: tickahub.cyan }} />
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: tickahub.textMuted }}>No events found</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => navigate("/events/create")} sx={{ mt: 1, color: tickahub.cyan, textTransform: "none" }}>
                      Create your first event
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event, idx) => (
                  <TableRow
                    key={event.id}
                    hover
                    onClick={() => navigate(`/events/${event.id}`)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: alpha(tickahub.cyan, 0.04) },
                      "& .MuiTableCell-root": {
                        color: "#fff",
                        borderBottom: `1px solid ${tickahub.borderSubtle}`,
                        fontSize: "0.875rem",
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell sx={{ ...hideOnMobileSx, color: `${tickahub.cyan} !important`, fontWeight: 700 }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell sx={{ maxWidth: { xs: 0, md: "none" }, overflow: "hidden" }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: { xs: "nowrap", md: "normal" },
                        }}
                      >
                        {event.event_name || event.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={hideOnMobileSx}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarIcon sx={{ fontSize: 16, color: tickahub.cyan }} />
                        <Typography variant="body2" sx={{ color: tickahub.textMuted }}>
                          {formatDate(event.event_date)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        size="small"
                        sx={{
                          bgcolor: `${eventStatusColor(event.status)}22`,
                          color: eventStatusColor(event.status),
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={hideOnMobileSx}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <MoneyIcon sx={{ fontSize: 16, color: tickahub.cyan }} />
                        <Typography variant="body2" sx={{ color: tickahub.textMuted, fontWeight: 600 }}>
                          {event.commission_rate || 0}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ width: { xs: "auto", md: "auto" }, whiteSpace: "nowrap", pl: { xs: 0.5, md: 2 } }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => navigate(`/events/${event.id}`)} sx={actionBtnSx(tickahub.cyan)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/events/${event.id}/edit`)} sx={actionBtnSx(tickahub.gold)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteEvent(event)} sx={actionBtnSx("#ff6b6b")}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalEvents}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            color: tickahub.textMuted,
            borderTop: `1px solid ${tickahub.borderSubtle}`,
            "& .MuiTablePagination-selectIcon": { color: tickahub.textMuted },
            "& .MuiTablePagination-actions .MuiIconButton-root": { color: tickahub.cyan },
          }}
        />
      </Paper>
    </Box>
  );
};

export default Events;
