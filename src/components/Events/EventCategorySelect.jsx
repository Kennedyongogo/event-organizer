import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import { tickahub, fieldSx } from "../shared/tickahubPageStyles";

const POPULAR = [
  "Concert",
  "Music Festival",
  "Conference",
  "Sports",
  "Comedy",
  "Nightlife",
  "Food Festival",
  "Workshop",
  "Party",
  "Other",
];

const listboxSx = {
  maxHeight: 280,
  bgcolor: tickahub.surface,
  color: "#fff",
  "& .MuiAutocomplete-option": {
    fontSize: "0.875rem",
    py: 1,
    borderBottom: `1px solid ${tickahub.borderSubtle}`,
    "&[aria-selected='true']": {
      bgcolor: `${tickahub.cyan}22`,
    },
    "&.Mui-focused": {
      bgcolor: `${tickahub.cyan}14`,
    },
  },
};

export default function EventCategorySelect({ value, onChange, required = false }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    fetch("/api/events/categories")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setOptions(result.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const sortedOptions = useMemo(() => {
    if (!options.length) return [];
    const popularSet = new Set(POPULAR);
    const popular = POPULAR.filter((c) => options.includes(c));
    const rest = options.filter((c) => !popularSet.has(c));
    return [...popular, ...rest];
  }, [options]);

  const showPopularHint = !inputValue.trim();

  return (
    <Autocomplete
      value={value || null}
      onChange={(_, newValue) => onChange(newValue || "")}
      inputValue={inputValue}
      onInputChange={(_, newInput, reason) => {
        if (reason === "reset" && newInput === "" && value) return;
        setInputValue(newInput);
      }}
      options={sortedOptions}
      loading={loading}
      autoHighlight
      clearOnBlur={false}
      handleHomeEndKeys
      disablePortal={false}
      noOptionsText="No matching category"
      loadingText="Loading categories..."
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const isPopular = POPULAR.includes(option);
        return (
          <Box component="li" key={key} {...optionProps}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
              <Typography sx={{ fontSize: "0.875rem", color: "#fff", flex: 1 }}>{option}</Typography>
              {showPopularHint && isPopular && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: tickahub.gold,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Popular
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="category"
          size="small"
          required={required}
          placeholder="Search or pick a category..."
          helperText="Type to filter — popular categories appear first"
          sx={fieldSx}
        />
      )}
      slotProps={{
        paper: {
          sx: {
            bgcolor: tickahub.surface,
            border: `1px solid ${tickahub.borderSubtle}`,
            borderRadius: 2,
            mt: 0.5,
            boxShadow: `0 12px 40px rgba(0,0,0,0.45)`,
          },
        },
        listbox: { sx: listboxSx },
        popper: {
          sx: { zIndex: 1400 },
        },
      }}
      sx={{
        width: "100%",
        "& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator": {
          color: tickahub.textMuted,
        },
      }}
    />
  );
}
