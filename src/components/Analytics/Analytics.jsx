import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  TextField,
  Button,
  alpha,
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
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  ConfirmationNumber as TicketIcon,
  TrendingUp as TrendingIcon,
  CalendarMonth as CalendarIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import {
  tickahub,
  goldGradient,
  pageShellSx,
  tabsSx,
  PageHeader,
  eventStatusColor,
} from "../shared/tickahubPageStyles";

const STATUS_CHART_COLORS = {
  pending: tickahub.gold,
  approved: tickahub.cyan,
  rejected: tickahub.goldDark,
  completed: tickahub.cyanDark,
  cancelled: tickahub.textMuted,
};

const chartTooltipSx = {
  backgroundColor: tickahub.surfaceElevated,
  border: `1px solid ${tickahub.borderLight}`,
  borderRadius: 8,
  color: "#fff",
};

const formatKes = (value) =>
  `KES ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const startOfYear = () => new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
const endOfYear = () => new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];

function MetricCard({ label, value, icon: Icon, accent = tickahub.cyan }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        bgcolor: tickahub.surface,
        border: `1px solid ${tickahub.borderSubtle}`,
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(accent, 0.2)} 0%, transparent 70%)`,
        }}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: tickahub.textMuted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {label}
          </Typography>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.45rem", mt: 0.75, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
        {Icon && (
          <Box sx={{ width: 40, height: 40, borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha(accent, 0.14), border: `1px solid ${alpha(accent, 0.28)}`, flexShrink: 0 }}>
            <Icon sx={{ color: accent, fontSize: 22 }} />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

function Panel({ title, children }) {
  return (
    <Paper elevation={0} sx={{ bgcolor: tickahub.surface, border: `1px solid ${tickahub.borderSubtle}`, borderRadius: 0, overflow: "hidden", width: "100%" }}>
      <Box sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${tickahub.borderSubtle}`, background: `linear-gradient(135deg, ${alpha(tickahub.gold, 0.1)}, transparent)` }}>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.9rem" }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );
}

function ActivityRow({ primary, meta, chip }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ py: 1.25, borderBottom: `1px solid ${tickahub.borderSubtle}`, "&:last-child": { borderBottom: "none" } }}>
      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
        {primary}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        {chip}
        {meta && <Typography sx={{ color: tickahub.textMuted, fontSize: "0.72rem" }}>{meta}</Typography>}
      </Stack>
    </Stack>
  );
}

function StatusChip({ status }) {
  const color = eventStatusColor(status);
  return (
    <Chip label={status} size="small" sx={{ bgcolor: `${color}22`, color, fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize", height: 22 }} />
  );
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: startOfYear(), endDate: endOfYear() });

  const organizerId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?.id;
    } catch {
      return null;
    }
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    if (!organizerId) {
      setError("Organizer account not found. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [overviewRes, eventsRes, revenueRes] = await Promise.all([
        fetch(`/api/organizers/${organizerId}/dashboard?${queryParams}`, { headers }),
        fetch(`/api/organizers/${organizerId}/analytics/events?${queryParams}`, { headers }),
        fetch(`/api/organizers/${organizerId}/analytics/revenue?${queryParams}`, { headers }),
      ]);

      const [overviewData, eventsData, revenueData] = await Promise.all([
        overviewRes.json(),
        eventsRes.json(),
        revenueRes.json(),
      ]);

      if (!overviewData.success || !eventsData.success || !revenueData.success) {
        throw new Error(
          overviewData.message || eventsData.message || revenueData.message || "Failed to load dashboard"
        );
      }

      setOverview(overviewData.data);
      setEvents(eventsData.data);
      setRevenue(revenueData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, organizerId]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const metrics = overview?.metrics;

  const statusChartData = useMemo(
    () => (events?.eventsByStatus || []).map((row) => ({ name: row.status, count: row.count })),
    [events]
  );

  const categoryChartData = useMemo(
    () => (events?.eventsByCategory || []).map((row) => ({ name: row.category, count: row.count })),
    [events]
  );

  const categoryChartHeight = Math.max(categoryChartData.length * 32, 200);

  const revenueChartData = useMemo(
    () =>
      (revenue?.revenueByPeriod || []).map((row) => ({
        name: row.period,
        earnings: Number(row.organizerEarnings),
        gross: Number(row.grossSales),
      })),
    [revenue]
  );

  const topEventsChartData = useMemo(
    () =>
      (revenue?.topEvents || []).map((row) => ({
        name: row.eventName?.length > 20 ? `${row.eventName.slice(0, 20)}…` : row.eventName,
        earnings: Number(row.organizerEarnings),
      })),
    [revenue]
  );

  const renderOverview = () => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="My events" value={metrics?.events?.total ?? 0} icon={EventIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Upcoming" value={metrics?.events?.upcoming ?? 0} icon={CalendarIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Tickets sold" value={metrics?.tickets?.sold ?? 0} icon={TicketIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Pending review" value={metrics?.events?.pending ?? 0} icon={PendingIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="My earnings" value={formatKes(metrics?.sales?.earnings)} icon={MoneyIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Gross sales" value={formatKes(metrics?.sales?.gross)} icon={TrendingIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Platform fees" value={formatKes(metrics?.sales?.platformFees)} icon={MoneyIcon} accent={tickahub.cyanDark} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Ticket sales" value={formatKes(metrics?.sales?.ticketSales)} icon={TicketIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Merchandise sales" value={formatKes(metrics?.sales?.merchandiseSales)} icon={MoneyIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Ticket fees" value={formatKes(metrics?.sales?.ticketCommission)} icon={TrendingIcon} accent={tickahub.cyanDark} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Merch fees" value={formatKes(metrics?.sales?.merchandiseCommission)} icon={MoneyIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Panel title="Recent events">
            {(overview?.recent?.events || []).length === 0 ? (
              <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>—</Typography>
            ) : (
              overview.recent.events.map((event) => (
                <ActivityRow
                  key={event.id}
                  primary={event.name}
                  meta={formatDate(event.eventDate || event.createdAt)}
                  chip={<StatusChip status={event.status} />}
                />
              ))
            )}
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Panel title="Recent ticket sales">
            {(overview?.recent?.purchases || []).length === 0 ? (
              <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>—</Typography>
            ) : (
              overview.recent.purchases.map((purchase) => (
                <ActivityRow
                  key={purchase.id}
                  primary={purchase.eventName}
                  meta={formatKes(purchase.amount)}
                  chip={<Typography sx={{ color: tickahub.textMuted, fontSize: "0.72rem" }}>{formatDate(purchase.createdAt)}</Typography>}
                />
              ))
            )}
          </Panel>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderEvents = () => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Total events" value={events?.summary?.totalEvents ?? 0} icon={EventIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Approved" value={events?.summary?.approvedEvents ?? 0} icon={EventIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Tickets sold" value={events?.summary?.totalTicketsSold ?? 0} icon={TicketIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Completed" value={events?.summary?.completedEvents ?? 0} icon={TrendingIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Panel title="Event status">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={statusChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={tickahub.borderSubtle} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: tickahub.textMuted, fontSize: 12 }} tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
            <YAxis tick={{ fill: tickahub.textMuted, fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={chartTooltipSx} labelFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {statusChartData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_CHART_COLORS[entry.name] || tickahub.cyan} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Your categories">
        {categoryChartData.length === 0 ? (
          <Typography sx={{ color: tickahub.textMuted }}>—</Typography>
        ) : (
          <Box sx={{ width: "100%", maxHeight: 480, overflowY: "auto" }}>
            <ResponsiveContainer width="100%" height={categoryChartHeight}>
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid stroke={tickahub.borderSubtle} horizontal={false} />
                <XAxis type="number" tick={{ fill: tickahub.textMuted, fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fill: tickahub.textMuted, fontSize: 10 }} />
                <Tooltip contentStyle={chartTooltipSx} />
                <Bar dataKey="count" fill={tickahub.gold} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Panel>
    </Stack>
  );

  const renderRevenue = () => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="My earnings" value={formatKes(revenue?.summary?.organizerEarnings)} icon={MoneyIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Gross sales" value={formatKes(revenue?.summary?.grossSales)} icon={TrendingIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Platform fees" value={formatKes(revenue?.summary?.platformFees)} icon={MoneyIcon} accent={tickahub.cyanDark} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Transactions" value={revenue?.summary?.transactionCount ?? 0} icon={TicketIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Ticket sales" value={formatKes(revenue?.summary?.ticketSales)} icon={TicketIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Merchandise sales" value={formatKes(revenue?.summary?.merchandiseSales)} icon={MoneyIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Ticket fees" value={formatKes(revenue?.summary?.ticketCommission)} icon={TrendingIcon} accent={tickahub.cyanDark} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Merch fees" value={formatKes(revenue?.summary?.merchandiseCommission)} icon={MoneyIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Panel title="Earnings trend">
        {revenueChartData.length === 0 ? (
          <Typography sx={{ color: tickahub.textMuted }}>—</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tickahub.gold} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={tickahub.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={tickahub.borderSubtle} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: tickahub.textMuted, fontSize: 11 }} />
              <YAxis tick={{ fill: tickahub.textMuted, fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={chartTooltipSx} formatter={(value) => formatKes(value)} />
              <Legend wrapperStyle={{ color: tickahub.textMuted }} />
              <Area type="monotone" dataKey="earnings" name="My earnings" stroke={tickahub.gold} fill="url(#earningsFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="gross" name="Gross sales" stroke={tickahub.cyan} fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Top events">
        {topEventsChartData.length === 0 ? (
          <Typography sx={{ color: tickahub.textMuted }}>—</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(topEventsChartData.length * 44, 220)}>
            <BarChart data={topEventsChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke={tickahub.borderSubtle} horizontal={false} />
              <XAxis type="number" tick={{ fill: tickahub.textMuted, fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickahub.textMuted, fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipSx} formatter={(value) => formatKes(value)} />
              <Bar dataKey="earnings" fill={tickahub.gold} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>
    </Stack>
  );

  const orgName = overview?.organizer?.name;

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={DashboardIcon}
        iconGradient={goldGradient}
        title="Dashboard"
        subtitle={orgName ? `${orgName} — your events, tickets & earnings` : "Your events, tickets & earnings"}
        action={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              label="From"
              type="date"
              size="small"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: 130, sm: 150 }, "& .MuiOutlinedInput-root": { bgcolor: tickahub.navy, borderRadius: 2, "& fieldset": { borderColor: tickahub.borderSubtle }, "& input": { color: "#fff", fontSize: "0.85rem" } }, "& .MuiInputLabel-root": { color: tickahub.textMuted } }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: 130, sm: 150 }, "& .MuiOutlinedInput-root": { bgcolor: tickahub.navy, borderRadius: 2, "& fieldset": { borderColor: tickahub.borderSubtle }, "& input": { color: "#fff", fontSize: "0.85rem" } }, "& .MuiInputLabel-root": { color: tickahub.textMuted } }}
            />
          </Stack>
        }
      />

      <Paper elevation={0} sx={{ bgcolor: tickahub.surface, border: `1px solid ${tickahub.borderSubtle}`, borderRadius: 0, overflow: "hidden" }}>
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: 1.5, borderBottom: `1px solid ${tickahub.borderSubtle}` }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={tabsSx}>
            <Tab label="Overview" />
            <Tab label="Events" />
            <Tab label="Revenue" />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: 320 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: tickahub.cyan }} />
            </Box>
          ) : error ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchAnalyticsData}>Retry</Button>} sx={{ bgcolor: alpha(tickahub.goldDark, 0.12), color: "#fff" }}>
              {error}
            </Alert>
          ) : (
            <>
              {activeTab === 0 && renderOverview()}
              {activeTab === 1 && renderEvents()}
              {activeTab === 2 && renderRevenue()}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
