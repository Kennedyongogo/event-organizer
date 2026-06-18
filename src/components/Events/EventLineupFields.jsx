import React from "react";
import { Stack, TextField, Button, Typography } from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { tickahub, fieldSx } from "../shared/tickahubPageStyles";
import { emptyLineupEntry } from "./eventLineup";

export default function EventLineupFields({ lineup, onChange }) {
  const entries = Array.isArray(lineup) ? lineup : [];

  const updateEntry = (index, field, value) => {
    const next = [...entries];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const removeEntry = (index) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const addEntry = () => {
    onChange([...entries, emptyLineupEntry()]);
  };

  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <Typography sx={{ color: tickahub.textMuted, fontSize: "0.8rem" }}>
        Add performing artists for this event (optional).
      </Typography>
      {entries.length === 0 ? (
        <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>No artists added yet.</Typography>
      ) : (
        entries.map((artist, index) => (
          <Stack
            key={index}
            spacing={1.5}
            sx={{
              width: "100%",
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${tickahub.borderSubtle}`,
              bgcolor: tickahub.navy,
            }}
          >
            <TextField
              label="artist name"
              size="small"
              fullWidth
              required
              value={artist.name}
              onChange={(e) => updateEntry(index, "name", e.target.value)}
              placeholder="Artist or band name"
              sx={fieldSx}
            />
            <TextField
              label="role"
              size="small"
              fullWidth
              value={artist.role}
              onChange={(e) => updateEntry(index, "role", e.target.value)}
              placeholder="Headliner, DJ, Host..."
              sx={fieldSx}
            />
            <Button
              size="small"
              startIcon={<CloseIcon />}
              onClick={() => removeEntry(index)}
              sx={{ color: tickahub.textMuted, textTransform: "none", alignSelf: "flex-start" }}
            >
              Remove artist
            </Button>
          </Stack>
        ))
      )}
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={addEntry}
        sx={{ color: tickahub.cyan, textTransform: "none", alignSelf: "flex-start" }}
      >
        Add artist
      </Button>
    </Stack>
  );
}
