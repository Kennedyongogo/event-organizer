import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar, { bottomNavHeight } from "./Navbar";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import Events from "./Events/Events";
import EventView from "./Events/EventView";
import EventEdit from "./Events/EventEdit";
import EventCreate from "./Events/EventCreate";
import Analytics from "./Analytics/Analytics";
import MyProfile from "./Profile/MyProfile";
import ArtistSchedule from "./Schedule/ArtistSchedule";

function HomeRedirect() {
  const role = localStorage.getItem("userRole");
  return <Navigate to={role === "artist" ? "/profile" : "/analytics"} replace />;
}

function PageRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on component mount
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      // Redirect to login if no user or token
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  return (
    <Box sx={{ display: "flex", width: "100%", maxWidth: "100vw" }}>
      <Navbar user={user} setUser={setUser} />
      <Box
        component="main"
        sx={{
          flex: "1 1 0",
          minWidth: 0,
          maxWidth: "100%",
          p: { xs: 2, md: 3 },
          mt: { xs: 7, md: 9 },
          pb: {
            xs: `calc(${bottomNavHeight}px + env(safe-area-inset-bottom, 0px) + 16px)`,
            md: 3,
          },
          bgcolor: "background.default",
          overflowX: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "40vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Routes>
            <Route path="home" element={<HomeRedirect />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="schedule" element={<ArtistSchedule />} />
            <Route path="events" element={<Events />} />
            <Route path="events/create" element={<EventCreate />} />
            <Route path="events/:id" element={<EventView />} />
            <Route path="events/:id/edit" element={<EventEdit />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings user={user} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
