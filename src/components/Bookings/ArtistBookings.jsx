import React, { useCallback, useEffect, useState } from "react";
import {
  alpha,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Block as RejectIcon,
  CalendarMonth as BookingsIcon,
  CancelOutlined as CancelIcon,
  CheckCircleOutline as ConfirmIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  PageHeader,
  pageShellSx,
  swalDark,
  tabsSx,
  tickahub,
} from "../shared/tickahubPageStyles";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const statusColor = (status) => {
  if (status === "confirmed") return tickahub.cyan;
  if (status === "pending") return tickahub.gold;
  if (status === "rejected") return "#ff6b6b";
  if (status === "cancelled") return tickahub.textMuted;
  return tickahub.textMuted;
};

const formatDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";
  const [hours, minutes] = String(value).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const isOvernightBooking = (booking) =>
  String(booking?.end_time || "").slice(0, 8) <
  String(booking?.start_time || "").slice(0, 8);

const ArtistBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    cancelled: 0,
  });
  const selectedStatus = STATUS_TABS[activeTab]?.value || "all";

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Your session has expired. Please sign in again.");

      const query = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (selectedStatus !== "all") query.set("status", selectedStatus);

      const response = await fetch(`/api/artists/me/bookings?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load bookings");
      }
      setBookings(data.data || []);
      setTotalBookings(data.pagination?.total ?? data.count ?? 0);
      if (data.status_counts) setCounts(data.status_counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const changeStatus = async (booking, status) => {
    const isConfirm = status === "confirmed";
    const result = await Swal.fire({
      icon: isConfirm ? "question" : "warning",
      title: isConfirm
        ? "Confirm this booking?"
        : status === "rejected"
          ? "Reject this booking?"
          : "Cancel this booking?",
      text: isConfirm
        ? `Reserve ${formatDate(booking.booking_date)}, ${formatTime(
            booking.start_time
          )} – ${formatTime(booking.end_time)}${
            isOvernightBooking(booking) ? " next day" : ""
          } for ${booking.requester_name}.`
        : undefined,
      input: isConfirm ? undefined : "textarea",
      inputLabel: isConfirm ? undefined : "Message to requester (optional)",
      inputPlaceholder: isConfirm ? undefined : "Add a short reason or note",
      inputValue: booking.artist_notes || "",
      showCancelButton: true,
      confirmButtonText: isConfirm
        ? "Confirm booking"
        : status === "rejected"
          ? "Reject"
          : "Cancel booking",
      confirmButtonColor: isConfirm ? tickahub.cyan : "#ff6b6b",
      ...swalDark,
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingId(booking.id);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/artists/me/bookings/${booking.id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            artist_notes: typeof result.value === "string" ? result.value : undefined,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update booking");
      }

      if (bookings.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        await fetchBookings();
      }
      await Swal.fire({
        icon: "success",
        title: `Booking ${status}`,
        timer: 1600,
        showConfirmButton: false,
        ...swalDark,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Could not update booking",
        text: err.message,
        ...swalDark,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTabChange = (_, value) => {
    setActiveTab(value);
    setPage(0);
  };

  const handleRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const hideOnMobileSx = { display: { xs: "none", md: "table-cell" } };

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={BookingsIcon}
        title="Bookings"
        subtitle="Review and respond to artist booking requests"
        hideSubtitleOnMobile
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
        <Box
          sx={{
            px: { xs: 1.5, md: 2 },
            pt: 1.5,
            borderBottom: `1px solid ${tickahub.borderSubtle}`,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            visibleScrollbar
            sx={{
              ...tabsSx,
              maxWidth: "100%",
              touchAction: "pan-x",
              "& .MuiTabs-scroller": {
                overflowX: "auto !important",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "thin",
                scrollbarColor: `${alpha(tickahub.cyan, 0.4)} transparent`,
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: alpha(tickahub.cyan, 0.4),
                  borderRadius: 999,
                },
              },
              "& .MuiTabs-scrollButtons": {
                display: "flex",
                color: tickahub.cyan,
                width: { xs: 28, md: 40 },
                "&.Mui-disabled": { opacity: 0.2 },
              },
              "& .MuiTab-root": {
                minWidth: "max-content",
                px: { xs: 1.25, md: 2 },
              },
            }}
          >
            {STATUS_TABS.map((tab, index) => (
              <Tab
                key={tab.value}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <span>{tab.label}</span>
                    <Chip
                      label={counts[tab.value]}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor:
                          activeTab === index
                            ? alpha(tickahub.cyan, 0.2)
                            : alpha("#fff", 0.06),
                        color:
                          activeTab === index ? tickahub.cyan : tickahub.textMuted,
                      }}
                    />
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        {error && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: alpha("#ff6b6b", 0.08),
              borderBottom: `1px solid ${alpha("#ff6b6b", 0.2)}`,
            }}
          >
            <Typography sx={{ color: "#ff8a8a", fontSize: "0.85rem" }}>
              {error}
            </Typography>
          </Box>
        )}

        <TableContainer sx={{ overflowX: { xs: "hidden", md: "auto" } }}>
          <Table
            size="small"
            sx={{
              minWidth: { xs: 0, md: 900 },
              tableLayout: { xs: "fixed", md: "auto" },
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: { xs: "12%", md: 48 } }}>No</TableCell>
                <TableCell sx={{ width: { xs: "52%", md: "auto" } }}>
                  Requester
                </TableCell>
                <TableCell sx={hideOnMobileSx}>
                  Date & time
                </TableCell>
                <TableCell sx={hideOnMobileSx}>Contact</TableCell>
                <TableCell sx={hideOnMobileSx}>Venue / notes</TableCell>
                <TableCell sx={hideOnMobileSx}>
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ width: { xs: "36%", md: "auto" } }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={28} sx={{ color: tickahub.cyan }} />
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <BookingsIcon
                      sx={{ color: alpha("#fff", 0.18), fontSize: 44, mb: 1 }}
                    />
                    <Typography sx={{ color: tickahub.textMuted }}>
                      {selectedStatus === "all"
                        ? "No booking requests yet"
                        : `No ${selectedStatus} bookings`}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking, index) => {
                  const busy = updatingId === booking.id;
                  const color = statusColor(booking.status);
                  return (
                    <TableRow key={booking.id} hover>
                      <TableCell
                        sx={{
                          color: tickahub.textMuted,
                          fontSize: { xs: "0.68rem", md: "0.82rem" },
                        }}
                      >
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: { xs: "0.78rem", md: "0.88rem" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {booking.requester_name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={hideOnMobileSx}>
                        <Typography
                          sx={{
                            color: "#fff",
                            fontSize: { xs: "0.72rem", md: "0.85rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(booking.booking_date)}
                        </Typography>
                        <Typography
                          sx={{
                            color: tickahub.textMuted,
                            fontSize: { xs: "0.66rem", md: "0.76rem" },
                            mt: 0.35,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatTime(booking.start_time)} –{" "}
                          {formatTime(booking.end_time)}
                          {isOvernightBooking(booking) ? " · next day" : ""}
                        </Typography>
                      </TableCell>
                      <TableCell sx={hideOnMobileSx}>
                        <Typography sx={{ color: "#fff", fontSize: "0.82rem" }}>
                          {booking.requester_email}
                        </Typography>
                        <Typography
                          sx={{ color: tickahub.textMuted, fontSize: "0.76rem" }}
                        >
                          {booking.requester_phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={hideOnMobileSx}>
                        <Typography sx={{ color: "#fff", fontSize: "0.82rem" }}>
                          {booking.venue || "—"}
                        </Typography>
                        {(booking.notes || booking.artist_notes) && (
                          <Tooltip
                            title={[
                              booking.notes,
                              booking.artist_notes
                                ? `Artist: ${booking.artist_notes}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          >
                            <Typography
                              sx={{
                                color: tickahub.textMuted,
                                fontSize: "0.74rem",
                                maxWidth: 220,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {booking.notes || booking.artist_notes}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell sx={hideOnMobileSx}>
                        <Chip
                          label={booking.status}
                          size="small"
                          sx={{
                            height: { xs: 22, md: 26 },
                            color,
                            bgcolor: alpha(color, 0.12),
                            border: `1px solid ${alpha(color, 0.32)}`,
                            fontWeight: 700,
                            fontSize: { xs: "0.62rem", md: "0.72rem" },
                            textTransform: "capitalize",
                            maxWidth: "100%",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.75}
                          justifyContent="flex-end"
                        >
                          {booking.status === "pending" && (
                            <>
                              <Tooltip title="Confirm booking">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={busy}
                                    onClick={() =>
                                      changeStatus(booking, "confirmed")
                                    }
                                    sx={{
                                      color: tickahub.cyan,
                                      bgcolor: alpha(tickahub.cyan, 0.12),
                                      "&:hover": {
                                        bgcolor: alpha(tickahub.cyan, 0.22),
                                      },
                                    }}
                                  >
                                    <ConfirmIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Reject booking">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={busy}
                                    onClick={() =>
                                      changeStatus(booking, "rejected")
                                    }
                                    sx={{
                                      color: "#ff6b6b",
                                      bgcolor: alpha("#ff6b6b", 0.12),
                                      "&:hover": {
                                        bgcolor: alpha("#ff6b6b", 0.22),
                                      },
                                    }}
                                  >
                                    <RejectIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <Tooltip title="Cancel booking">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={busy}
                                  onClick={() =>
                                    changeStatus(booking, "cancelled")
                                  }
                                  sx={{
                                    color: "#ff8a8a",
                                    bgcolor: alpha("#ff6b6b", 0.1),
                                    "&:hover": {
                                      bgcolor: alpha("#ff6b6b", 0.2),
                                    },
                                  }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {busy && (
                            <CircularProgress
                              size={20}
                              sx={{ color: tickahub.cyan, alignSelf: "center" }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalBookings}
          page={page}
          onPageChange={(_, value) => setPage(value)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            color: tickahub.textMuted,
            borderTop: `1px solid ${tickahub.borderSubtle}`,
          }}
        />
      </Paper>
    </Box>
  );
};

export default ArtistBookings;
