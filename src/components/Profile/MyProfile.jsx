import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  MusicNote as MusicIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CancelIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
  Description as BioIcon,
  PhotoCamera as PhotoCameraIcon,
  DeleteOutline as DeletePhotoIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { tickahub, goldGradient, backgroundGradient, cyanGradient } from "../../tickahubTheme";
import {
  getDisplayName,
  getInitials,
  getUserRole,
  getProfileImageUrl,
  getProfileImagePaths,
  notifyUserUpdated,
} from "../../utils/userDisplay";

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
  "& .Mui-disabled": { WebkitTextFillColor: `${tickahub.textMuted} !important` },
  "& .MuiFormHelperText-root": { color: tickahub.textMuted, mt: 0.5 },
};

const sectionTitleSx = {
  color: "#fff",
  fontWeight: 800,
  fontSize: "1rem",
};

const halfCardSx = {
  flex: { xs: "none", md: 1 },
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
  overflow: "visible",
  bgcolor: tickahub.surface,
  border: `1px solid ${tickahub.borderSubtle}`,
  mb: { md: 0 },
};

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

const cardsRowSx = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { md: "stretch" },
  gap: 2,
  mb: { md: 0 },
};

const cardBodySx = {
  p: 2.5,
};

const cardHeaderSx = {
  px: 2.5,
  py: 1.75,
  flexShrink: 0,
  borderBottom: `1px solid ${tickahub.borderSubtle}`,
};

const SOCIAL_FIELDS = [
  { key: "facebook_url", label: "facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram_url", label: "instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "tiktok_url", label: "tiktok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "twitter_url", label: "twitter / X", placeholder: "https://x.com/yourhandle" },
  { key: "linkedin_url", label: "linkedin", placeholder: "https://linkedin.com/in/yourprofile" },
];

const emptyProfile = {
  full_name: "",
  email: "",
  phone: "",
  role: "",
  organization_name: "",
  address: "",
  kra_pin: "",
  pesapal_merchant_ref: "",
  bank_name: "",
  bank_account_number: "",
  organizer_status: "",
  stage_name: "",
  bio: "",
  genre: "",
  profile_image: "",
  profile_images: [],
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  twitter_url: "",
  linkedin_url: "",
  isActive: true,
  lastLogin: null,
};

