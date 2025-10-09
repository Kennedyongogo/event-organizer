import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
  Business,
  Person,
  Email,
  Phone,
  LocationOn,
  AccountBalance,
  Language,
  CreditCard,
  CheckCircle,
  Pending,
  Block,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const MyProfile = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    organization_name: "",
    contact_person: "",
    email: "",
    phone_number: "",
    address: "",
    kra_pin: "",
    pesapal_merchant_ref: "",
    bank_name: "",
    bank_account_number: "",
    website: "",
    logo: "",
    status: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again",
        });
        window.location.href = "/";
        return;
      }

      const response = await fetch(`/api/organizers/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(data.data);
        setOriginalData(data.data);
        if (data.data.logo) {
          setLogoPreview(
            data.data.logo.startsWith("http")
              ? data.data.logo
              : `/${data.data.logo}`
          );
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load profile data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Logo must be less than 5MB",
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setLogoPreview(
      originalData.logo
        ? originalData.logo.startsWith("http")
          ? originalData.logo
          : `/${originalData.logo}`
        : null
    );
    setLogoFile(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const formData = new FormData();
      formData.append("organization_name", profileData.organization_name);
      formData.append("contact_person", profileData.contact_person);
      formData.append("email", profileData.email);
      formData.append("phone_number", profileData.phone_number);
      formData.append("address", profileData.address || "");
      formData.append("kra_pin", profileData.kra_pin || "");
      formData.append(
        "pesapal_merchant_ref",
        profileData.pesapal_merchant_ref || ""
      );
      formData.append("bank_name", profileData.bank_name || "");
      formData.append(
        "bank_account_number",
        profileData.bank_account_number || ""
      );
      formData.append("website", profileData.website || "");

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch(`/api/organizers/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        setOriginalData(data.data);
        setProfileData(data.data);
        setEditMode(false);
        setLogoFile(null);

        // Update localStorage
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
      case "active":
        return <CheckCircle />;
      case "pending":
        return <Pending />;
      case "suspended":
        return <Block />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 4,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                My Profile
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage your organization profile and settings
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "0 8px 25px rgba(255, 107, 107, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #FF5252, #26A69A)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 35px rgba(255, 107, 107, 0.4)",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      borderRadius: 3,
                      px: 3,
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      background: "linear-gradient(45deg, #27ae60, #2ecc71)",
                      borderRadius: 3,
                      px: 4,
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 8px 25px rgba(39, 174, 96, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #229954, #27ae60)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Profile Content */}
        <Box sx={{ p: 4 }}>
          {/* Logo and Status Section - Full Width Horizontal */}
          <Card
            sx={{
              p: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3,
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* Logo */}
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={logoPreview}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <Business sx={{ fontSize: 60 }} />
                </Avatar>
                {editMode && (
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 5,
                      right: 5,
                      background: "white",
                      color: "#667eea",
                      "&:hover": {
                        background: "#f0f0f0",
                      },
                    }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </IconButton>
                )}
              </Box>

              {/* Organization Name and Status */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  {profileData.organization_name}
                </Typography>
                <Chip
                  icon={getStatusIcon(profileData.status)}
                  label={profileData.status?.toUpperCase()}
                  color={getStatusColor(profileData.status)}
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    px: 3,
                    py: 1.5,
                    height: "auto",
                  }}
                />
              </Box>
            </Box>
          </Card>

          {/* Organization Information - Full Width */}
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(102, 126, 234, 0.05)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, color: "#667eea" }}
            >
              Organization Information
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Organization Name"
                value={profileData.organization_name}
                onChange={(e) =>
                  handleInputChange("organization_name", e.target.value)
                }
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Contact Person"
                value={profileData.contact_person}
                onChange={(e) =>
                  handleInputChange("contact_person", e.target.value)
                }
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Email Address"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phone_number}
                onChange={(e) =>
                  handleInputChange("phone_number", e.target.value)
                }
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
            </Stack>
          </Card>

          {/* Additional Details */}
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(102, 126, 234, 0.05)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, color: "#667eea" }}
            >
              Business Details
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Address"
                value={profileData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!editMode}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="KRA PIN"
                value={profileData.kra_pin}
                onChange={(e) => handleInputChange("kra_pin", e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCard sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Website"
                value={profileData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Language sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
            </Stack>
          </Card>

          {/* Banking & Payment Details */}
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(102, 126, 234, 0.05)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, color: "#667eea" }}
            >
              Banking & Payment Information
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Bank Name"
                value={profileData.bank_name}
                onChange={(e) => handleInputChange("bank_name", e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Bank Account Number"
                value={profileData.bank_account_number}
                onChange={(e) =>
                  handleInputChange("bank_account_number", e.target.value)
                }
                disabled={!editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCard sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Pesapal Merchant Reference"
                value={profileData.pesapal_merchant_ref}
                onChange={(e) =>
                  handleInputChange("pesapal_merchant_ref", e.target.value)
                }
                disabled={!editMode}
                helperText="Your Pesapal merchant reference for payment processing"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCard sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: editMode ? "white" : "rgba(0, 0, 0, 0.02)",
                  },
                }}
              />
            </Stack>
          </Card>
        </Box>
      </Paper>
    </Box>
  );
};

export default MyProfile;
