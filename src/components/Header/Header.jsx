import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ArrowDropDown as ArrowDropDownIcon,
  AccountCircle as AccountCircleIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import UserAccount from "./userAccount";
import { tickahub, goldGradient, cyanGradient } from "../../tickahubTheme";
import {
  getDisplayName,
  getInitials,
  getRoleLabel,
  getUserRole,
  getProfileImageUrl,
} from "../../utils/userDisplay";

export default function Header({ setUser, handleDrawerOpen, open, isMobile = false }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [toggleAccount, setToggleAccount] = useState(false);
  const navigate = useNavigate();
  const userRole = getUserRole();
  const isArtist = userRole === "artist";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      setUser?.(userData);
    } else {
      window.location.href = "/";
    }

    const onUserUpdated = (e) => {
      setCurrentUser(e.detail);
      setUser?.(e.detail);
    };
    window.addEventListener("tickahub-user-updated", onUserUpdated);
    return () => window.removeEventListener("tickahub-user-updated", onUserUpdated);
  }, [setUser]);

  const displayName = getDisplayName(currentUser);
  const avatarSrc = getProfileImageUrl(currentUser);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          minHeight: 64,
          color: "#fff",
        }}
      >
        {!isMobile && (
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              color: "#fff",
              mr: 2,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
            <Box component="img" src="/tickahub.png" alt="TickaHub" sx={{ width: 28, height: 28, borderRadius: 1.25 }} />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.95rem",
                background: goldGradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TickaHub
            </Typography>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {currentUser && (
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              cursor: "pointer",
              border: `1px solid ${tickahub.borderSubtle}`,
              bgcolor: `${tickahub.navy}88`,
              "&:hover": { bgcolor: isArtist ? `${tickahub.cyan}14` : `${tickahub.gold}14` },
            }}
          >
            <Avatar
              src={avatarSrc || undefined}
              sx={{
                width: 36,
                height: 36,
                background: isArtist ? cyanGradient : goldGradient,
                color: tickahub.navy,
                fontWeight: 800,
                fontSize: "0.85rem",
              }}
            >
              {getInitials(displayName)}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, pr: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
                {displayName}
              </Typography>
              <Typography sx={{ color: tickahub.textMuted, fontSize: "0.72rem" }}>
                {getRoleLabel()}
              </Typography>
            </Box>
            <ArrowDropDownIcon sx={{ color: tickahub.textMuted, fontSize: 22 }} />
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            bgcolor: tickahub.surface,
            border: `1px solid ${tickahub.borderSubtle}`,
            minWidth: 200,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setToggleAccount(true);
            setAnchorEl(null);
          }}
          sx={{ color: "#fff" }}
        >
          <ListItemIcon>
            <AccountCircleIcon sx={{ color: tickahub.cyan }} />
          </ListItemIcon>
          <ListItemText primary="Account" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/settings");
            setAnchorEl(null);
          }}
          sx={{ color: "#fff" }}
        >
          <ListItemIcon>
            <LockIcon sx={{ color: tickahub.gold }} />
          </ListItemIcon>
          <ListItemText primary="Change password" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            logout();
            setAnchorEl(null);
          }}
          sx={{ color: "#ff8a8a" }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: "#ff8a8a" }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {currentUser && (
        <UserAccount
          open={toggleAccount}
          onClose={() => setToggleAccount(false)}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