const authHeaders = (json = true) => {
  const token = localStorage.getItem("token");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_ARTIST_PHOTOS = 10;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

const statusChipColor = (status) => {
  if (status === "approved" || status === "active") return tickahub.cyan;
  if (status === "pending") return tickahub.gold;
  if (status === "suspended") return "#ff6b6b";
  return tickahub.textMuted;
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
};

const ProfileCard = ({ headerBg, icon: Icon, iconColor, title, subtitle, children }) => (
  <Paper elevation={0} sx={halfCardSx}>
    <Box sx={{ ...cardHeaderSx, background: headerBg }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Icon sx={{ color: iconColor, fontSize: 20 }} />
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

const ViewField = ({ label, value, multiline = false }) => (
  <Box>
    <Typography variant="caption" sx={{ color: tickahub.textMuted, fontFamily: "monospace", fontSize: "0.72rem" }}>
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

const ViewLinkField = ({ label, value }) => {
  const trimmed = (value || "").trim();
  const href = trimmed
    ? trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`
    : "";

  return (
    <Box>
      <Typography variant="caption" sx={{ color: tickahub.textMuted, fontFamily: "monospace", fontSize: "0.72rem" }}>
        {label}
      </Typography>
      {trimmed ? (
        <Typography
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-block",
            color: tickahub.cyan,
            fontSize: "0.9rem",
            fontWeight: 600,
            mt: 0.35,
            wordBreak: "break-all",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {trimmed}
        </Typography>
      ) : (
        <Typography sx={{ color: "#fff", fontSize: "0.9rem", fontWeight: 500, mt: 0.35 }}>
          —
        </Typography>
      )}
    </Box>
  );
};

export default function MyProfile() {
  const userRole = getUserRole();
  const isArtist = userRole === "artist";
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?.id;
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const applyProfile = (u) => {
    const next = {
      full_name: u.full_name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || (isArtist ? "artist" : "event_organizer"),
      organization_name: u.organization_name || "",
      address: u.address || "",
      kra_pin: u.kra_pin || "",
      pesapal_merchant_ref: u.pesapal_merchant_ref || "",
      bank_name: u.bank_name || "",
      bank_account_number: u.bank_account_number || "",
      organizer_status: u.organizer_status || "",
      stage_name: u.stage_name || "",
      bio: u.bio || "",
      genre: u.genre || "",
      profile_image: u.profile_image || "",
      profile_images: getProfileImagePaths(u),
      facebook_url: u.facebook_url || "",
      instagram_url: u.instagram_url || "",
      tiktok_url: u.tiktok_url || "",
      twitter_url: u.twitter_url || "",
      linkedin_url: u.linkedin_url || "",
      isActive: u.isActive !== false,
      lastLogin: u.lastLogin || null,
    };
    setProfile(next);
    setSavedProfile(next);
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setProfile(savedProfile);
    setEditMode(false);
  };

  const setField = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId && !isArtist) return;
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({ icon: "error", title: "Session expired", text: "Please sign in again.", ...swalDark });
        window.location.href = "/";
        return;
      }

      try {
        setLoading(true);
        const url = isArtist ? "/api/artists/me" : `/api/users/${userId}`;
        const response = await fetch(url, { headers: authHeaders() });
        const data = await response.json();

        if (data.success && data.data) {
          applyProfile(data.data);
          notifyUserUpdated(data.data);
        } else {
          throw new Error(data.message || "Failed to load profile");
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Could not load profile",
          text: err.message,
          ...swalDark,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, isArtist]);

  const profileUrl = () => (isArtist ? "/api/artists/me" : `/api/users/${userId}`);

  const appendProfileFields = (formData) => {
    if (isArtist) {
      formData.append("full_name", profile.full_name.trim());
      formData.append("phone", profile.phone.trim());
      formData.append("stage_name", profile.stage_name.trim());
      formData.append("genre", profile.genre.trim());
      formData.append("bio", profile.bio.trim());
      SOCIAL_FIELDS.forEach(({ key }) => {
        formData.append(key, profile[key].trim());
      });
    } else {
      formData.append("full_name", profile.full_name.trim());
      formData.append("phone", profile.phone.trim());
      formData.append("organization_name", profile.organization_name.trim());
      formData.append("address", profile.address.trim());
      formData.append("kra_pin", profile.kra_pin.trim());
      formData.append("bank_name", profile.bank_name.trim());
      formData.append("bank_account_number", profile.bank_account_number.trim());
      formData.append("pesapal_merchant_ref", profile.pesapal_merchant_ref.trim());
    }
  };

  const handlePhotoSelect = async (e) => {
    const selectedFiles = isArtist
      ? Array.from(e.target.files || [])
      : [e.target.files?.[0]].filter(Boolean);
    e.target.value = "";
    if (!selectedFiles.length) return;

    for (const file of selectedFiles) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: "Use JPG, PNG, GIF, or WebP.",
          ...swalDark,
        });
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: "Maximum size is 10MB.",
          ...swalDark,
        });
        return;
      }
    }

    if (isArtist) {
      const currentCount = getProfileImagePaths(profile).length;
      if (currentCount + selectedFiles.length > MAX_ARTIST_PHOTOS) {
        Swal.fire({
          icon: "error",
          title: "Photo limit reached",
          text: `You can upload up to ${MAX_ARTIST_PHOTOS} profile photos.`,
          ...swalDark,
        });
        return;
      }
    }

    const previewUrl = isArtist ? null : URL.createObjectURL(selectedFiles[0]);
    if (previewUrl) setPhotoPreview(previewUrl);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setPhotoUploading(true);
      Swal.fire({
        title: isArtist ? "Uploading photos..." : "Uploading photo...",
        allowOutsideClick: false,
        ...swalDark,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      if (isArtist) {
        selectedFiles.forEach((file) => formData.append("profile_images", file));
      } else {
        formData.append("profile_image", selectedFiles[0]);
      }
      appendProfileFields(formData);

      const response = await fetch(profileUrl(), {
        method: "PUT",
        headers: authHeaders(false),
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload photo");
      }

      applyProfile(data.data);
      notifyUserUpdated(data.data);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPhotoPreview(null);
      }

      Swal.fire({
        icon: "success",
        title: isArtist ? "Photos updated" : "Photo updated",
        timer: 1800,
        showConfirmButton: false,
        ...swalDark,
      });
    } catch (err) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPhotoPreview(null);
      }
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: err.message,
        ...swalDark,
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async (imagePath = null) => {
    const currentImages = getProfileImagePaths(profile);
    if (isArtist) {
      if (!imagePath && !currentImages.length && !photoPreview) return;
    } else if (!profile.profile_image && !photoPreview) {
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: isArtist && imagePath ? "Remove this photo?" : "Remove photo?",
      text: isArtist && imagePath
        ? "This profile photo will be removed from your gallery."
        : isArtist
          ? "All profile photos will be removed."
          : "Your profile picture will be removed.",
      showCancelButton: true,
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: tickahub.gold,
      ...swalDark,
    });
    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setPhotoUploading(true);
      Swal.fire({
        title: "Removing photo...",
        allowOutsideClick: false,
        ...swalDark,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      if (isArtist && imagePath) {
        formData.append("remove_profile_images", JSON.stringify([imagePath]));
      } else {
        formData.append("remove_profile_image", "true");
      }
      appendProfileFields(formData);

      const response = await fetch(profileUrl(), {
        method: "PUT",
        headers: authHeaders(false),
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to remove photo");
      }

      applyProfile(data.data);
      notifyUserUpdated(data.data);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }

      Swal.fire({
        icon: "success",
        title: "Photo removed",
        timer: 1800,
        showConfirmButton: false,
        ...swalDark,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Remove failed",
        text: err.message,
        ...swalDark,
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      Swal.fire({
        title: "Saving profile...",
        allowOutsideClick: false,
        ...swalDark,
        didOpen: () => Swal.showLoading(),
      });

      const url = profileUrl();
      const body = isArtist
        ? {
            full_name: profile.full_name.trim(),
            phone: profile.phone.trim(),
            stage_name: profile.stage_name.trim(),
            genre: profile.genre.trim(),
            bio: profile.bio.trim(),
            ...Object.fromEntries(
              SOCIAL_FIELDS.map(({ key }) => [key, profile[key].trim()])
            ),
          }
        : {
            full_name: profile.full_name.trim(),
            phone: profile.phone.trim(),
            organization_name: profile.organization_name.trim(),
            address: profile.address.trim(),
            kra_pin: profile.kra_pin.trim(),
            bank_name: profile.bank_name.trim(),
            bank_account_number: profile.bank_account_number.trim(),
            pesapal_merchant_ref: profile.pesapal_merchant_ref.trim(),
          };

      const response = await fetch(url, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      applyProfile(data.data);
      notifyUserUpdated(data.data);
      setEditMode(false);

      Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your changes have been saved.",
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
      setSaving(false);
    }
  };

  const displayName = getDisplayName(profile);
  const roleLabel = profile.role || (isArtist ? "artist" : "event_organizer");
  const profileImages = getProfileImagePaths(profile);
  const avatarSrc = photoPreview || getProfileImageUrl(profile);
  const hasPhoto = Boolean(avatarSrc);
  const canAddMorePhotos = !isArtist || profileImages.length < MAX_ARTIST_PHOTOS;

  const profileHeaderActions = editMode ? (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleCancel}
        disabled={saving || photoUploading}
        startIcon={<CancelIcon sx={{ display: { xs: "none", sm: "inline-flex" } }} />}
        sx={{
          color: tickahub.textMuted,
          borderColor: tickahub.borderSubtle,
          textTransform: "none",
          fontWeight: 600,
          minWidth: { xs: "auto", sm: 64 },
          px: { xs: 1.25, sm: 2 },
        }}
      >
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
          Cancel
        </Box>
        <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
          ×
        </Box>
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={handleSave}
        disabled={saving || photoUploading}
        startIcon={
          saving ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <SaveIcon sx={{ display: { xs: "none", sm: "inline-flex" } }} />
          )
        }
        sx={{
          background: goldGradient,
          color: tickahub.navy,
          fontWeight: 700,
          textTransform: "none",
          px: { xs: 1.25, sm: 2.5 },
          minWidth: { xs: "auto", sm: 64 },
        }}
      >
        {saving ? (
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Saving...
          </Box>
        ) : (
          <>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Save profile
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Save
            </Box>
          </>
        )}
      </Button>
    </>
  ) : (
    <IconButton
      onClick={handleEdit}
      disabled={photoUploading}
      aria-label="Edit profile"
      size="small"
      sx={{
        color: tickahub.gold,
        bgcolor: `${tickahub.gold}18`,
        border: `1px solid ${tickahub.gold}44`,
        "&:hover": { bgcolor: `${tickahub.gold}30` },
      }}
    >
      <EditIcon fontSize="small" />
    </IconButton>
  );

  const profileTitle = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <BadgeIcon sx={{ color: tickahub.gold, fontSize: 20 }} />
      <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", fontSize: { xs: "1.05rem", md: "1.25rem" } }}>
        My Profile
      </Typography>
    </Stack>
  );

  if (loading) {
    return (
      <Box
        sx={{
          m: { xs: -2, md: -3 },
          minHeight: "40vh",
          background: backgroundGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: tickahub.cyan }} size={36} />
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx}>
      <Paper
        elevation={0}
        sx={{
          px: 2.5,
          py: 1.75,
          flexShrink: 0,
          borderRadius: 3,
          bgcolor: tickahub.surface,
          border: `1px solid ${tickahub.borderSubtle}`,
          background: `linear-gradient(135deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 100%)`,
        }}
      >
        <Stack spacing={{ xs: 1.5, md: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            {profileTitle}
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
              {profileHeaderActions}
            </Stack>
          </Stack>

          <Stack
            direction="row"
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            flexWrap={{ md: "wrap" }}
            gap={2}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  src={avatarSrc || undefined}
                  sx={{
                    width: { xs: 64, md: 72 },
                    height: { xs: 64, md: 72 },
                    border: `3px solid ${tickahub.gold}`,
                    background: isArtist ? cyanGradient : goldGradient,
                    color: tickahub.navy,
                    fontWeight: 800,
                    fontSize: "1.25rem",
                  }}
                >
                  {getInitials(displayName)}
                </Avatar>
                <IconButton
                  size="small"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: "absolute",
                    right: -4,
                    bottom: -4,
                    bgcolor: tickahub.cyan,
                    color: tickahub.navy,
                    width: 28,
                    height: 28,
                    border: `2px solid ${tickahub.surface}`,
                    "&:hover": { bgcolor: tickahub.cyanDark },
                  }}
                >
                  {photoUploading ? <CircularProgress size={14} color="inherit" /> : <PhotoCameraIcon sx={{ fontSize: 16 }} />}
                </IconButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  multiple={isArtist}
                  hidden
                  onChange={handlePhotoSelect}
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: { xs: "none", md: "block" } }}>{profileTitle}</Box>
                <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>
                  {displayName}
                  {!isArtist && profile.organizer_status ? ` · ${profile.organizer_status}` : ""}
                </Typography>
                <Typography sx={{ color: tickahub.textMuted, fontSize: "0.75rem", mt: 0.25 }}>
                  Last login: {formatDate(profile.lastLogin)}
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                  {canAddMorePhotos && (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={photoUploading}
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={<PhotoCameraIcon />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: tickahub.cyan,
                        borderColor: `${tickahub.cyan}55`,
                        "&:hover": { borderColor: tickahub.cyan, bgcolor: `${tickahub.cyan}10` },
                      }}
                    >
                      {isArtist
                        ? profileImages.length
                          ? "Add photos"
                          : "Add photos"
                        : hasPhoto
                          ? "Change photo"
                          : "Add photo"}
                    </Button>
                  )}
                  {hasPhoto && (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={photoUploading}
                      onClick={() => handleRemovePhoto()}
                      startIcon={<DeletePhotoIcon />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "#ff8a8a",
                        borderColor: "rgba(255,138,138,0.4)",
                        "&:hover": { borderColor: "#ff8a8a", bgcolor: "rgba(255,138,138,0.08)" },
                      }}
                    >
                      {isArtist ? "Remove all" : "Remove"}
                    </Button>
                  )}
                </Stack>
                {isArtist && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography sx={{ color: tickahub.textMuted, fontSize: "0.75rem", mb: 1 }}>
                      Profile gallery ({profileImages.length}/{MAX_ARTIST_PHOTOS})
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {profileImages.map((imagePath) => (
                        <Box key={imagePath} sx={{ position: "relative" }}>
                          <Avatar
                            variant="rounded"
                            src={getProfileImageUrl({ profile_image: imagePath }) || undefined}
                            sx={{
                              width: 72,
                              height: 72,
                              border: `2px solid ${tickahub.borderSubtle}`,
                              bgcolor: tickahub.navy,
                            }}
                          >
                            {getInitials(displayName)}
                          </Avatar>
                          <IconButton
                            size="small"
                            disabled={photoUploading}
                            onClick={() => handleRemovePhoto(imagePath)}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 24,
                              height: 24,
                              bgcolor: "#ff6b6b",
                              color: "#fff",
                              border: `2px solid ${tickahub.surface}`,
                              "&:hover": { bgcolor: "#ff5252" },
                            }}
                          >
                            <DeletePhotoIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                      {canAddMorePhotos && (
                        <IconButton
                          disabled={photoUploading}
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 2,
                            border: `1px dashed ${tickahub.cyan}66`,
                            color: tickahub.cyan,
                            bgcolor: `${tickahub.cyan}08`,
                            "&:hover": { bgcolor: `${tickahub.cyan}16` },
                          }}
                        >
                          <PhotoCameraIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              sx={{ display: { xs: "none", md: "flex" }, flexShrink: 0 }}
            >
              {profileHeaderActions}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={cardsRowSx}>
        {isArtist ? (
          <>
            <ProfileCard
              headerBg={`linear-gradient(135deg, ${tickahub.gold}22, transparent)`}
              icon={MusicIcon}
              iconColor={tickahub.gold}
              title="Artist profile"
              subtitle="Stage identity and contact details"
            >
              <Stack spacing={1.5}>
                {editMode ? (
                  <>
                    <TextField
                      label="stage_name"
                      size="small"
                      fullWidth
                      value={profile.stage_name}
                      onChange={(e) => setField("stage_name", e.target.value)}
                      sx={fieldSx}
                    />
                    <TextField
                      label="full_name"
                      size="small"
                      fullWidth
                      value={profile.full_name}
                      onChange={(e) => setField("full_name", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField label="email" size="small" fullWidth value={profile.email} disabled sx={fieldSx} />
                    <TextField
                      label="phone"
                      size="small"
                      fullWidth
                      value={profile.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="genre"
                      size="small"
                      fullWidth
                      value={profile.genre}
                      onChange={(e) => setField("genre", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MusicIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </>
                ) : (
                  <>
                    <ViewField label="stage_name" value={profile.stage_name} />
                    <ViewField label="full_name" value={profile.full_name} />
                    <ViewField label="email" value={profile.email} />
                    <ViewField label="phone" value={profile.phone} />
                    <ViewField label="genre" value={profile.genre} />
                  </>
                )}
                <MetaChips roleLabel={roleLabel} isActive={profile.isActive} />
              </Stack>
            </ProfileCard>

            <ProfileCard
              headerBg={`linear-gradient(135deg, ${tickahub.cyan}22, transparent)`}
              icon={BioIcon}
              iconColor={tickahub.cyan}
              title="About"
              subtitle="Tell fans about yourself"
            >
              <Stack spacing={1.5}>
                {editMode ? (
                  <TextField
                    label="bio"
                    size="small"
                    fullWidth
                    multiline
                    minRows={4}
                    value={profile.bio}
                    onChange={(e) => setField("bio", e.target.value)}
                    placeholder="Your story, style, and what fans can expect..."
                    sx={fieldSx}
                  />
                ) : (
                  <ViewField label="bio" value={profile.bio} multiline />
                )}
              </Stack>
            </ProfileCard>

            <ProfileCard
              headerBg={`linear-gradient(135deg, ${tickahub.gold}18, transparent)`}
              icon={ShareIcon}
              iconColor={tickahub.gold}
              title="Social media"
              subtitle="Links fans can follow"
            >
              <Stack spacing={1.5}>
                {editMode
                  ? SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                      <TextField
                        key={key}
                        label={label}
                        size="small"
                        fullWidth
                        value={profile[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder={placeholder}
                        sx={fieldSx}
                      />
                    ))
                  : SOCIAL_FIELDS.map(({ key, label }) => (
                      <ViewLinkField key={key} label={label} value={profile[key]} />
                    ))}
              </Stack>
            </ProfileCard>
          </>
        ) : (
          <>
            <ProfileCard
              headerBg={`linear-gradient(135deg, ${tickahub.gold}22, transparent)`}
              icon={BusinessIcon}
              iconColor={tickahub.gold}
              title="Organization"
              subtitle="Company and contact information"
            >
              <Stack spacing={1.5}>
                {editMode ? (
                  <>
                    <TextField
                      label="organization_name"
                      size="small"
                      fullWidth
                      value={profile.organization_name}
                      onChange={(e) => setField("organization_name", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="full_name"
                      size="small"
                      fullWidth
                      value={profile.full_name}
                      onChange={(e) => setField("full_name", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="email"
                      size="small"
                      fullWidth
                      value={profile.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="phone"
                      size="small"
                      fullWidth
                      value={profile.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="address"
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      value={profile.address}
                      onChange={(e) => setField("address", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </>
                ) : (
                  <>
                    <ViewField label="organization_name" value={profile.organization_name} />
                    <ViewField label="full_name" value={profile.full_name} />
                    <ViewField label="email" value={profile.email} />
                    <ViewField label="phone" value={profile.phone} />
                    <ViewField label="address" value={profile.address} multiline />
                  </>
                )}
                <MetaChips
                  roleLabel={roleLabel}
                  isActive={profile.isActive}
                  organizerStatus={profile.organizer_status}
                />
              </Stack>
            </ProfileCard>

            <ProfileCard
              headerBg={`linear-gradient(135deg, ${tickahub.cyan}22, transparent)`}
              icon={BankIcon}
              iconColor={tickahub.cyan}
              title="Business & payments"
              subtitle="Tax, banking, and payout details"
            >
              <Stack spacing={1.5}>
                {editMode ? (
                  <>
                    <TextField
                      label="kra_pin"
                      size="small"
                      fullWidth
                      value={profile.kra_pin}
                      onChange={(e) => setField("kra_pin", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCardIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="bank_name"
                      size="small"
                      fullWidth
                      value={profile.bank_name}
                      onChange={(e) => setField("bank_name", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BankIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="bank_account_number"
                      size="small"
                      fullWidth
                      value={profile.bank_account_number}
                      onChange={(e) => setField("bank_account_number", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCardIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      label="pesapal_merchant_ref"
                      size="small"
                      fullWidth
                      value={profile.pesapal_merchant_ref}
                      onChange={(e) => setField("pesapal_merchant_ref", e.target.value)}
                      helperText="Pesapal merchant reference for payment processing"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCardIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </>
                ) : (
                  <>
                    <ViewField label="kra_pin" value={profile.kra_pin} />
                    <ViewField label="bank_name" value={profile.bank_name} />
                    <ViewField label="bank_account_number" value={profile.bank_account_number} />
                    <ViewField label="pesapal_merchant_ref" value={profile.pesapal_merchant_ref} />
                  </>
                )}
              </Stack>
            </ProfileCard>
          </>
        )}
      </Box>
    </Box>
  );
}

function MetaChips({ roleLabel, isActive, organizerStatus }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: tickahub.textMuted, fontFamily: "monospace" }}>
        account
      </Typography>
      <Box mt={0.5} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={roleLabel}
          size="small"
          sx={{ bgcolor: `${tickahub.gold}22`, color: tickahub.gold, fontWeight: 700, height: 24 }}
        />
        {organizerStatus && (
          <Chip
            label={organizerStatus}
            size="small"
            sx={{
              bgcolor: `${statusChipColor(organizerStatus)}22`,
              color: statusChipColor(organizerStatus),
              fontWeight: 700,
              height: 24,
            }}
          />
        )}
        <Chip
          label={isActive ? "active" : "inactive"}
          size="small"
          sx={{
            bgcolor: isActive ? `${tickahub.cyan}22` : "rgba(255,107,107,0.15)",
            color: isActive ? tickahub.cyan : "#ff6b6b",
            fontWeight: 700,
            height: 24,
          }}
        />
      </Box>
    </Box>
  );
}
