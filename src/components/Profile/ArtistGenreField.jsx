import { useState } from "react";
import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { tickahub, cyanGradient } from "../../tickahubTheme";
import { ARTIST_GENRE_SUGGESTIONS } from "../../utils/artistGenres";

const inputHeight = (size) => (size === "small" ? 40 : 56);

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: tickahub.navy,
    "& fieldset": { borderColor: tickahub.borderSubtle },
    "&:hover fieldset": { borderColor: tickahub.borderLight },
    "&.Mui-focused fieldset": { borderColor: tickahub.cyan },
  },
  "& .MuiInputLabel-root": { color: tickahub.textMuted },
  "& .MuiOutlinedInput-input": { color: "#fff" },
};

const addButtonSx = (size) => ({
  flexShrink: 0,
  alignSelf: { xs: "stretch", sm: "flex-end" },
  height: inputHeight(size),
  minWidth: { xs: "100%", sm: 112 },
  px: 2.25,
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 800,
  fontSize: size === "small" ? "0.875rem" : "0.95rem",
  letterSpacing: 0.15,
  background: cyanGradient,
  color: tickahub.navy,
  border: "none",
  boxShadow: `0 8px 20px ${tickahub.cyan}33`,
  transition: "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
  "& .MuiButton-startIcon": {
    marginRight: 0.75,
    "& svg": { fontSize: size === "small" ? 18 : 20 },
  },
  "&:hover": {
    background: cyanGradient,
    filter: "brightness(1.06)",
    boxShadow: `0 10px 24px ${tickahub.cyan}44`,
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: `0 4px 12px ${tickahub.cyan}28`,
  },
  "&.Mui-disabled": {
    opacity: 0.42,
    color: `${tickahub.navy}bb`,
    background: `${tickahub.cyan}33`,
    boxShadow: "none",
    transform: "none",
  },
});

export default function ArtistGenreField({
  value,
  onChange,
  label = "genres",
  size = "small",
  fullWidth = true,
  helperText = "Type any genre and press Enter or Add",
}) {
  const [draft, setDraft] = useState("");
  const genres = Array.isArray(value) ? value : [];

  const hasGenre = (genre) =>
    genres.some((item) => item.toLowerCase() === genre.toLowerCase());

  const addGenre = (raw) => {
    const next = String(raw || "").trim();
    if (!next || hasGenre(next)) {
      setDraft("");
      return;
    }
    onChange([...genres, next]);
    setDraft("");
  };

  const removeGenre = (index) => {
    onChange(genres.filter((_, itemIndex) => itemIndex !== index));
  };

  const availableSuggestions = ARTIST_GENRE_SUGGESTIONS.filter(
    (suggestion) => !hasGenre(suggestion)
  );

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", sm: "flex-end" }}
      >
        <TextField
          label={label}
          size={size}
          fullWidth
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addGenre(draft);
            }
          }}
          placeholder="e.g. Alté, Drill, Taarab"
          sx={{
            ...fieldSx,
            flex: 1,
            "& .MuiOutlinedInput-root": {
              ...fieldSx["& .MuiOutlinedInput-root"],
              height: inputHeight(size),
            },
          }}
        />
        <Button
          type="button"
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          onClick={() => addGenre(draft)}
          disabled={!draft.trim()}
          sx={addButtonSx(size)}
        >
          Add
        </Button>
      </Stack>

      {helperText ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.75,
            ml: 0.25,
            color: tickahub.textMuted,
            lineHeight: 1.45,
          }}
        >
          {helperText}
        </Typography>
      ) : null}

      {genres.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.25 }}>
          {genres.map((genre, index) => (
            <Chip
              key={`${genre}-${index}`}
              label={genre}
              size="small"
              onDelete={() => removeGenre(index)}
              sx={{
                bgcolor: `${tickahub.cyan}22`,
                color: tickahub.cyan,
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  color: `${tickahub.cyan}aa`,
                  "&:hover": { color: tickahub.cyan },
                },
              }}
            />
          ))}
        </Box>
      )}

      {availableSuggestions.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant="caption"
            sx={{ color: tickahub.textMuted, display: "block", mb: 0.75 }}
          >
            Quick add (optional)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {availableSuggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                size="small"
                variant="outlined"
                onClick={() => addGenre(suggestion)}
                sx={{
                  borderColor: tickahub.borderLight,
                  color: tickahub.textMuted,
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: tickahub.cyan,
                    color: tickahub.cyan,
                    bgcolor: `${tickahub.cyan}11`,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
