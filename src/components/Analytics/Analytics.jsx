import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  TextField,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  LineChart,
  Line,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Map as MapIcon,
  Speed as GaugeIcon,
  Timeline,
  Help as HelpIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Speed as GaugeIcon2,
  Assessment as AssessmentIcon,
  Insights as InsightsIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Color palette for charts
const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#38f9d7",
  "#ffecd2",
  "#fcb69f",
];

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    projects: {},
    tasks: {},
    budget: {},
    issues: {},
    equipment: {},
    labor: {},
    materials: {},
    equipmentSummary: {},
    performance: {},
    recentActivity: {},
    documents: {},
    engineers: {},
  });
  const [projectsByDate, setProjectsByDate] = useState([]);
  const [tasksByDate, setTasksByDate] = useState([]);
  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0], // January 1st of current year
    endDate: new Date(new Date().getFullYear(), 11, 31)
      .toISOString()
      .split("T")[0], // December 31st of current year
  });

  const [overviewHelpOpen, setOverviewHelpOpen] = useState(false);
  const [projectsHelpOpen, setProjectsHelpOpen] = useState(false);
  const [tasksLaborHelpOpen, setTasksLaborHelpOpen] = useState(false);
  const [budgetResourcesHelpOpen, setBudgetResourcesHelpOpen] = useState(false);
  const [performanceHelpOpen, setPerformanceHelpOpen] = useState(false);
  const [equipmentMaterialsHelpOpen, setEquipmentMaterialsHelpOpen] =
    useState(false);

  const tabs = [
    { label: "Overview", icon: <AnalyticsIcon />, value: 0 },
    { label: "Projects", icon: <MapIcon />, value: 1 },
    { label: "Tasks", icon: <BarChartIcon />, value: 2 },
    { label: "Budget", icon: <PieChartIcon />, value: 3 },
    { label: "Performance", icon: <Timeline />, value: 4 },
    { label: "Equipment & Materials", icon: <GaugeIcon />, value: 5 },
  ];

  useEffect(() => {
    fetchAnalyticsData();
    fetchProjectsByDate();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/admins/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dashboard API Response:", data); // Debug log

      if (data.success) {
        setAnalyticsData(data.data);
        setDataLoaded(true);
        console.log("Analytics data set:", data.data); // Debug log
      } else {
        throw new Error(data.message || "Failed to fetch analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsByDate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `/api/admins/projects/by-date?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&groupBy=day`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProjectsByDate(data.data.chartData);
        }
      }
    } catch (err) {
      console.error("Error fetching projects by date:", err);
    }
  };

  // Overview Help Dialog Component
  const OverviewHelpDialog = () => (
    <Dialog
      open={overviewHelpOpen}
      onClose={() => setOverviewHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Construction Overview - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This overview provides key metrics and insights about your
          construction projects. Here's what each section means:
        </Typography>

        {/* Key Metrics Cards */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📊 Key Metrics Cards
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <MapIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Projects"
              secondary="The total number of construction projects in your system"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <BarChartIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Tasks"
              secondary="The total number of tasks across all projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Total Labor"
              secondary="The total number of workers assigned to projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Total Equipment"
              secondary="The total number of equipment items available"
            />
          </ListItem>
        </List>

        {/* Project Metrics */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📈 Project Metrics
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Average Progress"
              secondary="The average completion percentage across all projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Budget Utilization"
              secondary="Percentage of budget that has been spent (Actual ÷ Budgeted × 100)"
            />
          </ListItem>
        </List>

        {/* Resource Analysis */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🏗️ Resource Analysis
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Material Utilization"
              secondary="Percentage of materials that have been used (Used ÷ Required × 100)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Total Equipment"
              secondary="Total number of equipment items in your inventory"
            />
          </ListItem>
        </List>

        {/* Performance Insights */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          💡 Performance Insights
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Top Engineer"
              secondary="The engineer managing the most projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Projects at Risk"
              secondary="Number of projects that may be behind schedule or over budget"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> These metrics help you understand project
            performance, identify areas needing attention, and track progress
            over time. Higher percentages generally indicate better performance
            and resource utilization.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOverviewHelpOpen(false)} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Projects Help Dialog Component
  const ProjectsHelpDialog = () => (
    <Dialog
      open={projectsHelpOpen}
      onClose={() => setProjectsHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <MapIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Projects Tab - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The Projects tab shows project status distribution, construction
          types, and recent project information. Here's how to understand what
          you're seeing:
        </Typography>

        {/* Project Status Chart */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📊 Project Status Distribution
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Planning" color="info" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Planning"
              secondary="Projects in the initial planning phase - not yet started"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="In Progress" color="primary" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="In Progress"
              secondary="Projects currently under construction"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Completed" color="success" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Completed"
              secondary="Projects that have been finished"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="On Hold" color="warning" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="On Hold"
              secondary="Projects temporarily paused due to various reasons"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Cancelled" color="error" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Cancelled"
              secondary="Projects that have been terminated"
            />
          </ListItem>
        </List>

        {/* Construction Type Chart */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🏗️ Construction Type Distribution
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <MapIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Building"
              secondary="Residential and commercial building construction projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Infrastructure"
              secondary="Roads, bridges, utilities, and public infrastructure projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Industrial"
              secondary="Factories, warehouses, and industrial facility construction"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Specialized"
              secondary="Unique or specialized construction projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Other"
              secondary="Projects that don't fit into the above categories"
            />
          </ListItem>
        </List>

        {/* Recent Projects */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📋 Recent Projects
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Project Name"
              secondary="The name of the construction project"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Status & Engineer"
              secondary="Current project status and the engineer in charge"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> Use these charts to track project progress,
            identify bottlenecks, and understand the distribution of your
            project portfolio across different types and statuses.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setProjectsHelpOpen(false)} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Tasks & Labor Help Dialog Component
  const TasksLaborHelpDialog = () => (
    <Dialog
      open={tasksLaborHelpOpen}
      onClose={() => setTasksLaborHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BarChartIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Tasks & Labor Tab - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The Tasks & Labor tab shows task status distribution, labor workforce
          analysis, and recent task information. Here's how to understand what
          you're seeing:
        </Typography>

        {/* Task Status Chart */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📊 Task Status Distribution
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Pending" color="warning" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Pending"
              secondary="Tasks that are assigned but not yet started"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="In Progress" color="primary" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="In Progress"
              secondary="Tasks currently being worked on"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Completed" color="success" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Completed"
              secondary="Tasks that have been finished"
            />
          </ListItem>
        </List>

        {/* Labor Type Chart */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          👷 Labor by Worker Type
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Foreman"
              secondary="Supervisory workers who oversee construction activities"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Skilled Worker"
              secondary="Workers with specialized skills and training"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Unskilled Worker"
              secondary="General laborers without specialized training"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Engineer"
              secondary="Technical professionals with engineering qualifications"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Supervisor"
              secondary="Management-level workers who coordinate teams"
            />
          </ListItem>
        </List>

        {/* Labor Summary */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          💰 Labor Summary
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Hours"
              secondary="Total number of hours worked across all labor"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Cost"
              secondary="Total cost of all labor (hours × hourly rates)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Average Hourly Rate"
              secondary="Average hourly wage across all workers"
            />
          </ListItem>
        </List>

        {/* Recent Tasks */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📋 Recent Tasks
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <BarChartIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Task Name"
              secondary="The name of the construction task"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Project & Progress"
              secondary="Which project the task belongs to and its completion percentage"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> Use these charts to track task progress,
            manage labor resources, and identify workforce distribution patterns
            across your construction projects.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTasksLaborHelpOpen(false)} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Budget & Resources Help Dialog Component
  const BudgetResourcesHelpDialog = () => (
    <Dialog
      open={budgetResourcesHelpOpen}
      onClose={() => setBudgetResourcesHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PieChartIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Budget & Resources Tab - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The Budget & Resources tab shows budget analysis, resource allocation,
          and financial metrics. Here's how to understand what you're seeing:
        </Typography>

        {/* Budget Overview */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          💰 Budget Overview
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Budgeted"
              secondary="Total amount allocated for all projects and resources"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Actual"
              secondary="Total amount actually spent across all projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Variance"
              secondary="Difference between budgeted and actual costs (Budgeted - Actual)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Utilization"
              secondary="Percentage of budget that has been used (Actual ÷ Budgeted × 100)"
            />
          </ListItem>
        </List>

        {/* Budget by Category */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📊 Budget by Category
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Materials" color="primary" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Materials"
              secondary="Budget allocated for construction materials (cement, steel, etc.)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Labor" color="secondary" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Labor"
              secondary="Budget allocated for workforce costs and wages"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Equipment" color="success" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Equipment"
              secondary="Budget allocated for equipment rental and maintenance"
            />
          </ListItem>
        </List>

        {/* Project Resource Allocation */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🏗️ Project Resource Allocation
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <MapIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Project Name"
              secondary="Name of the construction project"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Status & Progress"
              secondary="Current project status and completion percentage"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Resource Counts"
              secondary="Number of materials, labor, and equipment assigned to each project"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> Use these metrics to track budget
            performance, identify cost overruns, and ensure proper resource
            allocation across your construction projects.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setBudgetResourcesHelpOpen(false)}
          color="primary"
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Performance Help Dialog Component
  const PerformanceHelpDialog = () => (
    <Dialog
      open={performanceHelpOpen}
      onClose={() => setPerformanceHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Timeline color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Performance Tab - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The Performance tab shows task completion rates, material utilization,
          and project performance indicators. Here's how to understand what
          you're seeing:
        </Typography>

        {/* Performance Overview */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📊 Performance Overview
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Task Completion Rate"
              secondary="Percentage of tasks that have been completed across all projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Completed Tasks"
              secondary="Total number of tasks that have been finished"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="In Progress Tasks"
              secondary="Total number of tasks currently being worked on"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Projects at Risk"
              secondary="Number of projects that may be behind schedule or over budget"
            />
          </ListItem>
        </List>

        {/* Material Utilization */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🏗️ Material Utilization
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Required"
              secondary="Total amount of materials needed across all projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Used"
              secondary="Total amount of materials actually consumed"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Utilization Percentage"
              secondary="Percentage of materials that have been used (Used ÷ Required × 100)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Total Cost"
              secondary="Total cost of all materials budgeted for projects"
            />
          </ListItem>
        </List>

        {/* Equipment & Cost Summary */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🔧 Equipment & Cost Summary
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Equipment"
              secondary="Total number of equipment items in your inventory"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Available Equipment"
              secondary="Number of equipment items currently available for use"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Daily Rental Cost"
              secondary="Total daily cost for all equipment rentals"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Overdue Tasks"
              secondary="Number of tasks that are past their due date"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> Use these metrics to track project
            performance, identify bottlenecks, and ensure efficient resource
            utilization across your construction projects.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPerformanceHelpOpen(false)} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Equipment & Materials Help Dialog Component
  const EquipmentMaterialsHelpDialog = () => (
    <Dialog
      open={equipmentMaterialsHelpOpen}
      onClose={() => setEquipmentMaterialsHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <GaugeIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Equipment & Materials Tab - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The Equipment & Materials tab shows equipment availability, material
          utilization, and resource management. Here's how to understand what
          you're seeing:
        </Typography>

        {/* Equipment Availability */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🔧 Equipment Availability
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Available" color="success" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Available Equipment"
              secondary="Equipment items that are currently free and ready for use"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Unavailable" color="error" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Unavailable Equipment"
              secondary="Equipment items that are currently in use or under maintenance"
            />
          </ListItem>
        </List>

        {/* Labor Status Distribution */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          👷 Labor Status Distribution
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Active" color="success" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Active Workers"
              secondary="Workers currently assigned to projects and working"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Completed" color="info" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Completed Workers"
              secondary="Workers who have finished their assigned tasks"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="On Leave" color="warning" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="On Leave Workers"
              secondary="Workers who are temporarily unavailable (vacation, sick leave, etc.)"
            />
          </ListItem>
        </List>

        {/* Material Summary */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🏗️ Material Summary
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Required"
              secondary="Total amount of materials needed across all projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Used"
              secondary="Total amount of materials actually consumed"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Utilization Percentage"
              secondary="Percentage of materials that have been used (Used ÷ Required × 100)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Total Cost"
              secondary="Total cost of all materials budgeted for projects"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Total Spent"
              secondary="Total amount actually spent on materials"
            />
          </ListItem>
        </List>

        {/* Equipment Summary */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          🔧 Equipment Summary
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Available Equipment"
              secondary="Number of equipment items currently available for use"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Equipment"
              secondary="Total number of equipment items in your inventory"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Daily Rental Cost"
              secondary="Total daily cost for all equipment rentals"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Equipment Utilization"
              secondary="Percentage of equipment that is currently available (Available ÷ Total × 100)"
            />
          </ListItem>
        </List>

        {/* Issues Summary */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          ⚠️ Issues Summary
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Chip label="Open" color="error" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Open Issues"
              secondary="Issues that have been reported but not yet resolved"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="Resolved" color="success" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="Resolved Issues"
              secondary="Issues that have been successfully resolved"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="In Review" color="warning" size="small" />
            </ListItemIcon>
            <ListItemText
              primary="In Review Issues"
              secondary="Issues that are currently being investigated or reviewed"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> Use these metrics to track resource
            utilization, identify equipment availability issues, and monitor
            material consumption patterns across your construction projects.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setEquipmentMaterialsHelpOpen(false)}
          color="primary"
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Modern Card Component (from Home.jsx)
  const ModernCard = ({ title, subtitle, icon, children }) => (
    <Card
      sx={{
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(102, 126, 234, 0.15)",
          transform: "translateY(-2px)",
          borderColor: "rgba(102, 126, 234, 0.2)",
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(10px)",
      }}
    >
      <CardContent
        sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              {icon && (
                <Avatar
                  sx={{
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    color: "#667eea",
                    mr: 2,
                    width: 40,
                    height: 40,
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  {icon}
                </Avatar>
              )}
              <Typography variant="h6" fontWeight="600" color="#2c3e50">
                {title}
              </Typography>
            </Box>
            {subtitle && (
              <Typography variant="body2" color="#7f8c8d">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </Box>
      </CardContent>
    </Card>
  );

  // CardItem component with improved UI and appropriate icons
  const CardItem = (props) => {
    const getCardStyle = (title) => {
      switch (title) {
        case "Total Projects":
          return {
            icon: <MapIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
            bgColor: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
            borderColor: "#1976d2",
            textColor: "#1976d2",
            iconBg: "rgba(25, 118, 210, 0.1)",
          };
        case "Total Tasks":
          return {
            icon: <BarChartIcon sx={{ fontSize: 40, color: "#7b1fa2" }} />,
            bgColor: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
            borderColor: "#7b1fa2",
            textColor: "#7b1fa2",
            iconBg: "rgba(123, 31, 162, 0.1)",
          };
        case "Total Labor":
          return {
            icon: <PeopleIcon sx={{ fontSize: 40, color: "#388e3c" }} />,
            bgColor: "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
            borderColor: "#388e3c",
            textColor: "#388e3c",
            iconBg: "rgba(56, 142, 60, 0.1)",
          };
        case "Total Equipment":
          return {
            icon: <GaugeIcon sx={{ fontSize: 40, color: "#f57c00" }} />,
            bgColor: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
            borderColor: "#f57c00",
            textColor: "#f57c00",
            iconBg: "rgba(245, 124, 0, 0.1)",
          };
        case "Total Materials":
          return {
            icon: <AssessmentIcon sx={{ fontSize: 40, color: "#d32f2f" }} />,
            bgColor: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            borderColor: "#d32f2f",
            textColor: "#d32f2f",
            iconBg: "rgba(211, 47, 47, 0.1)",
          };
        case "Total Issues":
          return {
            icon: <InfoIcon sx={{ fontSize: 40, color: "#9c27b0" }} />,
            bgColor: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
            borderColor: "#9c27b0",
            textColor: "#9c27b0",
            iconBg: "rgba(156, 39, 176, 0.1)",
          };
        case "Task Completion":
          return {
            icon: <TrendingUp sx={{ fontSize: 40, color: "#2e7d32" }} />,
            bgColor: "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
            borderColor: "#2e7d32",
            textColor: "#2e7d32",
            iconBg: "rgba(46, 125, 50, 0.1)",
          };
        case "Overdue Tasks":
          return {
            icon: <Timeline sx={{ fontSize: 40, color: "#f44336" }} />,
            bgColor: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            borderColor: "#f44336",
            textColor: "#f44336",
            iconBg: "rgba(244, 67, 54, 0.1)",
          };
        default:
          return {
            icon: <AnalyticsIcon sx={{ fontSize: 40, color: "#666" }} />,
            bgColor: "linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)",
            borderColor: "#666",
            textColor: "#666",
            iconBg: "rgba(102, 102, 102, 0.1)",
          };
      }
    };

    const { title, value } = props;
    const style = getCardStyle(title);

    return (
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            background: style.bgColor,
            border: `1px solid ${style.borderColor}20`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              borderColor: style.borderColor,
            },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: `linear-gradient(90deg, ${style.borderColor}, ${style.borderColor}80)`,
            },
          }}
        >
          <CardContent
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              flex: 1,
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: style.iconBg,
                border: `2px solid ${style.borderColor}30`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: style.borderColor,
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                },
              }}
            >
              {style.icon}
            </Box>
            <Typography
              variant="h3"
              fontWeight="800"
              sx={{
                color: style.textColor,
                mb: 1,
                background: `linear-gradient(135deg, ${style.textColor}, ${style.textColor}80)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {value?.toLocaleString() || 0}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{
                color: style.textColor,
                opacity: 0.8,
                fontSize: "0.9rem",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderOverview = () => (
    <Box>
      {/* Overview Header with Help Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Construction Overview
        </Typography>
        <IconButton
          onClick={() => setOverviewHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      {/* Loading State for Overview */}
      {loading && !dataLoaded && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading overview data...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Data Content */}
      {dataLoaded && (
        <>
          {/* Key Metrics Cards - Same as Home.jsx */}
          <Grid container spacing={3}>
            <CardItem
              title="Total Projects"
              value={analyticsData.overview?.totalProjects || 0}
            />
            <CardItem
              title="Total Tasks"
              value={analyticsData.overview?.totalTasks || 0}
            />
            <CardItem
              title="Total Labor"
              value={analyticsData.overview?.totalLabor || 0}
            />
            <CardItem
              title="Total Equipment"
              value={analyticsData.overview?.totalEquipment || 0}
            />
            <CardItem
              title="Total Materials"
              value={analyticsData.overview?.totalMaterials || 0}
            />
            <CardItem
              title="Total Issues"
              value={analyticsData.overview?.totalIssues || 0}
            />
            <CardItem
              title="Task Completion"
              value={`${analyticsData.performance?.taskCompletionRate || 0}%`}
            />
            <CardItem
              title="Overdue Tasks"
              value={analyticsData.overview?.overdueTasks || 0}
            />
          </Grid>

          {/* Quick Stats - 4 columns with 2 stacked vertically each */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Project Metrics
                  </Typography>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(25, 118, 210, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(25, 118, 210, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Average Progress</Typography>
                      <Chip
                        label={`${parseFloat(
                          analyticsData.projects?.progress?.avgProgress || 0
                        ).toFixed(1)}%`}
                        color="primary"
                      />
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(156, 39, 176, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(156, 39, 176, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">
                        Budget Utilization
                      </Typography>
                      <Chip
                        label={`${
                          analyticsData.budget?.utilizationPercent || 0
                        }%`}
                        color="secondary"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Resource Analysis
                  </Typography>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(76, 175, 80, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(76, 175, 80, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">
                        Material Utilization
                      </Typography>
                      <Chip
                        label={`${
                          analyticsData.materials?.summary
                            ?.utilizationPercent || 0
                        }%`}
                        color="success"
                      />
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(0, 188, 212, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(0, 188, 212, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Total Equipment</Typography>
                      <Chip
                        label={`${analyticsData.overview?.totalEquipment || 0}`}
                        color="info"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Performance Insights
                  </Typography>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(25, 118, 210, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(25, 118, 210, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Top Engineer</Typography>
                      <Chip
                        label={analyticsData.engineers?.top?.name || "N/A"}
                        color="primary"
                      />
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(255, 152, 0, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(255, 152, 0, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Projects at Risk</Typography>
                      <Chip
                        label={`${
                          analyticsData.performance?.projectsAtRisk || 0
                        }`}
                        color="warning"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Fallback when data is not loaded */}
      {!dataLoaded && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No data available
            </Typography>
            <Button
              variant="contained"
              onClick={fetchAnalyticsData}
              startIcon={<RefreshIcon />}
            >
              Load Data
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderProjects = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Project Status & Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Project status breakdown and construction type distribution
          </Typography>
        </Box>
        <IconButton
          onClick={() => setProjectsHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      {/* Loading State for Projects */}
      {loading && !dataLoaded && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading project data...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Data Content */}
      {dataLoaded && (
        <>
          <Grid container spacing={3}>
            {/* Project Status Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Project Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  {(analyticsData.projects?.byStatus || []).length > 0 ? (
                    <PieChart>
                      <Pie
                        data={(analyticsData.projects?.byStatus || []).map(
                          (item) => ({
                            name: item.status,
                            value: parseInt(item.count) || 0,
                          })
                        )}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="90%"
                        innerRadius="50%"
                        fill="#8884d8"
                      >
                        {(analyticsData.projects?.byStatus || []).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Projects"]} />
                      <Legend />
                    </PieChart>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <Typography variant="body2" color="text.secondary">
                        No project data available
                      </Typography>
                    </Box>
                  )}
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Construction Type Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Construction Type Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={(analyticsData.projects?.byType || []).map(
                      (item) => ({
                        ...item,
                        count: parseInt(item.count) || 0,
                      })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="construction_type" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Projects"]} />
                    <Bar dataKey="count" fill="#f093fb" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Projects Timeline Bar Chart */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ p: 3, height: 400 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight="600">
                    Projects Starting by Date (
                    {formatDateForDisplay(dateRange.startDate)} to{" "}
                    {formatDateForDisplay(dateRange.endDate)})
                  </Typography>

                  {/* Date Filter Controls */}
                  <Box display="flex" gap={2} alignItems="center">
                    <TextField
                      label="Start Date"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          startDate: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      sx={{ minWidth: 140 }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, endDate: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      sx={{ minWidth: 140 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const currentYear = new Date().getFullYear();
                        setDateRange({
                          startDate: new Date(currentYear, 0, 1)
                            .toISOString()
                            .split("T")[0],
                          endDate: new Date(currentYear, 11, 31)
                            .toISOString()
                            .split("T")[0],
                        });
                      }}
                      sx={{ minWidth: 80 }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  {projectsByDate.length > 0 ? (
                    <BarChart
                      data={projectsByDate}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                        formatter={(value) => [value, "Projects"]}
                      />
                      <Legend />
                      <Bar
                        dataKey="total"
                        fill="#667eea"
                        name="Total Projects"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <Typography variant="body2" color="text.secondary">
                        No project data available for the selected date range
                      </Typography>
                    </Box>
                  )}
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Recent Projects */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Recent Projects
                </Typography>
                <List>
                  {(analyticsData.projects?.recent || []).map((project) => (
                    <ListItem key={project.id}>
                      <ListItemIcon>
                        <MapIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={project.name}
                        secondary={`Status: ${project.status} | Engineer: ${
                          project.engineer?.name || "N/A"
                        }`}
                      />
                      <Chip
                        label={project.status}
                        color={
                          project.status === "completed" ? "success" : "primary"
                        }
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Fallback when data is not loaded */}
      {!dataLoaded && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No project data available
            </Typography>
            <Button
              variant="contained"
              onClick={fetchAnalyticsData}
              startIcon={<RefreshIcon />}
            >
              Load Data
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Custom Bar Chart Component (similar to Home component)
  const CustomBarChart = ({ data, title, height = 400 }) => {
    return (
      <Box height={height} width="100%">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="voterRegistrationRate"
                fill="#667eea"
                name="Registration Rate (%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="supporterDensity"
                fill="#f093fb"
                name="Supporter Density (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Typography variant="body2" color="text.secondary">
              No performance data available
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderTasksLabor = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Tasks & Labor Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Task status distribution and labor workforce analysis
          </Typography>
        </Box>
        <IconButton
          onClick={() => setTasksLaborHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Task Status Chart - Full Width */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Task Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={(analyticsData.tasks?.byStatus || []).map((item) => ({
                  ...item,
                  count: parseInt(item.count) || 0,
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="status"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  formatter={(value) => [value, "Tasks"]}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#667eea"
                  name="Tasks"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Labor Type Chart - Full Width Bar Chart */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Labor by Worker Type
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={(analyticsData.labor?.byType || []).map((item) => ({
                  name: item.worker_type
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                  count: parseInt(item.count) || 0,
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  formatter={(value) => [value, "Workers"]}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#f093fb"
                  name="Workers"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Labor Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Labor Summary
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography>Total Hours:</Typography>
                <Typography fontWeight="bold">
                  {analyticsData.labor?.summary?.totalHours || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Total Cost:</Typography>
                <Typography fontWeight="bold">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.labor?.summary?.totalCost || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Avg Hourly Rate:</Typography>
                <Typography fontWeight="bold">
                  KSh {analyticsData.labor?.summary?.avgHourlyRate || 0}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Recent Tasks
            </Typography>
            <List>
              {(analyticsData.tasks?.recent || []).map((task) => (
                <ListItem key={task.id}>
                  <ListItemIcon>
                    <BarChartIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.name}
                    secondary={`Project: ${
                      task.project?.name || "N/A"
                    } | Progress: ${task.progress_percent}%`}
                  />
                  <Chip
                    label={task.status}
                    color={task.status === "completed" ? "success" : "primary"}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Custom Pie Chart Component (similar to Home component)
  const CustomPieChart = ({ data, title, height = 300 }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_, index) => {
      setActiveIndex(index);
    };

    const renderActiveShape = (props) => {
      const RADIAN = Math.PI / 180;
      const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
        percent,
        value,
      } = props;
      const sin = Math.sin(-RADIAN * midAngle);
      const cos = Math.cos(-RADIAN * midAngle);
      const sx = cx + (outerRadius + 2) * cos;
      const sy = cy + (outerRadius + 2) * sin;
      const mx = cx + (outerRadius + 2) * cos;
      const my = cy + (outerRadius + 2) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 22;
      const ey = my;
      const textAnchor = cos >= 0 ? "start" : "end";

      return (
        <g>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
            {payload.name}
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 2}
            outerRadius={outerRadius + 6}
            fill={fill}
          />
          <path
            d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
            stroke={fill}
            fill="none"
          />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 4}
            y={ey}
            textAnchor={textAnchor}
            fill="#333"
            fontSize="small"
          >{`${value}`}</text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 4}
            y={ey}
            dy={18}
            textAnchor={textAnchor}
            fill="#999"
            fontSize="small"
          >
            {`(${(percent * 100).toFixed(0)}%)`}
          </text>
        </g>
      );
    };

    return (
      <Box height={height} width="100%">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="90%"
                innerRadius="50%"
                fill="#8884d8"
                onMouseEnter={onPieEnter}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="body2">No data available</Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderBudgetResources = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Budget & Resource Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Budget analysis and resource allocation across projects
          </Typography>
        </Box>
        <IconButton
          onClick={() => setBudgetResourcesHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Budget Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Budget Overview
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Budgeted:</Typography>
                <Typography variant="h6" color="primary">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.budget?.totalBudgeted || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Actual:</Typography>
                <Typography variant="h6" color="secondary">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.budget?.totalActual || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Variance:</Typography>
                <Typography
                  variant="h6"
                  color={
                    parseFloat(analyticsData.budget?.variance || 0) >= 0
                      ? "success.main"
                      : "error.main"
                  }
                >
                  KSh{" "}
                  {parseFloat(
                    analyticsData.budget?.variance || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.budget?.utilizationPercent || 0}%
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Budget by Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Budget by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              {(analyticsData.budget?.byCategory || []).length > 0 ? (
                <PieChart>
                  <Pie
                    data={(analyticsData.budget?.byCategory || []).map(
                      (item) => ({
                        name: item.category,
                        value: parseFloat(item.totalAmount) || 0,
                      })
                    )}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    innerRadius="50%"
                    fill="#8884d8"
                  >
                    {(analyticsData.budget?.byCategory || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `KSh ${parseFloat(value).toLocaleString()}`
                    }
                  />
                  <Legend />
                </PieChart>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No budget data available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Project Resources */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Project Resource Allocation
            </Typography>
            <List>
              {(analyticsData.projects?.resources || []).map((project) => (
                <ListItem key={project.project_id}>
                  <ListItemIcon>
                    <MapIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.project_name}
                    secondary={`Status: ${project.status} | Progress: ${project.progress_percent}%`}
                  />
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`Materials: ${project.materialCount}`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={`Labor: ${project.laborCount}`}
                      size="small"
                      color="secondary"
                    />
                    <Chip
                      label={`Equipment: ${project.equipmentCount}`}
                      size="small"
                      color="success"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPerformance = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Performance Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Task completion rates and project performance indicators
          </Typography>
        </Box>
        <IconButton
          onClick={() => setPerformanceHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Performance Overview
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Task Completion Rate:</Typography>
                <Typography variant="h5" color="primary">
                  {analyticsData.performance?.taskCompletionRate || 0}%
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Completed Tasks:</Typography>
                <Typography variant="h6" color="success.main">
                  {analyticsData.performance?.completedTasks || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>In Progress Tasks:</Typography>
                <Typography variant="h6" color="warning.main">
                  {analyticsData.performance?.inProgressTasks || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Projects at Risk:</Typography>
                <Typography
                  variant="h6"
                  color={
                    analyticsData.performance?.projectsAtRisk > 0
                      ? "error.main"
                      : "success.main"
                  }
                >
                  {analyticsData.performance?.projectsAtRisk || 0}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Material Utilization */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Material Utilization
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Required:</Typography>
                <Typography variant="h6" color="primary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalRequired || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Used:</Typography>
                <Typography variant="h6" color="secondary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalUsed || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.materials?.summary?.utilizationPercent || 0}%
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Cost:</Typography>
                <Typography variant="h6" color="success.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.materials?.summary?.totalCost || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Equipment Summary */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Equipment & Cost Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {analyticsData.overview?.totalEquipment || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Equipment
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography
                    variant="h4"
                    color="success.main"
                    fontWeight="bold"
                  >
                    {analyticsData.equipmentSummary?.availableEquipment || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Equipment
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography
                    variant="h4"
                    color="warning.main"
                    fontWeight="bold"
                  >
                    KSh{" "}
                    {parseFloat(
                      analyticsData.equipmentSummary?.totalDailyRentalCost || 0
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily Rental Cost
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {analyticsData.overview?.overdueTasks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderEquipmentMaterials = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Equipment & Materials Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Equipment availability, material utilization, and resource
            management
          </Typography>
        </Box>
        <IconButton
          onClick={() => setEquipmentMaterialsHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Equipment Availability */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Equipment Availability
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              {(analyticsData.equipment?.byAvailability || []).length > 0 ? (
                <PieChart>
                  <Pie
                    data={(analyticsData.equipment?.byAvailability || []).map(
                      (item) => ({
                        name: item.availability ? "Available" : "Unavailable",
                        value: parseInt(item.count) || 0,
                      })
                    )}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    innerRadius="50%"
                    fill="#8884d8"
                  >
                    {(analyticsData.equipment?.byAvailability || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Equipment"]} />
                  <Legend />
                </PieChart>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No equipment data available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Labor Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Labor Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(analyticsData.labor?.byStatus || []).map((item) => ({
                  ...item,
                  count: parseInt(item.count) || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip formatter={(value) => [value, "Workers"]} />
                <Bar dataKey="count" fill="#f093fb" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Material Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Material Summary
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Required:</Typography>
                <Typography variant="h6" color="primary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalRequired || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Used:</Typography>
                <Typography variant="h6" color="secondary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalUsed || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.materials?.summary?.utilizationPercent || 0}%
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Cost:</Typography>
                <Typography variant="h6" color="success.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.materials?.summary?.totalCost || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Spent:</Typography>
                <Typography variant="h6" color="warning.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.materials?.summary?.totalSpent || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Equipment Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Equipment Summary
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Available Equipment:</Typography>
                <Typography variant="h6" color="success.main">
                  {analyticsData.equipmentSummary?.availableEquipment || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Equipment:</Typography>
                <Typography variant="h6" color="primary">
                  {analyticsData.overview?.totalEquipment || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Daily Rental Cost:</Typography>
                <Typography variant="h6" color="warning.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.equipmentSummary?.totalDailyRentalCost || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Equipment Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.equipmentSummary?.availableEquipment > 0
                    ? Math.round(
                        (analyticsData.equipmentSummary?.availableEquipment /
                          analyticsData.overview?.totalEquipment) *
                          100
                      )
                    : 0}
                  %
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Issues Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Issues Summary
            </Typography>
            <Stack spacing={2}>
              {(analyticsData.issues?.byStatus || []).map((issue) => (
                <Box
                  key={issue.status}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.05)",
                    borderRadius: 2,
                    border: "1px solid rgba(25, 118, 210, 0.1)",
                  }}
                >
                  <Typography fontWeight="500" textTransform="capitalize">
                    {issue.status.replace("_", " ")} Issues
                  </Typography>
                  <Chip
                    label={issue.count}
                    color={
                      issue.status === "resolved"
                        ? "success"
                        : issue.status === "open"
                        ? "error"
                        : "warning"
                    }
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Documents Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Documents & Activity
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  backgroundColor: "rgba(76, 175, 80, 0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(76, 175, 80, 0.1)",
                }}
              >
                <Typography fontWeight="500">Total Documents:</Typography>
                <Chip
                  label={analyticsData.overview?.totalDocuments || 0}
                  color="success"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 152, 0, 0.1)",
                }}
              >
                <Typography fontWeight="500">Progress Updates:</Typography>
                <Chip
                  label={
                    analyticsData.recentActivity?.progressUpdates?.length || 0
                  }
                  color="warning"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  backgroundColor: "rgba(156, 39, 176, 0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(156, 39, 176, 0.1)",
                }}
              >
                <Typography fontWeight="500">Overdue Tasks:</Typography>
                <Chip
                  label={analyticsData.overview?.overdueTasks || 0}
                  color="secondary"
                />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderOverview();
      case 1:
        return renderProjects();
      case 2:
        return renderTasksLabor();
      case 3:
        return renderBudgetResources();
      case 4:
        return renderPerformance();
      case 5:
        return renderEquipmentMaterials();
      default:
        return renderOverview();
    }
  };

  // Show error message if there's an error
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchAnalyticsData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 1.5,
          color: "#2c3e50",
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Construction Management Dashboard
      </Typography>

      <Card
        sx={{
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(102, 126, 234, 0.1)",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "rgba(102, 126, 234, 0.1)",
            backgroundColor: "rgba(102, 126, 234, 0.02)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                color: "#667eea",
                fontWeight: 600,
                minHeight: 60,
                fontSize: "0.875rem",
                padding: "8px 12px",
                "&.Mui-selected": {
                  color: "#667eea",
                  backgroundColor: "rgba(102, 126, 234, 0.08)",
                },
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.05)",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#667eea",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 60 }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 1.5 }}>{renderTabContent()}</Box>
      </Card>

      {/* Help Dialogs */}
      <OverviewHelpDialog />
      <ProjectsHelpDialog />
      <TasksLaborHelpDialog />
      <BudgetResourcesHelpDialog />
      <PerformanceHelpDialog />
      <EquipmentMaterialsHelpDialog />
    </Box>
  );
};

export default Analytics;
