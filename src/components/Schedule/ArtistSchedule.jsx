import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Tabs,
  Tab,
  Divider,
  Pagination,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Public as PublicIcon,
  PublicOff as PrivateIcon,
  Save as SaveIcon,
  EventAvailable as EventIcon,
  Image as ImageIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { tickahub, goldGradient, backgroundGradient, cyanGradient } from "../../tickahubTheme";

const swalDark = {
  confirmButtonColor: tickahub.gold,
  background: tickahub.surface,
  color: "#fff",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: tickahub.navy,
    "& fieldset": { borderColor: tickahub.borderSubtle },
    "&:hover fieldset": { borderColor: tickahub.borderLight },
    "&.Mui-focused fieldset": { borderColor: tickahub.cyan },
  },
  "& .MuiInputLabel-root": { color: tickahub.textMuted },
  "& .MuiOutlinedInput-input": { color: "#fff" },
  "& .MuiFormHelperText-root": { color: tickahub.textMuted },
  "& .MuiIconButton-root": { color: tickahub.cyan },
};

const pickerPaperSx = {
  bgcolor: tickahub.surface,
  color: "#fff",
  border: `1px solid ${tickahub.borderSubtle}`,
  "& .MuiPickersDay-root.Mui-selected": {
    bgcolor: `${tickahub.cyan} !important`,
    color: `${tickahub.navy} !important`,
  },
  "& .MuiClock-pin, & .MuiClockPointer-root": { bgcolor: tickahub.cyan },
  "& .MuiClockPointer-thumb": { borderColor: tickahub.cyan, bgcolor: tickahub.cyan },
  "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
    bgcolor: tickahub.cyan,
    color: tickahub.navy,
  },
};

const getPickerSlotProps = (required = false) => ({
  textField: { size: "small", fullWidth: true, required, sx: fieldSx },
  openPickerButton: { sx: { color: tickahub.cyan } },
  desktopPaper: { sx: pickerPaperSx },
  mobilePaper: { sx: pickerPaperSx },
  layout: { sx: pickerPaperSx },
});

const getFilterPickerSlotProps = () => ({
  ...getPickerSlotProps(),
  field: { clearable: true, size: "small", fullWidth: true, sx: fieldSx },
  textField: { size: "small", fullWidth: true, sx: fieldSx },
});

const emptyForm = {
  title: "",
  venue: "",
  city: "",
  activityDate: null,
  startTime: null,
  endTime: null,
  description: "",
  external_url: "",
  is_public: true,
};

const PAGE_SIZE = 6;

const pageShellSx = {
  m: { xs: -2, md: -3 },
  background: backgroundGradient,
  display: "flex",
  flexDirection: "column",
  pt: 2,
  px: 2,
  pb: 2,
  gap: 2,
};

const authHeaders = (json = true) => {
  const token = localStorage.getItem("token");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const parseTimeValue = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  const parsed = dayjs(`1970-01-01T${raw.length === 5 ? `${raw}:00` : raw}`);
  return parsed.isValid() ? parsed : null;
};

