import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./Navbar";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import Projects from "./Projects/Projects";
import ProjectView from "./Projects/ProjectView";
import ProjectEdit from "./Projects/ProjectEdit";
import ProjectCreate from "./Projects/ProjectCreate";
import Tasks from "./Tasks/Tasks";
import TaskView from "./Tasks/TaskView";
import Materials from "./Materials/Materials";
import Equipment from "./Equipment/Equipment";
import Labor from "./Labor/Labor";
import Budget from "./budget/Budget";
import BudgetView from "./budget/BudgetView";
import Issues from "./Issues/Issues";
import ConstructionMap from "../ConstructionMap";
import Documents from "./Documents/Documents";
import UsersTable from "./Users/UsersTable";
import Analytics from "./Analytics/Analytics";

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
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 9 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Routes>
            <Route path="home" element={<Navigate to="/analytics" replace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/create" element={<ProjectCreate />} />
            <Route path="projects/:id" element={<ProjectView />} />
            <Route path="projects/:id/edit" element={<ProjectEdit />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskView />} />
            <Route path="materials" element={<Materials />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="labor" element={<Labor />} />
            <Route path="budget" element={<Budget />} />
            <Route path="budget/:id" element={<BudgetView />} />
            <Route path="issues" element={<Issues />} />
            <Route path="map" element={<ConstructionMap />} />
            <Route path="documents" element={<Documents />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UsersTable />} />
            <Route path="settings" element={<Settings user={user} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
