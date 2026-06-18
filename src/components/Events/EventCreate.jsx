import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  Divider,
  alpha,
} from "@mui/material";
import {
  Event as EventIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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
} from "../shared/tickahubPageStyles";
import EventDateTimeFields from "./EventDateTimeFields";
import VenueMapPicker from "./VenueMapPicker";
import EventCategorySelect from "./EventCategorySelect";
import { appendEventScheduleFields } from "./eventFormPickers";
import { getTicketTierValidation } from "./ticketTierValidation";
import EventLineupFields from "./EventLineupFields";
import { serializeLineupForSubmit } from "./eventLineup";

const EventCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const ticketValidation = useMemo(
    () => getTicketTierValidation(eventForm.tickets_available, ticketPrices),
    [eventForm.tickets_available, ticketPrices]
  );

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

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreviews((prev) => [...prev, e.target.result]);
        reader.readAsDataURL(file);
      } else {
        setFilePreviews((prev) => [...prev, null]);
      }
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
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
      if (tiers.length) formData.append("ticket_prices", JSON.stringify(tiers));

      const lineupPayload = serializeLineupForSubmit(lineup);
      if (lineupPayload.length) formData.append("lineup", JSON.stringify(lineupPayload));

      selectedFiles.forEach((file) => formData.append("event_image", file));

      const token = localStorage.getItem("token");
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      if (result.success) {
        await Swal.fire({
          title: "Event created",
          text: "Your event is pending admin approval.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          ...swalDark,
        });
        navigate("/events");
      } else {
        throw new Error(result.message || "Failed to create event");
      }
    } catch (error) {
      Swal.fire({
        title: "Could not create event",
        text: error.message,
        icon: "error",
        ...swalDark,
      });
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

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={EventIcon}
        title="Create event"
        subtitle="Submit a new event for admin review"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/events")}
            sx={secondaryButtonSx}
          >
            Back to events
          </Button>
        }
      />

      <SectionCard
        sx={{ width: "100%", flex: "none" }}
        headerBg={`linear-gradient(135deg, ${alpha(tickahub.cyan, 0.14)}, transparent)`}
        icon={EventIcon}
        iconColor={tickahub.cyan}
        title="New event"
        subtitle="All fields in one form"
      >
        <Stack spacing={2.5} sx={{ width: "100%" }}>
          <SectionLabel>Event details</SectionLabel>
          <TextField label="title" size="small" fullWidth required value={eventForm.title} onChange={(e) => handleInputChange("title", e.target.value)} sx={fieldSx} />
          <TextField label="description" size="small" fullWidth multiline minRows={3} value={eventForm.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Describe your event..." sx={fieldSx} />
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
          <TextField label="commission_rate" type="number" size="small" fullWidth value={eventForm.commission_rate} onChange={(e) => handleInputChange("commission_rate", parseFloat(e.target.value))} inputProps={{ min: 0, max: 50, step: 0.1 }} helperText="Platform commission % (0–50)" sx={fieldSx} />

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
              <TextField label="tier category" size="small" fullWidth placeholder="VIP" value={tier.category} onChange={(e) => { const next = [...ticketPrices]; next[index] = { ...next[index], category: e.target.value }; setTicketPrices(next); }} sx={fieldSx} />
              <TextField label="price" type="number" size="small" fullWidth value={tier.price} onChange={(e) => { const next = [...ticketPrices]; next[index] = { ...next[index], price: e.target.value }; setTicketPrices(next); }} inputProps={{ min: 0, step: "0.01" }} sx={fieldSx} />
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
          <SectionLabel>Cover image</SectionLabel>
          <Button component="label" variant="outlined" size="small" sx={{ ...secondaryButtonSx, alignSelf: "flex-start" }}>
            Choose image
            <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
          </Button>
          {selectedFiles.map((file, index) => (
            <Box key={index} sx={{ position: "relative", width: "100%", borderRadius: 2, overflow: "hidden", border: `1px solid ${tickahub.borderSubtle}`, bgcolor: tickahub.navy }}>
              <IconButton size="small" onClick={() => removeSelectedFile(index)} sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.5)", color: "#fff", zIndex: 1 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              {filePreviews[index] && (
                <Box component="img" src={filePreviews[index]} alt={file.name} sx={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
              )}
              <Typography variant="caption" sx={{ color: tickahub.textMuted, p: 1, display: "block" }}>{file.name}</Typography>
            </Box>
          ))}

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: "100%" }}>
            <Button variant="contained" size="small" disabled={!isFormValid() || saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={handleCreate} sx={{ ...primaryButtonSx, flex: 1 }}>
              {saving ? "Creating..." : "Create event"}
            </Button>
            <Button variant="outlined" size="small" onClick={() => navigate("/events")} sx={{ ...secondaryButtonSx, flex: 1 }}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </SectionCard>
    </Box>
  );
};

export default EventCreate;