const formatDisplayTime = (value) => {
  if (!value) return "";
  const t = String(value).slice(0, 5);
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return t;
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const isOvernightRange = (start, end) => {
  if (!start || !end) return false;
  const startValue =
    typeof start === "string" ? String(start).slice(0, 8) : start.format("HH:mm:ss");
  const endValue =
    typeof end === "string" ? String(end).slice(0, 8) : end.format("HH:mm:ss");
  return endValue < startValue;
};

const scheduleImageUrl = (path) => {
  if (!path) return null;
  if (/^(https?:|data:)/i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

const isUpcoming = (item) => {
  const date = dayjs(item.activity_date);
  const end = parseTimeValue(item.end_time);
  if (!date.isValid() || !end?.isValid()) {
    return date.startOf("day").valueOf() >= dayjs().startOf("day").valueOf();
  }
  const endDate = date
    .startOf("day")
    .hour(end.hour())
    .minute(end.minute())
    .second(end.second())
    .add(isOvernightRange(item.start_time, item.end_time) ? 1 : 0, "day");
  return endDate.valueOf() > dayjs().valueOf();
};

const getDateParts = (value) => {
  const d = dayjs(value);
  return {
    day: d.format("DD"),
    month: d.format("MMM"),
    year: d.format("YYYY"),
    weekday: d.format("ddd"),
    full: d.format("dddd, MMM D, YYYY"),
  };
};

function StatSegment({ label, value, accent }) {
  return (
    <Box sx={{ flex: 1, textAlign: "center", px: 1.5, py: 1.25 }}>
      <Typography sx={{ color: accent, fontWeight: 800, fontSize: "1.25rem", lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ color: tickahub.textMuted, fontSize: "0.68rem", fontWeight: 600, mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  );
}

function SectionLabel({ children, accent = tickahub.cyan }) {
  return (
    <Typography
      sx={{
        color: accent,
        fontWeight: 800,
        fontSize: "0.72rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        mb: 1.25,
      }}
    >
      {children}
    </Typography>
  );
}

function ScheduleFormPanel({
  editingId,
  form,
  setField,
  imagePreview,
  onImageSelect,
  saving,
  onSave,
  onClose,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: tickahub.surface,
        border: `1px solid ${alpha(tickahub.cyan, 0.35)}`,
        boxShadow: `0 24px 64px ${alpha(tickahub.navy, 0.45)}`,
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(tickahub.cyan, 0.18)} 0%, transparent 60%)`,
          borderBottom: `1px solid ${tickahub.borderSubtle}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: cyanGradient,
            }}
          >
            {editingId ? <EditIcon sx={{ color: tickahub.navy }} /> : <AddIcon sx={{ color: tickahub.navy }} />}
          </Box>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1rem", md: "1.15rem" } }}>
              {editingId ? "Edit appearance" : "New appearance"}
            </Typography>
            <Typography sx={{ color: tickahub.textMuted, fontSize: "0.8rem" }}>
              Share where fans can catch you live
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          disabled={saving}
          sx={{
            color: tickahub.textMuted,
            bgcolor: alpha("#fff", 0.04),
            "&:hover": { bgcolor: alpha("#fff", 0.08) },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Stack spacing={2.5}>
                <SectionLabel>Event details</SectionLabel>
                <TextField
                  label="title"
                  size="small"
                  fullWidth
                  required
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Nairobi Jazz Festival"
                  sx={fieldSx}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="activity_date"
                      value={form.activityDate}
                      onChange={(value) => setField("activityDate", value)}
                      slotProps={getPickerSlotProps(true)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TimePicker
                      label="start_time"
                      value={form.startTime}
                      onChange={(value) => setField("startTime", value)}
                      ampm
                      slotProps={getPickerSlotProps(true)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TimePicker
                      label={
                        isOvernightRange(form.startTime, form.endTime)
                          ? "end_time (next day)"
                          : "end_time"
                      }
                      value={form.endTime}
                      onChange={(value) => setField("endTime", value)}
                      ampm
                      slotProps={getPickerSlotProps(true)}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="venue"
                      size="small"
                      fullWidth
                      value={form.venue}
                      onChange={(e) => setField("venue", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="city"
                      size="small"
                      fullWidth
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="description"
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  sx={fieldSx}
                />
                <TextField
                  label="external_url"
                  size="small"
                  fullWidth
                  value={form.external_url}
                  onChange={(e) => setField("external_url", e.target.value)}
                  placeholder="https://..."
                  helperText="Optional ticket or info link"
                  sx={fieldSx}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Stack spacing={2.5} sx={{ height: "100%" }}>
                <SectionLabel accent={tickahub.gold}>Cover & visibility</SectionLabel>
                <Paper
                  elevation={0}
                  component="label"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 180,
                    borderRadius: 3,
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    border: `1px dashed ${alpha(tickahub.cyan, 0.4)}`,
                    bgcolor: alpha(tickahub.navy, 0.6),
                    backgroundImage: imagePreview ? `url(${imagePreview})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "border-color 0.2s, transform 0.2s",
                    "&:hover": {
                      borderColor: tickahub.cyan,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <input type="file" accept="image/*" hidden onChange={onImageSelect} />
                  {!imagePreview && (
                    <Stack alignItems="center" spacing={1} sx={{ p: 3, textAlign: "center" }}>
                      <ImageIcon sx={{ fontSize: 40, color: tickahub.cyan }} />
                      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
                        Upload cover image
                      </Typography>
                      <Typography sx={{ color: tickahub.textMuted, fontSize: "0.75rem" }}>
                        JPG, PNG · optional
                      </Typography>
                    </Stack>
                  )}
                  {imagePreview && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(11,15,26,0.85), transparent 50%)",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        p: 2,
                      }}
                    >
                      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>
                        Tap to change image
                      </Typography>
                    </Box>
                  )}
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(tickahub.navy, 0.5),
                    border: `1px solid ${tickahub.borderSubtle}`,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.is_public}
                        onChange={(e) => setField("is_public", e.target.checked)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: tickahub.cyan },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            bgcolor: tickahub.cyan,
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>
                          Public appearance
                        </Typography>
                        <Typography sx={{ color: tickahub.textMuted, fontSize: "0.75rem" }}>
                          Fans can see this on your profile
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: "flex-start" }}
                  />
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </LocalizationProvider>

        <Divider sx={{ borderColor: tickahub.borderSubtle, my: 3 }} />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          justifyContent="flex-end"
        >
          <Button
            fullWidth={false}
            onClick={onClose}
            disabled={saving}
            sx={{
              color: tickahub.textMuted,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{
              background: goldGradient,
              color: tickahub.navy,
              fontWeight: 800,
              textTransform: "none",
              px: 3.5,
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: `0 8px 24px ${alpha(tickahub.gold, 0.35)}`,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Add to schedule"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

function ScheduleCard({ item, onEdit, onDelete, muted }) {
  const img = scheduleImageUrl(item.image_url);
  const parts = getDateParts(item.activity_date);
  const location = [item.venue, item.city].filter(Boolean).join(" · ");
  const timeRange = [
    item.start_time,
    item.end_time,
  ].filter(Boolean).map(formatDisplayTime).join(" – ") +
    (isOvernightRange(item.start_time, item.end_time) ? " (next day)" : "");

  const accent = muted ? tickahub.textMuted : tickahub.cyan;
  const goldAccent = muted ? tickahub.textMuted : tickahub.gold;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        minHeight: { xs: 220, md: 240 },
        maxWidth: "100%",
        border: `1px solid ${muted ? tickahub.borderSubtle : alpha(tickahub.cyan, 0.28)}`,
        opacity: muted ? 0.88 : 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: muted ? "none" : `0 16px 40px ${alpha(tickahub.cyan, 0.18)}`,
          borderColor: muted ? tickahub.borderSubtle : alpha(tickahub.cyan, 0.5),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: img
            ? `url(${img}) center/cover no-repeat`
            : `linear-gradient(145deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 55%, ${alpha(tickahub.cyan, 0.12)} 100%)`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: img
            ? `linear-gradient(to top, ${alpha(tickahub.navy, 0.97)} 0%, ${alpha(tickahub.navy, 0.72)} 42%, ${alpha(tickahub.navy, 0.25)} 100%)`
            : `linear-gradient(to top, ${alpha(tickahub.navy, 0.92)} 0%, ${alpha(tickahub.navy, 0.45)} 55%, transparent 100%)`,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: { xs: 220, md: 240 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { xs: 2, md: 2.25 },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box
            sx={{
              px: 1.25,
              py: 0.85,
              borderRadius: 2,
              bgcolor: alpha(muted ? tickahub.textMuted : tickahub.cyan, 0.18),
              border: `1px solid ${alpha(accent, 0.35)}`,
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography sx={{ color: accent, fontWeight: 900, fontSize: "1.1rem", lineHeight: 1 }}>
              {parts.day}
            </Typography>
            <Typography
              sx={{
                color: goldAccent,
                fontWeight: 800,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {parts.month} {parts.year}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onEdit(item)}
              sx={{
                color: tickahub.gold,
                bgcolor: alpha(tickahub.navy, 0.55),
                backdropFilter: "blur(8px)",
                border: `1px solid ${alpha(tickahub.gold, 0.35)}`,
                "&:hover": { bgcolor: alpha(tickahub.gold, 0.2) },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(item)}
              sx={{
                color: "#ff8a8a",
                bgcolor: alpha(tickahub.navy, 0.55),
                backdropFilter: "blur(8px)",
                border: `1px solid ${alpha("#ff8a8a", 0.35)}`,
                "&:hover": { bgcolor: alpha("#ff8a8a", 0.18) },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: tickahub.textMuted,
              fontWeight: 600,
              fontSize: "0.75rem",
              mb: 0.5,
            }}
          >
            {parts.weekday} · {parts.full}
          </Typography>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 900,
              fontSize: { xs: "1.15rem", md: "1.3rem" },
              lineHeight: 1.2,
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.title}
          </Typography>

          <Stack spacing={0.6} mb={item.description ? 1 : 1.25}>
            {timeRange && <MetaRow icon={TimeIcon} text={timeRange} onImage />}
            {location && <MetaRow icon={LocationIcon} text={location} onImage />}
          </Stack>

          {item.description && (
            <Typography
              sx={{
                color: alpha("#fff", 0.72),
                fontSize: "0.82rem",
                lineHeight: 1.5,
                mb: 1.25,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.description}
            </Typography>
          )}

          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} useFlexGap>
            <Chip
              icon={item.is_public ? <PublicIcon /> : <PrivateIcon />}
              label={item.is_public ? "Public" : "Private"}
              size="small"
              sx={{
                height: 26,
                fontWeight: 700,
                bgcolor: alpha(tickahub.navy, 0.55),
                backdropFilter: "blur(8px)",
                color: item.is_public ? tickahub.cyan : tickahub.textMuted,
                border: `1px solid ${alpha(item.is_public ? tickahub.cyan : tickahub.textMuted, 0.35)}`,
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
            {item.external_url && (
              <Chip
                icon={<LinkIcon />}
                label="Tickets"
                size="small"
                component="a"
                href={item.external_url}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                sx={{
                  height: 26,
                  fontWeight: 700,
                  bgcolor: alpha(tickahub.navy, 0.55),
                  backdropFilter: "blur(8px)",
                  color: tickahub.gold,
                  border: `1px solid ${alpha(tickahub.gold, 0.35)}`,
                  "& .MuiChip-icon": { color: tickahub.gold },
                }}
              />
            )}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}

function MetaRow({ icon: Icon, text, onImage = false }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
      <Icon sx={{ fontSize: 15, color: tickahub.cyan, flexShrink: 0 }} />
      <Typography
        sx={{
          color: onImage ? alpha("#fff", 0.85) : tickahub.textMuted,
          fontSize: "0.8rem",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

function EmptyState({ onAdd }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        p: { xs: 4, md: 6 },
        borderRadius: 4,
        textAlign: "center",
        bgcolor: tickahub.surface,
        border: `1px dashed ${alpha(tickahub.cyan, 0.35)}`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: alpha(tickahub.cyan, 0.08),
          top: -60,
          right: -40,
          filter: "blur(2px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: alpha(tickahub.gold, 0.08),
          bottom: -50,
          left: -30,
        }}
      />
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            mb: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: cyanGradient,
            boxShadow: `0 12px 32px ${alpha(tickahub.cyan, 0.3)}`,
          }}
        >
          <EventIcon sx={{ fontSize: 36, color: tickahub.navy }} />
        </Box>
        <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.35rem", mb: 1 }}>
          Your stage awaits
        </Typography>
        <Typography
          sx={{
            color: tickahub.textMuted,
            fontSize: "0.95rem",
            maxWidth: 360,
            mx: "auto",
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          Add gigs, festivals, and appearances so fans know where to find you next.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{
            background: goldGradient,
            color: tickahub.navy,
            fontWeight: 800,
            textTransform: "none",
            px: 3.5,
            py: 1.2,
            borderRadius: 2.5,
            boxShadow: `0 8px 24px ${alpha(tickahub.gold, 0.3)}`,
          }}
        >
          Add your first appearance
        </Button>
      </Box>
    </Paper>
  );
}

export default function ArtistSchedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [pagination, setPagination] = useState({ count: 0, totalPages: 0 });
  const [summary, setSummary] = useState({ upcoming: 0, past: 0, total: 0, public: 0 });

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const hasDateFilter = Boolean(dateFrom?.isValid() || dateTo?.isValid());

  const loadSchedule = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        status: tab,
      });
      if (dateFrom?.isValid()) params.set("date_from", dateFrom.format("YYYY-MM-DD"));
      if (dateTo?.isValid()) params.set("date_to", dateTo.format("YYYY-MM-DD"));

      const response = await fetch(`/api/artists/me/schedule?${params}`, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to load schedule");

      setItems(data.data || []);
      setPagination({
        count: data.count ?? 0,
        totalPages: data.totalPages ?? 0,
        page: data.page ?? page,
        limit: data.limit ?? PAGE_SIZE,
      });
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not load schedule", text: err.message, ...swalDark });
    } finally {
      setLoading(false);
    }
  }, [page, tab, dateFrom, dateTo]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleTabChange = (_, value) => {
    setTab(value);
    setPage(1);
  };

  const handleDateFromChange = (value) => {
    setDateFrom(value && dayjs(value).isValid() ? dayjs(value) : null);
    setPage(1);
  };

  const handleDateToChange = (value) => {
    setDateTo(value && dayjs(value).isValid() ? dayjs(value) : null);
    setPage(1);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      venue: item.venue || "",
      city: item.city || "",
      activityDate: parseDateValue(item.activity_date),
      startTime: parseTimeValue(item.start_time),
      endTime: parseTimeValue(item.end_time),
      description: item.description || "",
      external_url: item.external_url || "",
      is_public: item.is_public !== false,
    });
    setImageFile(null);
    setImagePreview(scheduleImageUrl(item.image_url));
    setFormOpen(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Invalid file", text: "Choose an image file.", ...swalDark });
      return;
    }
    setImageFile(file);
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("venue", form.venue.trim());
    formData.append("city", form.city.trim());
    formData.append("activity_date", form.activityDate.format("YYYY-MM-DD"));
    formData.append("start_time", form.startTime.format("HH:mm:ss"));
    formData.append("end_time", form.endTime.format("HH:mm:ss"));
    formData.append("description", form.description.trim());
    formData.append("external_url", form.external_url.trim());
    formData.append("is_public", form.is_public ? "true" : "false");
    if (imageFile) formData.append("event_image", imageFile);
    return formData;
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.activityDate?.isValid()) {
      Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Title and date are required.",
        ...swalDark,
      });
      return;
    }
    if (!form.startTime?.isValid() || !form.endTime?.isValid()) {
      Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Start time and end time are required.",
        ...swalDark,
      });
      return;
    }
    if (form.endTime.format("HH:mm:ss") === form.startTime.format("HH:mm:ss")) {
      Swal.fire({
        icon: "error",
        title: "Invalid times",
        text: "Start time and end time cannot be the same.",
        ...swalDark,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      const url = editingId ? `/api/artists/me/schedule/${editingId}` : "/api/artists/me/schedule";
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(false),
        body: buildFormData(),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to save schedule item");

      closeForm();
      await loadSchedule();
      Swal.fire({
        icon: "success",
        title: editingId ? "Schedule updated" : "Schedule added",
        timer: 1800,
        showConfirmButton: false,
        ...swalDark,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message, ...swalDark });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this item?",
      text: `"${item.title}" will be removed from your schedule.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ff6b6b",
      ...swalDark,
    });
    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`/api/artists/me/schedule/${item.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to delete");
      await loadSchedule();
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false, ...swalDark });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.message, ...swalDark });
    }
  };

  const upcomingCount = summary.upcoming ?? 0;
  const pastCount = summary.past ?? 0;
  const publicCount = summary.public ?? 0;
  const totalAll = summary.total ?? 0;

  const rangeStart = pagination.count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = pagination.count === 0 ? 0 : Math.min(page * PAGE_SIZE, pagination.count);

  return (
    <Box sx={pageShellSx}>
      {formOpen && (
        <ScheduleFormPanel
          editingId={editingId}
          form={form}
          setField={setField}
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          saving={saving}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {!formOpen && (
        <>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 0,
              bgcolor: tickahub.surface,
              border: `1px solid ${tickahub.borderSubtle}`,
              background: `linear-gradient(135deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 55%, ${alpha(tickahub.cyan, 0.06)} 100%)`,
            }}
          >
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: { xs: 2, md: 2.5 },
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
                gap={2}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 48, md: 52 },
                      height: { xs: 48, md: 52 },
                      borderRadius: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: cyanGradient,
                      boxShadow: `0 8px 24px ${alpha(tickahub.cyan, 0.35)}`,
                    }}
                  >
                    <ScheduleIcon sx={{ color: tickahub.navy, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: "#fff", fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                      My Schedule
                    </Typography>
                    <Typography sx={{ color: tickahub.textMuted, fontSize: { xs: "0.82rem", md: "0.9rem" }, mt: 0.25 }}>
                      Your live appearances — past, present & future
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={openCreate}
                  sx={{
                    background: goldGradient,
                    color: tickahub.navy,
                    fontWeight: 800,
                    textTransform: "none",
                    px: 2.5,
                    borderRadius: 0,
                    boxShadow: `0 6px 20px ${alpha(tickahub.gold, 0.3)}`,
                    width: { xs: "100%", md: "auto" },
                  }}
                >
                  Add appearance
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: tickahub.borderSubtle }} />

            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderColor: tickahub.borderSubtle }} />}
              sx={{ bgcolor: alpha(tickahub.navy, 0.35) }}
            >
              <StatSegment label="Upcoming" value={upcomingCount} accent={tickahub.cyan} />
              <StatSegment label="Past" value={pastCount} accent={tickahub.gold} />
              <StatSegment label="Public" value={publicCount} accent={tickahub.gold} />
            </Stack>

            <Divider sx={{ borderColor: tickahub.borderSubtle }} />

            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                minHeight: 48,
                bgcolor: alpha(tickahub.surface, 0.65),
                "& .MuiTab-root": {
                  color: tickahub.textMuted,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  textTransform: "none",
                  py: 1.5,
                  borderRadius: 0,
                },
                "& .Mui-selected": { color: tickahub.cyan },
                "& .MuiTabs-indicator": { bgcolor: tickahub.cyan, height: 3, borderRadius: 0 },
              }}
            >
              <Tab value="upcoming" label={`Upcoming (${upcomingCount})`} />
              <Tab value="past" label={`Past (${pastCount})`} />
              <Tab value="all" label={`All (${totalAll})`} />
            </Tabs>

            <Divider sx={{ borderColor: tickahub.borderSubtle }} />

            <Box sx={{ p: { xs: 1.5, md: 2 } }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <FilterIcon sx={{ fontSize: 18, color: tickahub.cyan }} />
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>
                  Filter by date
                </Typography>
              </Stack>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <DatePicker
                      label="from_date"
                      value={dateFrom}
                      onChange={handleDateFromChange}
                      maxDate={dateTo || undefined}
                      slotProps={getFilterPickerSlotProps()}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <DatePicker
                      label="to_date"
                      value={dateTo}
                      onChange={handleDateToChange}
                      minDate={dateFrom || undefined}
                      slotProps={getFilterPickerSlotProps()}
                    />
                  </Box>
                </Stack>
              </LocalizationProvider>
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: tickahub.cyan }} size={36} />
            </Box>
          ) : totalAll === 0 ? (
            <EmptyState onAdd={openCreate} />
          ) : items.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    bgcolor: tickahub.surface,
                    border: `1px solid ${tickahub.borderSubtle}`,
                  }}
                >
                  <Typography sx={{ color: tickahub.textMuted }}>
                    {hasDateFilter
                      ? "No appearances match your date filter."
                      : tab === "upcoming"
                        ? "No upcoming shows — add one!"
                        : "Nothing in this view yet."}
                  </Typography>
                  {tab === "upcoming" && (
                    <Button
                      sx={{ mt: 2, color: tickahub.cyan, textTransform: "none", fontWeight: 700 }}
                      startIcon={<AddIcon />}
                      onClick={openCreate}
                    >
                      Add appearance
                    </Button>
                  )}
                </Paper>
          ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: { xs: 1.25, md: 1.5 },
                    }}
                  >
                    {items.map((item) => (
                      <ScheduleCard
                        key={item.id}
                        item={item}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        muted={!isUpcoming(item)}
                      />
                    ))}
                  </Box>

                  {pagination.totalPages > 1 && (
                    <Stack spacing={1} alignItems="center" pt={1}>
                      <Typography sx={{ color: tickahub.textMuted, fontSize: "0.82rem" }}>
                        Showing {rangeStart}–{rangeEnd} of {pagination.count}
                      </Typography>
                      <Pagination
                        count={pagination.totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        shape="rounded"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: tickahub.textMuted,
                            borderColor: tickahub.borderSubtle,
                          },
                          "& .MuiPaginationItem-root.Mui-selected": {
                            bgcolor: `${tickahub.cyan} !important`,
                            color: `${tickahub.navy} !important`,
                            fontWeight: 800,
                          },
                        }}
                      />
                    </Stack>
                  )}
                </>
          )}
        </>
      )}
    </Box>
  );
}
