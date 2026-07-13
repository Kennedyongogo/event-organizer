import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
  MicExternalOn,
  Person,
  Storefront,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { tickahub, goldGradient, cyanGradient, backgroundGradient } from "../tickahubTheme";
import ArtistGenreField from "./Profile/ArtistGenreField";
import "./loginSplit.css";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: tickahub.navyLight,
    borderRadius: 3,
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: tickahub.borderLight },
    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.28)" },
    "&.Mui-focused fieldset": { borderColor: tickahub.gold, borderWidth: 2 },
    "&.Mui-focused": { boxShadow: `0 0 0 4px ${tickahub.gold}22` },
  },
  "& .MuiInputLabel-root": {
    color: tickahub.textMuted,
    "&.Mui-focused": { color: tickahub.gold },
  },
  "& .MuiInputBase-input": { color: "#fff" },
  "& .MuiInputBase-input::placeholder": { color: tickahub.textMuted, opacity: 1 },
};

const tabSx = {
  mb: 2.5,
  minHeight: 40,
  "& .MuiTab-root": {
    color: tickahub.textMuted,
    fontWeight: 700,
    textTransform: "none",
    minHeight: 40,
    fontSize: "0.875rem",
  },
  "& .Mui-selected": { color: tickahub.gold },
  "& .MuiTabs-indicator": { background: goldGradient, height: 3, borderRadius: 2 },
};

const compactFieldSx = {
  ...fieldSx,
  "& .MuiFormControl-root": { my: 0.85 },
  "& .MuiInputBase-root": { fontSize: "0.95rem" },
  "& .MuiInputBase-input": { py: 1.35 },
};

const swalDark = {
  confirmButtonColor: tickahub.gold,
  background: tickahub.surface,
  color: "#fff",
};

const pillBtnSx = {
  mt: 2.5,
  py: 1.6,
  borderRadius: 3,
  fontWeight: 800,
  fontSize: "0.95rem",
  boxShadow: `0 8px 24px ${tickahub.gold}44`,
  "&:hover": {
    boxShadow: `0 12px 28px ${tickahub.gold}55`,
    transform: "translateY(-1px)",
  },
};

