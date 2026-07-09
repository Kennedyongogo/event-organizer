import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Chip,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tickahub, goldGradient, cyanGradient } from "../../tickahubTheme";
import {
  getDisplayName,
  getInitials,
  getPhone,
  getOrganizerStatus,
  getRoleLabel,
  getUserRole,
  getProfileImageUrl,
} from "../../utils/userDisplay";
import { formatGenresDisplay } from "../../utils/artistGenres";

const DetailRow = ({ label, children }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      py: 0.85,
      minHeight: 36,
    }}
  >
    <Typography
      sx={{
        color: tickahub.textMuted,
        fontFamily: "monospace",
        fontSize: "0.75rem",
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Box sx={{ textAlign: "right", minWidth: 0 }}>{children}</Box>
  </Box>
);

const textValue = (value) => (
  <Typography sx={{ color: "#fff", fontSize: "0.88rem", fontWeight: 500, wordBreak: "break-word" }}>
    {value || "—"}
  </Typography>
);

export default function UserAccount({ open, onClose, currentUser }) {
  const displayName = getDisplayName(currentUser);
  const role = getUserRole();
  const isArtist = role === "artist";
  const isOrganizer = role === "organizer" || role === "event_organizer";
  const status = getOrganizerStatus(currentUser);
  const avatarSrc = getProfileImageUrl(currentUser);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: tickahub.surface,
          border: `1px solid ${tickahub.borderSubtle}`,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          py: 1.5,
          px: 2,
          background: `linear-gradient(135deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 100%)`,
          color: "#fff",
          borderBottom: `1px solid ${tickahub.borderSubtle}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pr: 5,
        }}
      >
        <Avatar
          src={avatarSrc || undefined}
          sx={{
            width: 40,
            height: 40,
            background: isArtist ? cyanGradient : goldGradient,
            color: tickahub.navy,
            fontWeight: 800,
            fontSize: "0.85rem",
          }}
        >
          {getInitials(displayName)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>Account</Typography>
          <Typography noWrap sx={{ color: tickahub.textMuted, fontSize: "0.82rem" }}>
            {displayName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ position: "absolute", right: 8, top: 8, color: tickahub.textMuted }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1.25, overflow: "hidden" }}>
        <Stack divider={<Divider sx={{ borderColor: tickahub.borderSubtle }} />} spacing={0}>
          {isArtist && <DetailRow label="stage_name">{textValue(currentUser?.stage_name)}</DetailRow>}
          {isOrganizer && <DetailRow label="organization_name">{textValue(currentUser?.organization_name)}</DetailRow>}
          <DetailRow label="full_name">{textValue(currentUser?.full_name || currentUser?.contact_person)}</DetailRow>
          <DetailRow label="email">{textValue(currentUser?.email)}</DetailRow>
          <DetailRow label="phone">{textValue(getPhone(currentUser))}</DetailRow>
          {isArtist && <DetailRow label="genres">{textValue(formatGenresDisplay(currentUser?.genre))}</DetailRow>}
          <DetailRow label="role">
            <Chip
              label={getRoleLabel()}
              size="small"
              sx={{
                bgcolor: isArtist ? `${tickahub.cyan}22` : `${tickahub.gold}22`,
                color: isArtist ? tickahub.cyan : tickahub.gold,
                fontWeight: 700,
                height: 24,
              }}
            />
          </DetailRow>
          {isOrganizer && (
            <DetailRow label="organizer_status">
              <Chip
                label={status}
                size="small"
                sx={{ height: 24 }}
                color={
                  status === "approved" || status === "active"
                    ? "success"
                    : status === "pending"
                      ? "warning"
                      : "error"
                }
              />
            </DetailRow>
          )}
          <DetailRow label="lastLogin">
            {textValue(currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : "—")}
          </DetailRow>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
