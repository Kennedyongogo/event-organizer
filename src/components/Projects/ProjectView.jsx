import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Construction as ProjectIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Engineering as EngineerIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as TaskIcon,
  Build as MaterialIcon,
  Construction as EquipmentIcon,
  TrendingUp as ProgressIcon,
  Warning as IssueIcon,
  Notes as NotesIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as WordIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import QuotationGenerator from "./QuotationGenerator";

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: "",
    fileName: "",
    type: "",
  });
  const [quotationModal, setQuotationModal] = useState(false);

  // Helper to build URL for uploaded assets using Vite proxy
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Use relative URLs - Vite proxy will handle routing to backend
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProject(result.data);
      } else {
        setError(result.message || "Failed to fetch project details");
      }
    } catch (err) {
      setError("Failed to fetch project details");
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "planning":
        return "info";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "on_hold":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount, currency = "KES") => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getFileType = (fileName) => {
    const extension = fileName.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    } else if (["doc", "docx"].includes(extension)) {
      return "word";
    } else if (["xls", "xlsx"].includes(extension)) {
      return "excel";
    }
    return "document";
  };

  const getFileIcon = (fileName) => {
    const type = getFileType(fileName);
    switch (type) {
      case "image":
        return <ImageIcon sx={{ fontSize: 48, color: "white", mb: 1 }} />;
      case "pdf":
        return <PdfIcon sx={{ fontSize: 48, color: "#f44336", mb: 1 }} />;
      case "word":
        return <WordIcon sx={{ fontSize: 48, color: "#2196f3", mb: 1 }} />;
      case "excel":
        return <WordIcon sx={{ fontSize: 48, color: "#4caf50", mb: 1 }} />;
      default:
        return <ImageIcon sx={{ fontSize: 48, color: "white", mb: 1 }} />;
    }
  };

  const handleDocumentClick = (fileUrl, fileName) => {
    const fullUrl = buildImageUrl(fileUrl);
    const type = getFileType(fileName);

    if (type === "image") {
      setPreviewModal({
        open: true,
        url: fullUrl,
        fileName: fileName,
        type: type,
      });
    } else {
      // For other file types, open in new tab for download
      window.open(fullUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Project not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="lg" sx={{ px: 0 }}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
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
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            position="relative"
            zIndex={1}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/projects")}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Back
              </Button>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {project.name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Project Details
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                onClick={() => setQuotationModal(true)}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                Generate Quotation
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/projects/${id}/edit`)}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                Edit Project
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ProjectIcon sx={{ color: "#667eea" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Basic Information
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ProjectIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Project Status
                        </Typography>
                        <Chip
                          label={project.status?.toUpperCase()}
                          color={getStatusColor(project.status)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Location
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.location_name || "Not specified"}
                          </Typography>
                          {project.latitude && project.longitude && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#999",
                                fontFamily: "monospace",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              Coordinates:{" "}
                              {parseFloat(project.latitude).toFixed(6)},{" "}
                              {parseFloat(project.longitude).toFixed(6)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {project.latitude && project.longitude && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocationIcon />}
                          onClick={() => {
                            navigate(`/map`, {
                              state: {
                                centerCoordinates: [
                                  parseFloat(project.longitude),
                                  parseFloat(project.latitude),
                                ],
                              },
                            });
                          }}
                          sx={{
                            color: "#667eea",
                            borderColor: "#667eea",
                            "&:hover": {
                              borderColor: "#667eea",
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                            },
                          }}
                        >
                          View Location
                        </Button>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Start Date
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatDate(project.start_date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          End Date
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatDate(project.end_date)}
                        </Typography>
                      </Box>
                    </Box>
                    {project.floor_size && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProjectIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Floor Size
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.floor_size} m²
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {project.construction_type && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProjectIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Construction Type
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.construction_type
                              .replace("_", " ")
                              .toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {project.notes && (
                      <Box display="flex" alignItems="flex-start" gap={1}>
                        <NotesIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Notes
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.notes}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial & Progress */}
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <MoneyIcon sx={{ color: "#f093fb" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Financial & Progress
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Budget Estimate
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatCurrency(
                            project.budget_estimate,
                            project.currency
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Actual Cost
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {formatCurrency(
                            project.actual_cost,
                            project.currency
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ProjectIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Progress
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {project.progress_percent || 0}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccountBalanceIcon />
                      <Box>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Funding Source
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {project.funding_source || "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Description */}
            {project.description && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <DescriptionIcon sx={{ color: "#4facfe" }} />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Description
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: "#333" }}>
                      {project.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Stakeholders */}
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  backgroundColor: "white",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ProjectIcon sx={{ color: "#4facfe" }} />
                    <Typography variant="h5" sx={{ color: "#333" }}>
                      Project Stakeholders
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <BusinessIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Contractor
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.contractor_name || "Not specified"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <BusinessIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Client
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.client_name || "Not specified"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AccountBalanceIcon />
                        <Box>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Funding Source
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {project.funding_source || "Not specified"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Project Blueprints */}
            {project.blueprint_url && project.blueprint_url.length > 0 && (
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <ProjectIcon sx={{ color: "#ff6b6b" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Project Blueprints ({project.blueprint_url.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.blueprint_url.map((url, index) => {
                        const fileName =
                          url.split("/").pop() || `Blueprint ${index + 1}`;
                        const isImage = fileName.match(
                          /\.(jpg|jpeg|png|gif|bmp|webp)$/i
                        );

                        // Construct full URL for the image (same as Users component)
                        const fullImageUrl = buildImageUrl(url);

                        return (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                cursor: "pointer",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                              onClick={() => {
                                window.open(fullImageUrl, "_blank");
                              }}
                            >
                              {isImage ? (
                                <Box>
                                  <img
                                    src={fullImageUrl}
                                    alt={fileName}
                                    style={{
                                      width: "100%",
                                      height: "150px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      marginBottom: "8px",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "block";
                                    }}
                                  />
                                  <Box
                                    textAlign="center"
                                    sx={{ display: "none" }}
                                  >
                                    <ImageIcon
                                      sx={{
                                        fontSize: 48,
                                        color: "white",
                                        mb: 1,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "white",
                                        display: "block",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {fileName}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#333",
                                      textAlign: "center",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      display: "block",
                                      textAlign: "center",
                                    }}
                                  >
                                    Click to view full size
                                  </Typography>
                                </Box>
                              ) : (
                                <Box textAlign="center">
                                  <ImageIcon
                                    sx={{ fontSize: 48, color: "#666", mb: 1 }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#333",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      display: "block",
                                    }}
                                  >
                                    Click to download
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Documents */}
            {project.document_urls && project.document_urls.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <UploadIcon sx={{ color: "#fa709a" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Project Documents ({project.document_urls.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.document_urls.map((fileUrl, index) => {
                        const fileName =
                          fileUrl.split("/").pop() || `Document ${index + 1}`;
                        const fileType = getFileType(fileName);
                        const isImage = fileType === "image";

                        return (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: "#f8f9fa",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                cursor: "pointer",
                                transition: "transform 0.2s ease-in-out",
                                position: "relative",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                              onClick={() =>
                                handleDocumentClick(fileUrl, fileName)
                              }
                            >
                              {isImage ? (
                                <Box>
                                  <img
                                    src={buildImageUrl(fileUrl)}
                                    alt={fileName}
                                    style={{
                                      width: "100%",
                                      height: "150px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      marginBottom: "8px",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "block";
                                    }}
                                  />
                                  <Box
                                    textAlign="center"
                                    sx={{ display: "none" }}
                                  >
                                    {getFileIcon(fileName)}
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "white",
                                        display: "block",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {fileName}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#333",
                                      textAlign: "center",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      display: "block",
                                      textAlign: "center",
                                    }}
                                  >
                                    Click to view full size
                                  </Typography>
                                </Box>
                              ) : fileType === "pdf" ? (
                                <Box>
                                  <iframe
                                    src={buildImageUrl(fileUrl)}
                                    style={{
                                      width: "100%",
                                      height: "200px",
                                      border: "none",
                                      borderRadius: "8px",
                                      marginBottom: "8px",
                                    }}
                                    title={fileName}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#333",
                                      textAlign: "center",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      display: "block",
                                      textAlign: "center",
                                    }}
                                  >
                                    PDF Preview
                                  </Typography>
                                  <Tooltip title="Download PDF" placement="top">
                                    <DownloadIcon
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        fontSize: 20,
                                        color: "#666",
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          buildImageUrl(fileUrl),
                                          "_blank"
                                        );
                                      }}
                                    />
                                  </Tooltip>
                                </Box>
                              ) : (
                                <Box textAlign="center">
                                  {getFileIcon(fileName)}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#333",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      display: "block",
                                    }}
                                  >
                                    Click to download
                                  </Typography>
                                  <Tooltip
                                    title="Download Document"
                                    placement="top"
                                  >
                                    <DownloadIcon
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        fontSize: 20,
                                        color: "#666",
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          buildImageUrl(fileUrl),
                                          "_blank"
                                        );
                                      }}
                                    />
                                  </Tooltip>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Engineer Info */}
            {project.engineer && (
              <Grid item xs={12} sx={{ width: "100%" }}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    width: "100%",
                    maxWidth: "none",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <EngineerIcon sx={{ color: "#43e97b" }} />
                      <Typography variant="h5" sx={{ color: "#333" }}>
                        Engineer in Charge
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "#667eea" }}>
                        {project.engineer.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: "#333" }}>
                          {project.engineer.name}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={0.5}
                        >
                          <EmailIcon sx={{ fontSize: 16, color: "#666" }} />
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            {project.engineer.email}
                          </Typography>
                        </Box>
                        {project.engineer.phone && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon sx={{ fontSize: 16, color: "#666" }} />
                            <Typography variant="body2" sx={{ color: "#666" }}>
                              {project.engineer.phone}
                            </Typography>
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          sx={{ color: "#999", mt: 0.5 }}
                        >
                          Role:{" "}
                          {project.engineer.role
                            ?.replace("_", " ")
                            .toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Tasks */}
            {project.tasks && project.tasks.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <TaskIcon sx={{ color: "#667eea" }} />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Project Tasks ({project.tasks.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.tasks.map((task, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                            >
                              {task.title || task.name || `Task ${index + 1}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {task.description ||
                                task.status ||
                                "No description"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Materials */}
            {project.materials && project.materials.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <MaterialIcon sx={{ color: "#f093fb" }} />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Materials ({project.materials.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.materials.map((material, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                            >
                              {material.name ||
                                material.title ||
                                `Material ${index + 1}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {material.description ||
                                material.type ||
                                "No description"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Equipment */}
            {project.equipment && project.equipment.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <EquipmentIcon />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Equipment ({project.equipment.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.equipment.map((equipment, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                            >
                              {equipment.name ||
                                equipment.title ||
                                `Equipment ${index + 1}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {equipment.description ||
                                equipment.type ||
                                "No description"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Budgets */}
            {project.budgets && project.budgets.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <MoneyIcon />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Budget Details ({project.budgets.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.budgets.map((budget, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                            >
                              {budget.category ||
                                budget.name ||
                                `Budget ${index + 1}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              Amount:{" "}
                              {formatCurrency(budget.amount, project.currency)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Progress Updates */}
            {project.progressUpdates && project.progressUpdates.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <ProgressIcon />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Progress Updates ({project.progressUpdates.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.progressUpdates.map((update, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                            >
                              {update.title ||
                                update.description ||
                                `Update ${index + 1}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {update.date
                                ? formatDate(update.date)
                                : "No date"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Project Issues */}
            {project.issues && project.issues.length > 0 && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <IssueIcon />
                      <Typography variant="h6" sx={{ color: "#333" }}>
                        Project Issues ({project.issues.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {project.issues.map((issue, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 1, color: "#333" }}
                            >
                              {issue.title ||
                                issue.description ||
                                `Issue ${index + 1}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {issue.status || issue.priority || "No status"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>

      {/* Image Preview Modal (for images only) */}
      {previewModal.open && previewModal.type === "image" && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() =>
            setPreviewModal({ open: false, url: "", fileName: "", type: "" })
          }
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              p: 2,
              maxWidth: "90%",
              maxHeight: "90%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">{previewModal.fileName}</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => window.open(previewModal.url, "_blank")}
                  sx={{ mr: 1 }}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setPreviewModal({
                      open: false,
                      url: "",
                      fileName: "",
                      type: "",
                    })
                  }
                >
                  Close
                </Button>
              </Box>
            </Box>

            <img
              src={previewModal.url}
              alt={previewModal.fileName}
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </Box>
        </Box>
      )}

      {/* Quotation Generator Modal */}
      <QuotationGenerator
        projectId={id}
        projectName={project?.name}
        open={quotationModal}
        onClose={() => setQuotationModal(false)}
      />
    </Box>
  );
};

export default ProjectView;
