import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Event as EventIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  tickahub,
  swalDark,
  fieldSx,
  pageShellSx,
  primaryButtonSx,
  secondaryButtonSx,
  SectionCard,
  SectionLabel,
  PageHeader,
  eventStatusColor,
} from "../shared/tickahubPageStyles";
import EventDateTimeFields from "./EventDateTimeFields";
import VenueMapPicker from "./VenueMapPicker";
import EventCategorySelect from "./EventCategorySelect";
import { appendEventScheduleFields, parseDateValue, parseTimeValue } from "./eventFormPickers";
import { getTicketTierValidation } from "./ticketTierValidation";
import EventLineupFields from "./EventLineupFields";
import { parseLineupFromApi, serializeLineupForSubmit } from "./eventLineup";
import EventMerchandiseFields, {
  appendMerchandiseToFormData,
  parseMerchandiseFromApi,
} from "./EventMerchandiseFields";

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    venue: "",
    venue_latitude: "",
    venue_longitude: "",
    category: "",
    commission_rate: 10.0,
    tickets_available: "",
    status: "pending",
  });
  const [ticketPrices, setTicketPrices] = useState([{ category: "", price: "", quantity: "" }]);
  const [lineup, setLineup] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");

  const ticketValidation = useMemo(
    () => getTicketTierValidation(eventForm.tickets_available, ticketPrices),
    [eventForm.tickets_available, ticketPrices]
  );

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

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
      const result = await response.json();

      if (response.ok && result.success) {
        const data = result.data;
        setEvent(data);
        setEventForm({
          title: data.event_name || data.title || "",
          description: data.description || "",
          venue: data.venue || "",
          venue_latitude: data.venue_latitude ?? "",
          venue_longitude: data.venue_longitude ?? "",
          category: data.category || "",
          commission_rate: data.commission_rate || 10.0,
          tickets_available: data.tickets_available ?? "",
          status: data.status || "pending",
        });
        setEventDate(parseDateValue(data.event_date));
        setStartTime(parseTimeValue(data.start_time));
        setEndTime(parseTimeValue(data.end_time));

        const tiers = Array.isArray(data.ticket_prices) ? data.ticket_prices : [];
        setTicketPrices(
          tiers.length
            ? tiers.map((t) => ({
                category: t.category || "",
                price: t.price ?? "",
                quantity: t.quantity ?? "",
              }))
            : [{ category: "", price: "", quantity: "" }]
        );
        setLineup(parseLineupFromApi(data.lineup));
        setMerchandise(
          parseMerchandiseFromApi(data.merchandise).map((item) => ({
            ...item,
            existingImageUrl: buildImageUrl(item.existingImageUrl),
          }))
        );
        setCurrentImage(data.image_url || data.image || "");
      } else {
        setError(result.message || "Failed to fetch event details");
      }
    } catch (err) {
      setError("Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = ({ venue, venue_latitude, venue_longitude }) => {
    setEventForm((prev) => ({
      ...prev,
      venue: venue ?? prev.venue,
      venue_latitude: venue_latitude ?? prev.venue_latitude,
      venue_longitude: venue_longitude ?? prev.venue_longitude,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!ticketValidation.isValid) {
      Swal.fire({
        title: "Ticket quantities invalid",
        text: ticketValidation.submitError || ticketValidation.ticketsAvailableError || "Check tier quantities against total tickets available.",
        icon: "error",
        ...swalDark,
      });
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();

      Object.keys(eventForm).forEach((key) => {
        if (eventForm[key] !== null && eventForm[key] !== undefined && eventForm[key] !== "") {
          formData.append(key, eventForm[key]);
        }
      });

      appendEventScheduleFields(formData, eventDate, startTime, endTime);

      const tiers = ticketPrices
        .filter((t) => t.category && t.price !== "")
        .map((t) => ({
          category: t.category,
          price: parseFloat(t.price),
          ...(t.quantity !== "" ? { quantity: parseInt(t.quantity, 10) } : {}),
        }));
      formData.append("ticket_prices", JSON.stringify(tiers));
      formData.append("lineup", JSON.stringify(serializeLineupForSubmit(lineup)));
      appendMerchandiseToFormData(formData, merchandise);
      if (selectedFile) formData.append("event_image", selectedFile);

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: "Event updated",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          ...swalDark,
        });
        navigate(`/events/${id}`);
      } else {
        throw new Error(result.message || "Failed to update event");
      }
    } catch (err) {
      Swal.fire({ title: "Update failed", text: err.message, icon: "error", ...swalDark });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () =>
    eventForm.title.trim() &&
    eventForm.venue.trim() &&
    eventDate?.isValid() &&
    startTime?.isValid() &&
    eventForm.category &&
    ticketValidation.isValid;

  const displayImage = filePreview || buildImageUrl(currentImage);

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

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={EventIcon}
        title="Edit event"
        subtitle={eventForm.title || "Update event details"}
        inlineActionOnMobile
        hideSubtitleOnMobile
        action={
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="nowrap" sx={{ flexShrink: 0 }}>
            <Chip
              label={eventForm.status}
              size="small"
              sx={{
                bgcolor: `${eventStatusColor(eventForm.status)}22`,
                color: eventStatusColor(eventForm.status),
                fontWeight: 700,
                textTransform: "capitalize",
                height: 24,
                "& .MuiChip-label": { px: 1, fontSize: "0.68rem" },
              }}
            />
            <IconButton
              size="small"
              onClick={() => navigate(`/events/${id}`)}
              aria-label="Cancel editing"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: tickahub.textMuted,
                bgcolor: alpha("#fff", 0.06),
                borderRadius: 2,
                border: `1px solid ${tickahub.borderSubtle}`,
                "&:hover": { bgcolor: alpha("#fff", 0.1) },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
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
              startIcon={<CloseIcon />}
              onClick={() => navigate(`/events/${id}`)}
              sx={{ ...secondaryButtonSx, display: { xs: "none", md: "inline-flex" } }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/events")}
              sx={{ ...secondaryButtonSx, display: { xs: "none", md: "inline-flex" } }}
            >
              Back
            </Button>
          </Stack>
        }
      />

      <SectionCard
        sx={{ width: "100%", flex: "none" }}
        headerBg={`linear-gradient(135deg, ${alpha(tickahub.cyan, 0.14)}, transparent)`}
        icon={EventIcon}
        iconColor={tickahub.cyan}
        title="Edit event"
        subtitle="All fields in one form"
      >
        <Stack spacing={2.5} sx={{ width: "100%" }}>
          <SectionLabel>Event details</SectionLabel>
          <TextField label="title" size="small" fullWidth required value={eventForm.title} onChange={(e) => handleInputChange("title", e.target.value)} sx={fieldSx} />
          <TextField label="description" size="small" fullWidth multiline minRows={3} value={eventForm.description} onChange={(e) => handleInputChange("description", e.target.value)} sx={fieldSx} />
          <EventCategorySelect
            value={eventForm.category}
            onChange={(cat) => handleInputChange("category", cat)}
            required
          />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Date & time</SectionLabel>
          <EventDateTimeFields
            eventDate={eventDate}
            onEventDateChange={setEventDate}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            endTime={endTime}
            onEndTimeChange={setEndTime}
          />
          <TextField label="commission_rate" type="number" size="small" fullWidth value={eventForm.commission_rate} onChange={(e) => handleInputChange("commission_rate", parseFloat(e.target.value))} inputProps={{ min: 0, max: 50, step: 0.1 }} sx={fieldSx} />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel>Venue & location</SectionLabel>
          <VenueMapPicker
            venue={eventForm.venue}
            latitude={eventForm.venue_latitude}
            longitude={eventForm.venue_longitude}
            onLocationChange={handleLocationChange}
            required
          />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Lineup</SectionLabel>
          <EventLineupFields lineup={lineup} onChange={setLineup} />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Tickets</SectionLabel>
          <TextField
            label="tickets_available"
            type="number"
            size="small"
            fullWidth
            required
            value={eventForm.tickets_available}
            onChange={(e) => handleInputChange("tickets_available", e.target.value)}
            inputProps={{ min: 0, step: 1 }}
            error={Boolean(ticketValidation.ticketsAvailableError)}
            helperText={ticketValidation.ticketsAvailableError || ticketValidation.summary || "Total tickets for this event"}
            sx={fieldSx}
          />
          {ticketPrices.map((tier, index) => (
            <Stack key={index} spacing={1.5} sx={{ width: "100%", p: 1.5, borderRadius: 2, border: `1px solid ${ticketValidation.tierErrors[index] ? tickahub.gold : tickahub.borderSubtle}`, bgcolor: tickahub.navy }}>
              <TextField label="tier category" size="small" fullWidth value={tier.category} onChange={(e) => { const next = [...ticketPrices]; next[index] = { ...next[index], category: e.target.value }; setTicketPrices(next); }} sx={fieldSx} />
              <TextField label="price" type="number" size="small" fullWidth value={tier.price} onChange={(e) => { const next = [...ticketPrices]; next[index] = { ...next[index], price: e.target.value }; setTicketPrices(next); }} sx={fieldSx} />
              <TextField
                label="quantity"
                type="number"
                size="small"
                fullWidth
                value={tier.quantity}
                onChange={(e) => { const next = [...ticketPrices]; next[index] = { ...next[index], quantity: e.target.value }; setTicketPrices(next); }}
                inputProps={{
                  min: 0,
                  step: 1,
                  ...(ticketValidation.ticketsAvailable != null ? { max: ticketValidation.ticketsAvailable } : {}),
                }}
                error={Boolean(ticketValidation.tierErrors[index])}
                helperText={
                  ticketValidation.tierErrors[index] ||
                  (ticketValidation.ticketsAvailable != null
                    ? `Max ${ticketValidation.ticketsAvailable} for this event`
                    : "Set tickets available first")
                }
                sx={fieldSx}
              />
              {ticketPrices.length > 1 && (
                <Button size="small" startIcon={<CloseIcon />} onClick={() => setTicketPrices(ticketPrices.filter((_, i) => i !== index))} sx={{ color: tickahub.textMuted, textTransform: "none", alignSelf: "flex-start" }}>
                  Remove tier
                </Button>
              )}
            </Stack>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setTicketPrices([...ticketPrices, { category: "", price: "", quantity: "" }])} sx={{ color: tickahub.cyan, textTransform: "none", alignSelf: "flex-start" }}>
            Add tier
          </Button>

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Merchandise</SectionLabel>
          <EventMerchandiseFields items={merchandise} onChange={setMerchandise} />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel>Cover image</SectionLabel>
          {displayImage && (
            <Box component="img" src={displayImage} alt="Event" sx={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 2, border: `1px solid ${tickahub.borderSubtle}` }} />
          )}
          <Stack direction="row" spacing={1}>
            <Button component="label" variant="outlined" size="small" sx={secondaryButtonSx}>
              {displayImage ? "Replace image" : "Upload image"}
              <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
            </Button>
            {filePreview && (
              <Button size="small" onClick={() => { setSelectedFile(null); setFilePreview(""); }} sx={{ color: tickahub.textMuted, textTransform: "none" }}>
                Revert
              </Button>
            )}
          </Stack>

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <Button variant="contained" size="small" disabled={!isFormValid() || saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={handleSave} sx={{ ...primaryButtonSx, alignSelf: "flex-start", width: { xs: "100%", sm: "auto" } }}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </Stack>
      </SectionCard>
    </Box>
  );
};

export default EventEdit;
