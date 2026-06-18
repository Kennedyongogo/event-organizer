import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { tickahub } from "../shared/tickahubPageStyles";
import { parseLineupFromApi } from "./eventLineup";

export default function EventLineupView({ lineup }) {
  const artists = parseLineupFromApi(lineup);

  if (!artists.length) {
    return (
      <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>
        No lineup artists listed
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {artists.map((artist, index) => (
        <Box
          key={`${artist.name}-${index}`}
          sx={{
            width: "100%",
            p: 1.5,
            borderRadius: 2,
            bgcolor: tickahub.navy,
            border: `1px solid ${tickahub.borderSubtle}`,
          }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 700 }}>{artist.name}</Typography>
          {artist.role ? (
            <Typography variant="caption" sx={{ color: tickahub.gold, fontWeight: 600 }}>
              {artist.role}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Stack>
  );
}
