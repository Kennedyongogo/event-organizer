// import "../Styles/login.scss";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  Snackbar,
  Alert,
  Grid,
  Container,
  Stack,
  Divider,
  Fade,
  Slide,
  Zoom,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const images = ["/beth1.jpg", "/beth2.jpg", "/beth3.jpg"];

export default function LoginPage(props) {
  const theme = useTheme();
  const rfEmail = useRef();
  const rsEmail = useRef();
  const rfPassword = useRef();
  const code = useRef();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [body, updateBody] = useState({
    email: null,
  });

  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [severity, setSeverity] = useState("error");
  const navigate = useNavigate();

  const login = async (e) => {
    if (e) e.preventDefault();

    let d = body;
    d.email = rfEmail.current.value.toLowerCase().trim();
    d.password = rfPassword.current.value;
    updateBody(d);

    if (!validateEmail(body.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    if (!validatePassword(body.password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    if (validateEmail(body.email) && validatePassword(body.password)) {
      setLoading(true);
      Swal.fire({
        title: "Signing in...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch("/api/admins/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: data.message,
            confirmButtonColor: theme.palette.primary.main,
          });
        } else {
          // Check if login was successful
          if (data.success) {
            Swal.fire({
              icon: "success",
              title: "Success!",
              text: data.message,
              timer: 1500,
              showConfirmButton: false,
            });
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("userRole", data.data.admin.role);
            localStorage.setItem("user", JSON.stringify(data.data.admin));
            setTimeout(() => {
              navigate("/analytics");
            }, 1500);
          } else {
            Swal.fire({
              icon: "error",
              title: "Login Failed",
              text: data.message,
              confirmButtonColor: theme.palette.primary.main,
            });
          }
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Login failed. Please try again.",
          confirmButtonColor: theme.palette.primary.main,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = async () => {
    let d = { Email: rsEmail.current.value.toLowerCase().trim() };

    if (!validateEmail(d.Email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    if (validateEmail(d.Email)) {
      setResetLoading(true);
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch("/api/admins/forgot-password", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(d),
        });
        const data = await response.json();

        if (response.ok) {
          setOpenResetDialog(false);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message,
            confirmButtonColor: theme.palette.primary.main,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message,
            confirmButtonColor: theme.palette.primary.main,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
          confirmButtonColor: theme.palette.primary.main,
        });
      } finally {
        setResetLoading(false);
      }
    }
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  useEffect(() => {
    let currentIndex = 0;
    const backgroundElement = document.querySelector(".login-background");

    // Preload images
    images.forEach((imageSrc) => {
      const img = new Image();
      img.src = imageSrc;
    });

    const changeBackground = () => {
      if (backgroundElement) {
        // Fade out current image
        backgroundElement.style.opacity = 0;

        setTimeout(() => {
          currentIndex = (currentIndex + 1) % images.length;
          backgroundElement.style.backgroundImage = `url(${images[currentIndex]})`;
          // Fade in new image
          backgroundElement.style.opacity = 1;
        }, 500);
      }
    };

    // Initial setup
    if (backgroundElement) {
      backgroundElement.style.transition = "opacity 1s ease-in-out";
      backgroundElement.style.opacity = 1;
    }

    const intervalId = setInterval(changeBackground, 5000); // Change every 5 seconds for testing

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      position="relative"
      sx={{ overflow: "hidden" }}
    >
      <div
        className="login-background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "opacity 1s ease-in-out",
          backgroundColor: "#2c3e50", // Professional dark blue background
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)`,
          backdropFilter: "blur(0px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center"
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <Fade in timeout={1000}>
                <Stack
                  spacing={4}
                  alignItems={{ xs: "center", md: "flex-start" }}
                >
                  <Slide direction="up" in timeout={1200}>
                    <Box>
                      <Typography
                        variant="h2"
                        sx={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                          textAlign: { xs: "center", md: "left" },
                          letterSpacing: "1px",
                          mb: 2,
                          background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Betheltus Construction LTD
                      </Typography>
                    </Box>
                  </Slide>
                </Stack>
              </Fade>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Slide direction="left" in timeout={1500}>
                <Card
                  elevation={0}
                  sx={{
                    p: 4,
                    maxWidth: 450,
                    width: "100%",
                    borderRadius: 4,
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(25px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  <form onSubmit={login}>
                    <Typography
                      textAlign="center"
                      fontWeight="700"
                      color="white"
                      variant="h4"
                      sx={{
                        mb: 3,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        letterSpacing: "1px",
                      }}
                    >
                      Sign In
                    </Typography>

                    <TextField
                      inputRef={rfEmail}
                      type="email"
                      label="Email Address"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: "rgba(255,255,255,0.7)" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          borderRadius: 3,
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            border: `2px solid ${theme.palette.primary.light}`,
                            boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.8)",
                          "&.Mui-focused": {
                            color: theme.palette.primary.light,
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "white",
                          "&::placeholder": {
                            color: "rgba(255, 255, 255, 0.6)",
                          },
                        },
                      }}
                    />

                    <TextField
                      inputRef={rfPassword}
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: "rgba(255,255,255,0.7)" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          borderRadius: 3,
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            border: `2px solid ${theme.palette.primary.light}`,
                            boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.8)",
                          "&.Mui-focused": {
                            color: theme.palette.primary.light,
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "white",
                          "&::placeholder": {
                            color: "rgba(255, 255, 255, 0.6)",
                          },
                        },
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="white"
                      align="center"
                      sx={{
                        mt: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          textDecoration: "underline",
                          color: theme.palette.primary.light,
                          transform: "scale(1.05)",
                        },
                      }}
                      onClick={() => setOpenResetDialog(true)}
                    >
                      Forgot password? Click here
                    </Typography>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Login />
                        )
                      }
                      sx={{
                        mt: 3,
                        py: 1.5,
                        borderRadius: 3,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                        transition: "all 0.3s ease",
                        textTransform: "none",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        "&:hover": {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          boxShadow: `0 6px 20px ${theme.palette.primary.main}60`,
                          transform: "translateY(-2px)",
                        },
                        "&:disabled": {
                          background: "rgba(255, 255, 255, 0.2)",
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Card>
              </Slide>
            </Grid>
          </Grid>

          {/* Footer with logos */}
          <Fade in timeout={2000}>
            <Box
              sx={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(25px)",
                p: 2,
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.15)",
                  transform: "translateX(-50%) translateY(-2px)",
                },
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#fff",
                    display: "block",
                    textAlign: "center",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                  }}
                >
                  Powered by
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  Carl Solutions
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Slide}
        transitionDuration={300}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            color: "white",
            fontWeight: 600,
          }}
        >
          Reset Password
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter your email address to reset your password.
          </DialogContentText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            <TextField
              inputRef={rsEmail}
              type="email"
              label="Email Address"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <DialogActions sx={{ mt: 2 }}>
              <Button
                onClick={() => setOpenResetDialog(false)}
                variant="outlined"
                color="primary"
                disabled={resetLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={resetLoading}
                startIcon={resetLoading ? <CircularProgress size={16} /> : null}
              >
                {resetLoading ? "Processing..." : "Submit"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