function PasswordToggle({ show, onToggle }) {
  return (
    <InputAdornment position="end">
      <IconButton
        onClick={onToggle}
        edge="end"
        aria-label="toggle password visibility"
        sx={{ color: tickahub.textMuted }}
      >
        {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );
}

function AccountTypeTabs({ value, onChange }) {
  return (
    <Tabs value={value} onChange={onChange} variant="fullWidth" sx={tabSx}>
      <Tab value="organizer" label="Organizer" icon={<Storefront sx={{ fontSize: 18 }} />} iconPosition="start" />
      <Tab value="artist" label="Artist" icon={<MicExternalOn sx={{ fontSize: 18 }} />} iconPosition="start" />
    </Tabs>
  );
}

function MobileFormLogo() {
  return (
    <Box className="mobile-form-logo">
      <Box
        component="img"
        src="/tickahub.png"
        alt="TickaHub"
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          boxShadow: `0 8px 24px ${tickahub.gold}33`,
        }}
      />
    </Box>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("organizer");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showOrgRegPassword, setShowOrgRegPassword] = useState(false);
  const [showOrgRegConfirm, setShowOrgRegConfirm] = useState(false);
  const [showArtistRegPassword, setShowArtistRegPassword] = useState(false);
  const [showArtistRegConfirm, setShowArtistRegConfirm] = useState(false);
  const [artistRegistrationGenres, setArtistRegistrationGenres] = useState([]);
  const [openResetDialog, setOpenResetDialog] = useState(false);

  const registerActive = !isLoginMode;

  useEffect(() => {
    setShowLoginPassword(false);
    setShowOrgRegPassword(false);
    setShowOrgRegConfirm(false);
    setShowArtistRegPassword(false);
    setShowArtistRegConfirm(false);
  }, [isLoginMode, accountType]);

  const switchToSignIn = () => setIsLoginMode(true);
  const switchToSignUp = () => setIsLoginMode(false);

  const rfEmail = useRef();
  const rfPassword = useRef();
  const rsEmail = useRef();
  const rfOrgName = useRef();
  const rfContactPerson = useRef();
  const rfRegEmail = useRef();
  const rfRegPassword = useRef();
  const rfConfirmPassword = useRef();
  const rfPhone = useRef();
  const rfAddress = useRef();
  const rfStageName = useRef();
  const rfArtistName = useRef();
  const rfArtistEmail = useRef();
  const rfArtistPassword = useRef();
  const rfArtistConfirm = useRef();
  const rfArtistPhone = useRef();

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  const validatePassword = (password) => password.length >= 6;

  const loginOrganizer = async (email, password) => {
    const response = await fetch("/api/organizers/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      const error = new Error(data.message || "Login failed");
      error.code = data.code;
      throw error;
    }
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("userRole", "organizer");
    localStorage.setItem("user", JSON.stringify(data.data.organizer));
    return data;
  };

  const loginArtist = async (email, password) => {
    const response = await fetch("/api/artists/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      const error = new Error(data.message || "Login failed");
      error.code = data.code;
      throw error;
    }
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("userRole", "artist");
    localStorage.setItem("user", JSON.stringify(data.data.artist));
    return data;
  };

  const showLoginError = (err) => {
    const wrongPortal = err.code === "WRONG_ACCOUNT_TYPE";
    Swal.fire({
      icon: wrongPortal ? "warning" : "error",
      title: wrongPortal ? "Wrong sign-in tab" : "Login failed",
      text: err.message,
      ...swalDark,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = rfEmail.current.value.toLowerCase().trim();
    const password = rfPassword.current.value;
    if (!validateEmail(email)) {
      Swal.fire({ icon: "error", title: "Invalid email", ...swalDark });
      return;
    }
    if (!validatePassword(password)) {
      Swal.fire({ icon: "error", title: "Invalid password", ...swalDark });
      return;
    }
    setLoading(true);
    Swal.fire({ title: "Signing in...", allowOutsideClick: false, ...swalDark, didOpen: () => Swal.showLoading() });
    try {
      const data = accountType === "organizer" ? await loginOrganizer(email, password) : await loginArtist(email, password);
      Swal.fire({ icon: "success", title: "Welcome back", text: data.message, timer: 1500, showConfirmButton: false, ...swalDark });
      const destination = accountType === "organizer" ? "/analytics" : "/profile";
      setTimeout(() => navigate(destination), 1500);
    } catch (err) {
      showLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  const registerOrganizer = async (e) => {
    e.preventDefault();
    const payload = {
      organization_name: rfOrgName.current.value.trim(),
      contact_person: rfContactPerson.current.value.trim(),
      email: rfRegEmail.current.value.toLowerCase().trim(),
      password: rfRegPassword.current.value,
      phone_number: rfPhone.current.value.trim(),
      address: rfAddress.current.value.trim(),
    };
    if (!payload.organization_name || !payload.contact_person || !payload.phone_number) {
      Swal.fire({ icon: "error", title: "Missing information", ...swalDark });
      return;
    }
    if (!validateEmail(payload.email) || !validatePassword(payload.password)) {
      Swal.fire({ icon: "error", title: "Check email and password", ...swalDark });
      return;
    }
    if (payload.password !== rfConfirmPassword.current.value) {
      Swal.fire({ icon: "error", title: "Passwords do not match", ...swalDark });
      return;
    }
    setLoading(true);
    Swal.fire({ title: "Creating account...", allowOutsideClick: false, ...swalDark, didOpen: () => Swal.showLoading() });
    try {
      const response = await fetch("/api/organizers/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Registration failed");
      Swal.fire({ icon: "success", title: "Account submitted", text: "Awaiting admin approval before you can sign in.", ...swalDark });
      setIsLoginMode(true);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Registration failed", text: err.message, ...swalDark });
    } finally {
      setLoading(false);
    }
  };

  const registerArtist = async (e) => {
    e.preventDefault();
    const payload = {
      full_name: rfArtistName.current.value.trim(),
      stage_name: rfStageName.current.value.trim(),
      email: rfArtistEmail.current.value.toLowerCase().trim(),
      password: rfArtistPassword.current.value,
      phone: rfArtistPhone.current?.value?.trim() || "",
      genre: artistRegistrationGenres,
    };
    if (!payload.full_name && !payload.stage_name) {
      Swal.fire({ icon: "error", title: "Enter your name or stage name", ...swalDark });
      return;
    }
    if (!validateEmail(payload.email) || !validatePassword(payload.password)) {
      Swal.fire({ icon: "error", title: "Check email and password", ...swalDark });
      return;
    }
    if (payload.password !== rfArtistConfirm.current.value) {
      Swal.fire({ icon: "error", title: "Passwords do not match", ...swalDark });
      return;
    }
    setLoading(true);
    Swal.fire({ title: "Creating artist account...", allowOutsideClick: false, ...swalDark, didOpen: () => Swal.showLoading() });
    try {
      const response = await fetch("/api/artists/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Registration failed");
      Swal.fire({
        icon: "success",
        title: "Account created",
        text: "Sign in with your email and password to continue.",
        ...swalDark,
      });
      setIsLoginMode(true);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Registration failed", text: err.message, ...swalDark });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const email = rsEmail.current.value.toLowerCase().trim();
    if (!validateEmail(email)) {
      Swal.fire({ icon: "error", title: "Invalid email", ...swalDark });
      return;
    }
    setResetLoading(true);
    const endpoint = accountType === "organizer" ? "/api/organizers/forgot-password" : "/api/users/forgot-password";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountType === "organizer" ? { Email: email } : { email }),
      });
      const data = await response.json();
      setOpenResetDialog(false);
      Swal.fire({ icon: response.ok ? "success" : "error", title: response.ok ? "Check your email" : "Error", text: data.message, ...swalDark });
    } catch {
      Swal.fire({ icon: "error", title: "Something went wrong", ...swalDark });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box className="split-auth-page" sx={{ background: backgroundGradient }}>
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          top: "-8%",
          right: "-6%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tickahub.gold}30 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 360,
          bottom: "-10%",
          left: "-8%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tickahub.cyan}22 0%, transparent 70%)`,
          filter: "blur(48px)",
          pointerEvents: "none",
        }}
      />

      <Box
        className={`split-auth-container${registerActive ? " right-panel-active" : ""} account-${accountType}`}
      >
        {/* Sign in — right side when active */}
        <Box className="form-container sign-in-container">
          <Box className="form-inner">
            <MobileFormLogo />
            <AccountTypeTabs value={accountType} onChange={(_, v) => setAccountType(v)} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 0.5 }}>
              Sign in
            </Typography>
            <Typography variant="body2" sx={{ color: tickahub.textMuted, mb: 2 }}>
              Sign in to your {accountType} account
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                inputRef={rfEmail}
                type="email"
                label="Email"
                fullWidth
                margin="normal"
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: tickahub.textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              <TextField
                inputRef={rfPassword}
                type={showLoginPassword ? "text" : "password"}
                label="Password"
                fullWidth
                margin="normal"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: tickahub.textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <PasswordToggle
                      show={showLoginPassword}
                      onToggle={() => setShowLoginPassword(!showLoginPassword)}
                    />
                  ),
                }}
                sx={fieldSx}
              />
              <Typography
                variant="body2"
                align="right"
                sx={{
                  mt: 1,
                  color: tickahub.cyan,
                  cursor: "pointer",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => setOpenResetDialog(true)}
              >
                Forgot password?
              </Typography>
              <Button
                type="submit"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: tickahub.navy }} /> : <Login />}
                sx={{
                  ...pillBtnSx,
                  background: goldGradient,
                  color: tickahub.navy,
                  "&:hover": { background: `linear-gradient(135deg, ${tickahub.goldDark}, ${tickahub.gold})` },
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <Typography
              variant="body2"
              align="center"
              className="mobile-mode-switch"
              sx={{
                mt: 2,
                color: tickahub.textMuted,
                cursor: "pointer",
                "&:hover": { color: tickahub.cyan },
              }}
              onClick={switchToSignUp}
            >
              Don&apos;t have an account?{" "}
              <Box component="span" sx={{ color: tickahub.cyan, fontWeight: 700 }}>
                Sign up
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* Sign up — left side when active */}
        <Box className="form-container sign-up-container">
          <Box className="form-inner">
            <MobileFormLogo />
            <AccountTypeTabs value={accountType} onChange={(_, v) => setAccountType(v)} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", mb: 0.25, fontSize: "1.35rem" }}>
              Sign up
            </Typography>
            <Typography variant="body2" sx={{ color: tickahub.textMuted, mb: 1.5, fontSize: "0.8rem" }}>
              {accountType === "organizer" ? "Submit for admin approval" : "Start sharing your schedule"}
            </Typography>
            {accountType === "organizer" ? (
              <Box className="sign-up-form-shell">
                <form className="sign-up-form" onSubmit={registerOrganizer}>
                  <Box className="register-grid">
                    <TextField inputRef={rfOrgName} label="Organization name" fullWidth size="small" autoComplete="organization" InputProps={{ startAdornment: <InputAdornment position="start"><Storefront sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment> }} sx={compactFieldSx} />
                    <TextField inputRef={rfContactPerson} label="Contact person" fullWidth size="small" autoComplete="name" InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment> }} sx={compactFieldSx} />
                    <TextField inputRef={rfRegEmail} type="email" label="Email" fullWidth size="small" autoComplete="email" InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment> }} sx={compactFieldSx} />
                    <TextField inputRef={rfPhone} label="Phone" fullWidth size="small" autoComplete="tel" sx={compactFieldSx} />
                    <Box sx={{ gridColumn: "1 / -1" }}>
                      <TextField inputRef={rfAddress} label="Address (optional)" fullWidth size="small" sx={compactFieldSx} />
                    </Box>
                    <TextField
                      inputRef={rfRegPassword}
                      type={showOrgRegPassword ? "text" : "password"}
                      label="Password"
                      fullWidth
                      size="small"
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Lock sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment>,
                        endAdornment: <PasswordToggle show={showOrgRegPassword} onToggle={() => setShowOrgRegPassword(!showOrgRegPassword)} />,
                      }}
                      sx={compactFieldSx}
                    />
                    <TextField
                      inputRef={rfConfirmPassword}
                      type={showOrgRegConfirm ? "text" : "password"}
                      label="Confirm password"
                      fullWidth
                      size="small"
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Lock sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment>,
                        endAdornment: <PasswordToggle show={showOrgRegConfirm} onToggle={() => setShowOrgRegConfirm(!showOrgRegConfirm)} />,
                      }}
                      sx={compactFieldSx}
                    />
                  </Box>
                  <Button type="submit" fullWidth size="large" disabled={loading} sx={{ ...pillBtnSx, mt: 2.25, py: 1.4, background: goldGradient, color: tickahub.navy }}>
                    {loading ? "Submitting..." : "Sign up"}
                  </Button>
                </form>
              </Box>
            ) : (
              <Box className="sign-up-form-shell">
                <form className="sign-up-form" onSubmit={registerArtist}>
                  <Box className="register-grid">
                    <TextField inputRef={rfStageName} label="Stage name" fullWidth size="small" autoComplete="nickname" InputProps={{ startAdornment: <InputAdornment position="start"><MicExternalOn sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment> }} sx={compactFieldSx} />
                    <TextField inputRef={rfArtistName} label="Full name" fullWidth size="small" autoComplete="name" InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment> }} sx={compactFieldSx} />
                    <TextField inputRef={rfArtistEmail} type="email" label="Email" fullWidth size="small" autoComplete="email" InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment> }} sx={compactFieldSx} />
                    <TextField inputRef={rfArtistPhone} label="Phone (optional)" fullWidth size="small" autoComplete="tel" sx={compactFieldSx} />
                    <Box sx={{ gridColumn: "1 / -1" }}>
                      <ArtistGenreField
                        value={artistRegistrationGenres}
                        onChange={setArtistRegistrationGenres}
                        helperText="Type any genre you perform — press Enter or Add. Suggestions below are optional."
                      />
                    </Box>
                    <TextField
                      inputRef={rfArtistPassword}
                      type={showArtistRegPassword ? "text" : "password"}
                      label="Password"
                      fullWidth
                      size="small"
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Lock sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment>,
                        endAdornment: <PasswordToggle show={showArtistRegPassword} onToggle={() => setShowArtistRegPassword(!showArtistRegPassword)} />,
                      }}
                      sx={compactFieldSx}
                    />
                    <TextField
                      inputRef={rfArtistConfirm}
                      type={showArtistRegConfirm ? "text" : "password"}
                      label="Confirm password"
                      fullWidth
                      size="small"
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Lock sx={{ color: tickahub.textMuted, fontSize: 18 }} /></InputAdornment>,
                        endAdornment: <PasswordToggle show={showArtistRegConfirm} onToggle={() => setShowArtistRegConfirm(!showArtistRegConfirm)} />,
                      }}
                      sx={compactFieldSx}
                    />
                  </Box>
                  <Button type="submit" fullWidth size="large" disabled={loading} sx={{ ...pillBtnSx, mt: 2.25, py: 1.4, background: cyanGradient, color: tickahub.navy, boxShadow: `0 8px 24px ${tickahub.cyan}44` }}>
                    {loading ? "Creating..." : "Sign up"}
                  </Button>
                </form>
              </Box>
            )}
            <Typography
              variant="body2"
              align="center"
              className="mobile-mode-switch"
              sx={{
                mt: 1.5,
                color: tickahub.textMuted,
                cursor: "pointer",
                fontSize: "0.85rem",
                "&:hover": { color: tickahub.cyan },
              }}
              onClick={switchToSignIn}
            >
              Already have an account?{" "}
              <Box component="span" sx={{ color: tickahub.cyan, fontWeight: 700 }}>
                Sign in
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box className="brand-panel" sx={{ background: backgroundGradient }}>
          <Box
            component="img"
            src="/tickahub.png"
            alt="TickaHub"
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              mb: 2,
              boxShadow: `0 12px 32px ${tickahub.gold}33`,
            }}
          />
          {registerActive ? (
            <Box className="brand-content">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  background: goldGradient,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1.5,
                }}
              >
                One of us?
              </Typography>
              <Typography sx={{ color: tickahub.textMuted, mb: 3, maxWidth: 300, lineHeight: 1.6 }}>
                Welcome back! Sign in to continue your journey with TickaHub.
              </Typography>
              <button type="button" className="ghost-btn" onClick={switchToSignIn}>
                Sign in
              </button>
            </Box>
          ) : (
            <Box className="brand-content">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  background: goldGradient,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1.5,
                }}
              >
                New here?
              </Typography>
              <Typography sx={{ color: tickahub.textMuted, mb: 3, maxWidth: 300, lineHeight: 1.6 }}>
                Enter your details and start your journey as an{" "}
                {accountType === "organizer" ? "event organizer" : "artist"}.
              </Typography>
              <button type="button" className="ghost-btn" onClick={switchToSignUp}>
                Sign up
              </button>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { bgcolor: tickahub.surface, border: `1px solid ${tickahub.borderLight}` } }}
      >
        <DialogTitle sx={{ background: goldGradient, color: tickahub.navy, fontWeight: 800 }}>
          Reset password
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText sx={{ color: tickahub.textMuted, mb: 2 }}>
            Enter your {accountType} account email.
          </DialogContentText>
          <TextField
            inputRef={rsEmail}
            type="email"
            label="Email address"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: tickahub.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />
          <DialogActions sx={{ px: 0, mt: 2 }}>
            <Button onClick={() => setOpenResetDialog(false)} sx={{ color: "#fff" }}>
              Cancel
            </Button>
            <Button onClick={resetPassword} disabled={resetLoading} sx={{ background: goldGradient, color: tickahub.navy, fontWeight: 700 }}>
              {resetLoading ? "Sending..." : "Submit"}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
