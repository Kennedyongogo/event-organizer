import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  SecurityOutlined as SecurityIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { tickahub } from "../tickahubTheme";
import { getUserRole } from "../utils/userDisplay";
import { SectionCard, SectionLabel, pageShellSx } from "../components/shared/tickahubPageStyles";

const swalDark = {
  confirmButtonColor: tickahub.gold,
  background: tickahub.surface,
  color: "#fff",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "rgba(255,255,255,0.07)",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
    "& fieldset": { borderColor: "rgba(255,255,255,0.18)" },
    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.36)" },
    "&.Mui-focused": {
      bgcolor: "rgba(255,255,255,0.11)",
      boxShadow: `0 0 0 3px ${tickahub.cyan}18`,
    },
    "&.Mui-focused fieldset": { borderColor: tickahub.cyan },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.68)" },
  "& .MuiInputLabel-root.Mui-focused": { color: tickahub.cyan },
  "& .MuiOutlinedInput-input": { color: "#fff" },
  "& .Mui-disabled": { WebkitTextFillColor: `${tickahub.textMuted} !important` },
  "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.52)", mt: 0.75 },
};

const PasswordToggle = ({ show, onToggle }) => (
  <IconButton
    onClick={onToggle}
    edge="end"
    aria-label={show ? "Hide password" : "Show password"}
    sx={{
      color: "rgba(255,255,255,0.65)",
      "&:hover": {
        color: "#fff",
        bgcolor: "rgba(255,255,255,0.08)",
      },
    }}
  >
    {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
  </IconButton>
);

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export default function Settings({ user }) {
  const userRole = getUserRole();
  const isArtist = userRole === "artist";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const userId = user?.id;

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password too short",
        text: "Password must be at least 6 characters.",
        ...swalDark,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        text: "New password and confirmation must match.",
        ...swalDark,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || (!isArtist && !userId)) return;

    try {
      setSavingPassword(true);
      Swal.fire({
        title: "Updating password...",
        allowOutsideClick: false,
        ...swalDark,
        didOpen: () => Swal.showLoading(),
      });

      const url = isArtist
        ? "/api/artists/me/change-password"
        : `/api/users/${userId}/change-password`;

      const response = await fetch(url, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update password");
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "Your password has been changed successfully.",
        timer: 2000,
        showConfirmButton: false,
        ...swalDark,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message,
        ...swalDark,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Box sx={pageShellSx}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          px: { xs: 2, md: 2.75 },
          py: { xs: 2, md: 2.25 },
          flexShrink: 0,
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.18)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 52%, rgba(0,212,255,0.09) 100%)",
          boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, #fff 0%, ${tickahub.cyan} 100%)`,
              boxShadow: "0 8px 22px rgba(0,212,255,0.24)",
              borderRadius: 2.5,
            }}
          >
            <LockIcon sx={{ color: tickahub.navy }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>
                Account Settings
              </Typography>
            </Stack>
            <Typography sx={{ color: "rgba(255,255,255,0.68)", fontSize: "0.85rem" }}>
              Keep your account secure
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <SectionCard
        sx={{
          width: "100%",
          flex: "none",
          bgcolor: "rgba(255,255,255,0.075)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 22px 56px rgba(0,0,0,0.3)",
          backdropFilter: "blur(18px)",
        }}
        headerBg="linear-gradient(135deg, rgba(255,255,255,0.13), rgba(0,212,255,0.06))"
        icon={SecurityIcon}
        iconColor={tickahub.cyan}
        title="Change password"
        subtitle="Update the password used to sign in to your account"
      >
        <Stack spacing={2.5} sx={{ width: "100%" }}>
          <SectionLabel accent={tickahub.cyan}>Password</SectionLabel>
          <Box
            component="form"
            onSubmit={handlePasswordSave}
            sx={{
              p: { xs: 1.5, sm: 2.5 },
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.11)",
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <SecurityIcon sx={{ color: tickahub.cyan, fontSize: 20, mt: 0.15 }} />
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.68)",
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                  }}
                >
                  Choose a password you do not use elsewhere. Use at least six
                  characters and keep it private.
                </Typography>
              </Stack>
              <TextField
                label="Current password"
                type={showPasswords.old ? "text" : "password"}
                fullWidth
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <PasswordToggle show={showPasswords.old} onToggle={() => setShowPasswords((p) => ({ ...p, old: !p.old }))} />
                  ),
                }}
                sx={fieldSx}
              />
              <TextField
                label="New password"
                type={showPasswords.new ? "text" : "password"}
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Min. 6 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <PasswordToggle show={showPasswords.new} onToggle={() => setShowPasswords((p) => ({ ...p, new: !p.new }))} />
                  ),
                }}
                sx={fieldSx}
              />
              <TextField
                label="Confirm password"
                type={showPasswords.confirm ? "text" : "password"}
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <PasswordToggle
                      show={showPasswords.confirm}
                      onToggle={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                    />
                  ),
                }}
                sx={fieldSx}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={savingPassword}
                startIcon={savingPassword ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
                sx={{
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                  minHeight: 46,
                  background: `linear-gradient(135deg, #ffffff 0%, ${tickahub.cyan} 100%)`,
                  color: tickahub.navy,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 2.5,
                  px: 3,
                  boxShadow: "0 10px 26px rgba(0,212,255,0.2)",
                  "&:hover": {
                    background: `linear-gradient(135deg, #ffffff 0%, ${tickahub.cyan} 75%)`,
                    boxShadow: "0 12px 30px rgba(0,212,255,0.3)",
                  },
                }}
              >
                {savingPassword ? "Updating..." : "Update password"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </SectionCard>
    </Box>
  );
}
