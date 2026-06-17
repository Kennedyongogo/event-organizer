import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { tickahub } from "../shared/tickahubPageStyles";

import "leaflet/dist/leaflet.css";

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

function MapViewport({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom(), { animate: false });
  }, [center, zoom, map]);
  return null;
}

export default function VenueMapView({ latitude, longitude, venue = "", height = 280 }) {
  const lat = toCoord(latitude);
  const lng = toCoord(longitude);
  const position = useMemo(
    () => (lat != null && lng != null ? { lat, lng } : null),
    [lat, lng]
  );

  if (!position) {
    return (
      <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>
        No map location set for this event
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${tickahub.borderSubtle}`,
        "& .leaflet-container": { height: "100%", width: "100%", bgcolor: tickahub.navy },
      }}
    >
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport center={position} zoom={15} />
        <Marker position={position}>
          {venue ? <Popup>{venue}</Popup> : null}
        </Marker>
      </MapContainer>
    </Box>
  );
}
