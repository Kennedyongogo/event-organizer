import React from "react";
import { Box, Stack, Typography, Paper } from "@mui/material";
import { tickahub, goldGradient, cyanGradient, backgroundGradient } from "../../tickahubTheme";

export { tickahub, goldGradient, cyanGradient, backgroundGradient };

export const swalDark = {
  confirmButtonColor: tickahub.gold,
  background: tickahub.surface,
  color: "#fff",
};

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: tickahub.navy,
    "& fieldset": { borderColor: tickahub.borderSubtle },
    "&:hover fieldset": { borderColor: tickahub.borderLight },
    "&.Mui-focused fieldset": { borderColor: tickahub.cyan },
  },
  "& .MuiInputLabel-root": { color: tickahub.textMuted },
  "& .MuiOutlinedInput-input": { color: "#fff" },
  "& .Mui-disabled": { WebkitTextFillColor: `${tickahub.textMuted} !important` },
  "& .MuiFormHelperText-root": { color: tickahub.textMuted, mt: 0.5 },
  "& .MuiSelect-icon": { color: tickahub.textMuted },
};

export const selectSx = fieldSx;

export const sectionTitleSx = {
  color: "#fff",
  fontWeight: 800,
  fontSize: "1rem",
};

export const pageShellSx = {
  m: { xs: -2, md: -3 },
  background: backgroundGradient,
  display: "flex",
  flexDirection: "column",
  pt: 2,
  px: 2,
  pb: 2,
  gap: 2,
};

export const cardsRowSx = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { md: "stretch" },
  gap: 2,
};

export const halfCardSx = {
  flex: { xs: "none", md: 1 },
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
  overflow: "visible",
  bgcolor: tickahub.surface,
  border: `1px solid ${tickahub.borderSubtle}`,
};

export const cardBodySx = { p: 2.5 };

export const cardHeaderSx = {
  px: 2.5,
  py: 1.75,
  flexShrink: 0,
  borderBottom: `1px solid ${tickahub.borderSubtle}`,
};

export const primaryButtonSx = {
  background: goldGradient,
  color: tickahub.navy,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: 2,
  px: 2.5,
  "&:hover": { filter: "brightness(1.05)" },
  "&.Mui-disabled": { opacity: 0.5, color: tickahub.navy },
};

export const secondaryButtonSx = {
  color: tickahub.cyan,
  borderColor: `${tickahub.cyan}66`,
  fontWeight: 600,
  textTransform: "none",
  borderRadius: 2,
  "&:hover": { borderColor: tickahub.cyan, bgcolor: `${tickahub.cyan}11` },
};

export const tabsSx = {
  minHeight: 44,
  "& .MuiTabs-indicator": {
    backgroundColor: tickahub.cyan,
    height: 3,
    borderRadius: "3px 3px 0 0",
  },
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.88rem",
    minHeight: 44,
    color: tickahub.textMuted,
    "&.Mui-selected": { color: tickahub.cyan },
    "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.03)" },
  },
};

export const eventStatusColor = (status) => {
  if (status === "approved" || status === "active") return tickahub.cyan;
  if (status === "pending") return tickahub.gold;
  if (status === "rejected" || status === "cancelled") return "#ff6b6b";
  return tickahub.textMuted;
};

export function SectionLabel({ children, accent = tickahub.cyan }) {
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

export function SectionCard({ headerBg, icon: Icon, iconColor, title, subtitle, children, sx }) {
  return (
    <Paper elevation={0} sx={{ ...halfCardSx, ...sx }}>
      <Box sx={{ ...cardHeaderSx, background: headerBg }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {Icon && <Icon sx={{ color: iconColor, fontSize: 20 }} />}
          <Typography sx={sectionTitleSx}>{title}</Typography>
        </Stack>
        {subtitle && (
          <Typography sx={{ color: tickahub.textMuted, fontSize: "0.8rem", mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={cardBodySx}>{children}</Box>
    </Paper>
  );
}

export function ViewField({ label, value, multiline = false }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: tickahub.textMuted, fontFamily: "monospace", fontSize: "0.72rem" }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 500,
          mt: 0.35,
          wordBreak: "break-word",
          whiteSpace: multiline ? "pre-wrap" : "normal",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

export function PageHeader({
  icon: Icon,
  iconGradient = cyanGradient,
  title,
  subtitle,
  action,
  inlineActionOnMobile = false,
  hideSubtitleOnMobile = false,
}) {
  const mobileInline = inlineActionOnMobile;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 0,
        bgcolor: tickahub.surface,
        border: `1px solid ${tickahub.borderSubtle}`,
        background: `linear-gradient(135deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 55%, rgba(0,212,255,0.06) 100%)`,
      }}
    >
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={mobileInline ? "row" : { xs: "column", md: "row" }}
          alignItems={mobileInline ? "center" : { xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          gap={mobileInline ? 1.5 : 2}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1.5, md: 2 }}
            alignItems="center"
            sx={{ flex: 1, minWidth: 0 }}
          >
            {Icon && (
              <Box
                sx={{
                  width: { xs: mobileInline ? 40 : 48, md: 52 },
                  height: { xs: mobileInline ? 40 : 48, md: 52 },
                  borderRadius: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: iconGradient,
                  boxShadow: `0 8px 24px rgba(0,212,255,0.35)`,
                }}
              >
                <Icon sx={{ color: tickahub.navy, fontSize: { xs: mobileInline ? 24 : 28, md: 28 } }} />
              </Box>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: "#fff",
                  fontSize: { xs: mobileInline ? "1.05rem" : "1.25rem", md: "1.5rem" },
                  ...(mobileInline && {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: { xs: "nowrap", md: "normal" },
                  }),
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  sx={{
                    color: tickahub.textMuted,
                    fontSize: { xs: "0.78rem", md: "0.9rem" },
                    mt: 0.25,
                    display: hideSubtitleOnMobile ? { xs: "none", md: "block" } : "block",
                    ...(mobileInline &&
                      !hideSubtitleOnMobile && {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }),
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          {action && (
            <Box sx={{ flexShrink: 0, ml: mobileInline ? "auto" : 0 }}>{action}</Box>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}
