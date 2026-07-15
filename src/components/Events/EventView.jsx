import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  IconButton,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import {
  tickahub,
  pageShellSx,
  secondaryButtonSx,
  primaryButtonSx,
  SectionCard,
  SectionLabel,
  ViewField,
  PageHeader,
  eventStatusColor,
} from "../shared/tickahubPageStyles";
import VenueMapView from "./VenueMapView";
import EventLineupView from "./EventLineupView";
import { buildAssetUrl } from "../../utils/assetUrl";
import { isOrganizerEventLocked } from "./eventPermissions";

const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildImageUrl = buildAssetUrl;

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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) setEvent(result.data);
      else setError(result.message || "Failed to fetch event details");
    } catch (err) {
      setError(`Failed to fetch event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOvernight =
    event?.start_time &&
    event?.end_time &&
    String(event.end_time).slice(0, 8) <
      String(event.start_time).slice(0, 8);

  if (loading) {
    return (
      <Box sx={{ ...pageShellSx, alignItems: "center", justifyContent: "center", minHeight: 280 }}>
        <CircularProgress sx={{ color: tickahub.cyan }} />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={pageShellSx}>
        <Typography sx={{ color: "#ff6b6b", mb: 2 }}>{error || "Event not found"}</Typography>
        <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/events")} sx={secondaryButtonSx}>
          Back to events
        </Button>
      </Box>
    );
  }

  const imageSrc = buildImageUrl(event.image_url || event.image);
  const ticketTiers = Array.isArray(event.ticket_prices) ? event.ticket_prices : [];
  const merchandise = Array.isArray(event.merchandise) ? event.merchandise : [];
  const eventLocked = isOrganizerEventLocked(event);

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={EventIcon}
        title={event.event_name || event.title}
        subtitle={event.category || "Event details"}
        inlineActionOnMobile
        hideSubtitleOnMobile
        action={
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="nowrap" sx={{ flexShrink: 0 }}>
            <Chip
              label={event.status}
              size="small"
              sx={{
                bgcolor: `${eventStatusColor(event.status)}22`,
                color: eventStatusColor(event.status),
                fontWeight: 700,
                textTransform: "capitalize",
                height: 24,
                "& .MuiChip-label": { px: 1, fontSize: "0.68rem" },
              }}
            />
            {!eventLocked && (
              <IconButton
                size="small"
                onClick={() => navigate(`/events/${id}/edit`)}
                aria-label="Edit event"
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  color: tickahub.gold,
                  bgcolor: alpha(tickahub.gold, 0.12),
                  borderRadius: 2,
                  "&:hover": { bgcolor: alpha(tickahub.gold, 0.22) },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => navigate("/events")}
              aria-label="Back to events"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: tickahub.textMuted,
                bgcolor: alpha("#fff", 0.06),
                borderRadius: 2,
                border: `1px solid ${tickahub.borderSubtle}`,
                "&:hover": { bgcolor: alpha("#fff", 0.1) },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/events")}
              sx={{ ...secondaryButtonSx, display: { xs: "none", md: "inline-flex" } }}
            >
              Back
            </Button>
            {!eventLocked && (
              <Button
                variant="contained"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/events/${id}/edit`)}
                sx={{ ...primaryButtonSx, display: { xs: "none", md: "inline-flex" } }}
              >
                Edit
              </Button>
            )}
          </Stack>
        }
      />

      <SectionCard
        sx={{ width: "100%", flex: "none" }}
        headerBg={`linear-gradient(135deg, ${alpha(tickahub.cyan, 0.14)}, transparent)`}
        icon={EventIcon}
        iconColor={tickahub.cyan}
        title={event.event_name || event.title}
        subtitle={event.category || "Event details"}
      >
        <Stack spacing={2.5} sx={{ width: "100%" }}>
          {imageSrc && (
            <Box component="img" src={imageSrc} alt={event.event_name} sx={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 2, border: `1px solid ${tickahub.borderSubtle}` }} />
          )}

          <SectionLabel>Overview</SectionLabel>
          <ViewField label="description" value={event.description} multiline />
          <ViewField label="category" value={event.category} />
          <ViewField label="status" value={event.status} />
          <ViewField label="commission_rate" value={`${event.commission_rate || 0}%`} />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Schedule</SectionLabel>
          <ViewField label="event_date" value={formatDate(event.event_date)} />
          <ViewField label="start_time" value={formatTime(event.start_time)} />
          <ViewField
            label={isOvernight ? "end_time (next day)" : "end_time"}
            value={`${formatTime(event.end_time)}${isOvernight ? " · next day" : ""}`}
          />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel>Venue</SectionLabel>
          <ViewField label="venue" value={event.venue} />
          <VenueMapView
            latitude={event.venue_latitude}
            longitude={event.venue_longitude}
            venue={event.venue}
          />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Lineup</SectionLabel>
          <EventLineupView lineup={event.lineup} />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Tickets</SectionLabel>
          <ViewField label="tickets_available" value={event.tickets_available ?? "—"} />
          {ticketTiers.length > 0 ? (
            ticketTiers.map((tier, i) => (
              <Box key={i} sx={{ width: "100%", p: 1.5, borderRadius: 2, bgcolor: tickahub.navy, border: `1px solid ${tickahub.borderSubtle}` }}>
                <Typography sx={{ color: tickahub.gold, fontWeight: 700 }}>{tier.category}</Typography>
                <Typography sx={{ color: "#fff", fontWeight: 800, mt: 0.5 }}>KES {parseFloat(tier.price)?.toLocaleString()}</Typography>
                {tier.quantity != null && (
                  <Typography variant="caption" sx={{ color: tickahub.textMuted }}>Qty: {tier.quantity}</Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>No pricing tiers set</Typography>
          )}

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Merchandise</SectionLabel>
          {merchandise.length > 0 ? (
            merchandise.map((item, i) => {
              const merchImageSrc = buildImageUrl(item.image_url);
              const pickupType =
                item.pickup_type === "both"
                  ? "both"
                  : item.pickup_type === "custom"
                    ? "custom"
                    : "event";
              const eventPickupLabel = [event.venue, item.pickup_point]
                .filter(Boolean)
                .join(" — ");
              const customPickupLabel = [item.pickup_address, item.pickup_point]
                .filter(Boolean)
                .join(" — ");

              return (
                <Box
                  key={item.id || `merch-${i}`}
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: tickahub.navy,
                    border: `1px solid ${tickahub.borderSubtle}`,
                  }}
                >
                  {merchImageSrc && (
                    <Box
                      component="img"
                      src={merchImageSrc}
                      alt={item.name || "Merchandise"}
                      sx={{
                        width: "100%",
                        maxHeight: 280,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}
                  <Stack spacing={0.75} sx={{ p: 1.5 }}>
                    <Typography sx={{ color: tickahub.gold, fontWeight: 700 }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ color: "#fff", fontWeight: 800 }}>
                      KES {parseFloat(item.price)?.toLocaleString()}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        pickupType === "both"
                          ? "Pickup: either location"
                          : pickupType === "custom"
                            ? "Pickup: other location"
                            : "Pickup: at event"
                      }
                      sx={{
                        alignSelf: "flex-start",
                        height: 22,
                        bgcolor: alpha(tickahub.cyan, 0.12),
                        color: tickahub.cyan,
                        fontWeight: 700,
                        fontSize: "0.68rem",
                      }}
                    />
                    {pickupType === "both" ? (
                      <>
                        {eventPickupLabel && (
                          <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
                            At event: {eventPickupLabel}
                          </Typography>
                        )}
                        {customPickupLabel && (
                          <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
                            Other location: {item.pickup_address}
                          </Typography>
                        )}
                      </>
                    ) : (
                      (pickupType === "custom" ? customPickupLabel : eventPickupLabel) && (
                        <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
                          {pickupType === "custom" ? "Location" : "At event"}:{" "}
                          {pickupType === "custom" ? customPickupLabel : eventPickupLabel}
                        </Typography>
                      )
                    )}
                    {(pickupType === "custom" || pickupType === "both") && (
                      <VenueMapView
                        latitude={item.pickup_latitude}
                        longitude={item.pickup_longitude}
                        venue={item.pickup_address || item.pickup_point}
                        height={220}
                      />
                    )}
                    {item.quantity_available != null && (
                      <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
                        Qty available: {item.quantity_available}
                      </Typography>
                    )}
                    {item.commission_rate != null && item.commission_rate !== "" && (
                      <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
                        Commission: {item.commission_rate}%
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })
          ) : (
            <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>
              No merchandise added
            </Typography>
          )}

          {event.organizer && (
            <>
              <Divider sx={{ borderColor: tickahub.borderSubtle }} />
              <SectionLabel accent={tickahub.gold}>Organizer</SectionLabel>
              <ViewField label="organization" value={event.organizer.organization_name} />
              <ViewField label="contact" value={event.organizer.full_name} />
              <ViewField label="phone" value={event.organizer.phone} />
              <ViewField label="email" value={event.organizer.email} />
            </>
          )}

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <Stack spacing={0.5} sx={{ color: tickahub.textMuted, fontSize: "0.75rem" }}>
            <Typography variant="caption">Created {event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}</Typography>
            <Typography variant="caption">Updated {event.updatedAt ? new Date(event.updatedAt).toLocaleString() : "—"}</Typography>
          </Stack>
        </Stack>
      </SectionCard>
    </Box>
  );
};

export default EventView;
