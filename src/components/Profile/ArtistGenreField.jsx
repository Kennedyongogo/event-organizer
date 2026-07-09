import { Autocomplete, Chip, TextField } from "@mui/material";
import { tickahub } from "../../tickahubTheme";
import { ARTIST_GENRE_SUGGESTIONS } from "../../utils/artistGenres";

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

export default function ArtistGenreField({
  value,
  onChange,
  label = "genres",
  size = "small",
  fullWidth = true,
  helperText = "Add one or more genres",
}) {
  const genres = Array.isArray(value) ? value : [];

  return (
    <Autocomplete
      multiple
      freeSolo
      options={ARTIST_GENRE_SUGGESTIONS}
      value={genres}
      onChange={(_, next) => onChange(next.map((item) => String(item).trim()).filter(Boolean))}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={`${option}-${index}`}
            label={option}
            size="small"
            sx={{
              bgcolor: `${tickahub.cyan}22`,
              color: tickahub.cyan,
              fontWeight: 600,
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size={size}
          fullWidth={fullWidth}
          helperText={helperText}
          sx={fieldSx}
        />
      )}
    />
  );
}
