import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Paper,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useDebouncedCallback } from "use-debounce";
import { tickahub, fieldSx } from "../shared/tickahubPageStyles";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };
const NOMINATIM = "/nominatim";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const toCoord = (value) => {
  if (value === "" || value == null) return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
};

const formatCoord = (n) => (n == null ? "" : Number(n).toFixed(6));

async function nominatimSearch(query) {
  if (!query?.trim()) return [];
  const url = `${NOMINATIM}/search?format=json&q=${encodeURIComponent(query.trim())}&limit=6&addressdetails=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

async function nominatimReverse(lat, lng) {
  const url = `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Reverse geocode failed");
  return res.json();
}

function formatPlaceName(data) {
  if (!data) return "";
  if (data.display_name) return data.display_name;
  const a = data.address || {};
  return [a.road, a.suburb, a.city || a.town || a.village, a.country].filter(Boolean).join(", ");
}

function MapViewport({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function VenueMapPicker({
  venue = "",
  latitude = "",
  longitude = "",
  onLocationChange,
  required = false,
}) {
  const [search, setSearch] = useState(venue || "");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const lat = toCoord(latitude);
  const lng = toCoord(longitude);
  const markerPos = lat != null && lng != null ? { lat, lng } : null;

  const mapCenter = useMemo(
    () => markerPos || DEFAULT_CENTER,
    [markerPos?.lat, markerPos?.lng]
  );

  useEffect(() => {
    setSearch(venue || "");
  }, [venue]);

  const resetLocation = useCallback(() => {
    setResults([]);
    onLocationChange?.({
      venue: "",
      venue_latitude: "",
      venue_longitude: "",
    });
  }, [onLocationChange]);

  const handleVenueInputChange = useCallback(
    (value) => {
      setSearch(value);
      if (!value.trim()) {
        resetLocation();
        return;
      }
      onLocationChange?.({
        venue: value,
        venue_latitude: latitude,
        venue_longitude: longitude,
      });
    },
    [latitude, longitude, onLocationChange, resetLocation]
  );

  const applyLocation = useCallback(
    async (nextLat, nextLng, nextVenue, fromReverse = false) => {
      let label = nextVenue ?? venue;
      if (fromReverse || !label) {
        try {
          setGeocoding(true);
          const data = await nominatimReverse(nextLat, nextLng);
          label = formatPlaceName(data) || label;
        } catch {
          // keep existing label
        } finally {
          setGeocoding(false);
        }
      }
      onLocationChange?.({
        venue: label || "",
        venue_latitude: formatCoord(nextLat),
        venue_longitude: formatCoord(nextLng),
      });
      if (label) setSearch(label);
    },
    [onLocationChange, venue]
  );

  const handleMarkerDrag = useCallback(
    (e) => {
      const pos = e.target.getLatLng();
      applyLocation(pos.lat, pos.lng, null, true);
    },
    [applyLocation]
  );

  const handleMapPick = useCallback(
    (nextLat, nextLng) => {
      applyLocation(nextLat, nextLng, null, true);
    },
    [applyLocation]
  );

  const runSearch = useDebouncedCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const data = await nominatimSearch(query);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, 400);

  useEffect(() => {
    runSearch(search);
  }, [search, runSearch]);

  const selectResult = (item) => {
    const nextLat = parseFloat(item.lat);
    const nextLng = parseFloat(item.lon);
    const label = item.display_name || formatPlaceName(item);
    setResults([]);
    setSearch(label);
    onLocationChange?.({
      venue: label,
      venue_latitude: formatCoord(nextLat),
      venue_longitude: formatCoord(nextLng),
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        label="venue"
        size="small"
        fullWidth
        required={required}
        value={search}
        onChange={(e) => handleVenueInputChange(e.target.value)}
        placeholder="Search address, venue, or city..."
        helperText="Search OpenStreetMap, pick a result, or drag the marker on the map"
        sx={fieldSx}
        InputProps={{
          endAdornment: searching || geocoding ? <CircularProgress size={16} sx={{ color: tickahub.cyan }} /> : null,
        }}
      />

      {results.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 0.5,
            mb: 1,
            bgcolor: tickahub.navy,
            border: `1px solid ${tickahub.borderSubtle}`,
            borderRadius: 2,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          <List dense disablePadding>
            {results.map((item) => (
              <ListItemButton key={item.place_id} onClick={() => selectResult(item)} sx={{ py: 1 }}>
                <ListItemText
                  primary={item.display_name}
                  primaryTypographyProps={{ fontSize: "0.8rem", color: "#fff" }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      <Box
        sx={{
          width: "100%",
          height: 320,
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${tickahub.borderSubtle}`,
          mt: 1,
          "& .leaflet-container": { height: "100%", width: "100%", bgcolor: tickahub.navy },
        }}
      >
        <MapContainer center={mapCenter} zoom={markerPos ? 15 : 6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewport center={mapCenter} zoom={markerPos ? 15 : undefined} />
          <MapClickHandler onPick={handleMapPick} />
          {markerPos && (
            <Marker
              position={markerPos}
              draggable
              eventHandlers={{ dragend: handleMarkerDrag }}
            />
          )}
        </MapContainer>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 1.5, flexWrap: "wrap" }}>
        <Typography variant="caption" sx={{ color: tickahub.textMuted, fontFamily: "monospace" }}>
          lat: {latitude || "—"}
        </Typography>
        <Typography variant="caption" sx={{ color: tickahub.textMuted, fontFamily: "monospace" }}>
          lng: {longitude || "—"}
        </Typography>
      </Box>
    </Box>
  );
}
