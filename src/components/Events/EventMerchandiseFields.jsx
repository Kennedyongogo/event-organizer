import React from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { tickahub, fieldSx } from "../shared/tickahubPageStyles";
import VenueMapPicker from "./VenueMapPicker";
import { buildAssetUrl, normalizeStorageImagePath } from "../../utils/assetUrl";

const emptyItem = () => ({
  name: "",
  price: "",
  pickup_type: "event",
  pickup_point: "",
  pickup_address: "",
  pickup_latitude: "",
  pickup_longitude: "",
  quantity: "",
  commission_rate: "",
  image_url: "",
  imageFile: null,
  imagePreview: "",
});

const toCoordString = (value) => {
  if (value === "" || value == null) return "";
  const n = parseFloat(value);
  return Number.isFinite(n) ? Number(n).toFixed(6) : "";
};

export const isMerchandiseItemComplete = (item) => {
  if (!item?.name?.trim() || item.price === "") return false;
  const pickupType =
    item.pickup_type === "both"
      ? "both"
      : item.pickup_type === "custom"
        ? "custom"
        : "event";

  if (pickupType === "custom") {
    const lat = parseFloat(item.pickup_latitude);
    const lng = parseFloat(item.pickup_longitude);
    return (
      Boolean(item.pickup_address?.trim()) &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    );
  }

  if (pickupType === "both") {
    const lat = parseFloat(item.pickup_latitude);
    const lng = parseFloat(item.pickup_longitude);
    return (
      Boolean(item.pickup_point?.trim()) &&
      Boolean(item.pickup_address?.trim()) &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    );
  }

  return Boolean(item.pickup_point?.trim());
};

export const parseMerchandiseFromApi = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const hasCustomCoords =
      item.pickup_latitude != null &&
      item.pickup_longitude != null &&
      String(item.pickup_address || "").trim();
    const pickupType =
      item.pickup_type === "both"
        ? "both"
        : item.pickup_type === "custom" || hasCustomCoords
          ? "custom"
          : "event";

    return {
      id: item.id || "",
      name: item.name || "",
      price: item.price != null ? String(item.price) : "",
      pickup_type: pickupType,
      pickup_point: item.pickup_point || "",
      pickup_address: item.pickup_address || "",
      pickup_latitude: toCoordString(item.pickup_latitude),
      pickup_longitude: toCoordString(item.pickup_longitude),
      quantity:
        item.quantity_available != null ? String(item.quantity_available) : "",
      commission_rate:
        item.commission_rate != null ? String(item.commission_rate) : "",
      image_url: item.image_url || "",
      imageFile: null,
      imagePreview: "",
    };
  });
};

export const getMerchandiseDisplayImage = (item) =>
  item?.imagePreview || buildAssetUrl(item?.image_url);

export const serializeMerchandiseForSubmit = (items) =>
  items.filter(isMerchandiseItemComplete).map((item) => {
    const pickupType =
      item.pickup_type === "both"
        ? "both"
        : item.pickup_type === "custom"
          ? "custom"
          : "event";
    const storedImageUrl = normalizeStorageImagePath(item.image_url);
    const payload = {
      ...(item.id ? { id: item.id } : {}),
      name: item.name.trim(),
      price: parseFloat(item.price),
      pickup_type: pickupType,
      quantity_available:
        item.quantity !== "" ? parseInt(item.quantity, 10) : 0,
      ...(item.commission_rate !== ""
        ? { commission_rate: parseFloat(item.commission_rate) }
        : {}),
      ...(storedImageUrl && !item.imageFile ? { image_url: storedImageUrl } : {}),
    };

    if (pickupType === "custom") {
      return {
        ...payload,
        pickup_address: item.pickup_address.trim(),
        pickup_latitude: parseFloat(item.pickup_latitude),
        pickup_longitude: parseFloat(item.pickup_longitude),
        pickup_point: item.pickup_point?.trim() || "",
      };
    }

    if (pickupType === "both") {
      return {
        ...payload,
        pickup_point: item.pickup_point.trim(),
        pickup_address: item.pickup_address.trim(),
        pickup_latitude: parseFloat(item.pickup_latitude),
        pickup_longitude: parseFloat(item.pickup_longitude),
      };
    }

    return {
      ...payload,
      pickup_point: item.pickup_point.trim(),
      pickup_address: null,
      pickup_latitude: null,
      pickup_longitude: null,
    };
  });

export const appendMerchandiseToFormData = (formData, items) => {
  const payload = serializeMerchandiseForSubmit(items);
  if (payload.length) {
    formData.append("merchandise", JSON.stringify(payload));
  }
  let imageIndex = 0;
  items.forEach((item) => {
    if (!isMerchandiseItemComplete(item)) return;
    if (item.imageFile) {
      formData.append(`merchandise_image_${imageIndex}`, item.imageFile);
    }
    imageIndex += 1;
  });
};

const EventMerchandiseFields = ({ items, onChange, eventVenue = "" }) => {
  const updateItem = (index, patch) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const handlePickupTypeChange = (index, nextType) => {
    if (!nextType) return;
    const patch = { pickup_type: nextType };
    if (nextType === "event") {
      patch.pickup_address = "";
      patch.pickup_latitude = "";
      patch.pickup_longitude = "";
    }
    updateItem(index, patch);
  };

  const renderEventPickupFields = (item, index) => (
    <Stack spacing={1}>
      {eventVenue ? (
        <Typography
          variant="caption"
          sx={{ color: tickahub.textMuted, lineHeight: 1.45 }}
        >
          Event venue: {eventVenue}. Describe where inside the venue buyers
          should collect this item.
        </Typography>
      ) : (
        <Typography
          variant="caption"
          sx={{ color: tickahub.textMuted, lineHeight: 1.45 }}
        >
          Set the event venue above, then describe where buyers collect this item
          during the event.
        </Typography>
      )}
      <TextField
        label="pickup spot at event"
        size="small"
        fullWidth
        placeholder="Main gate, left merch booth"
        value={item.pickup_point}
        onChange={(e) => updateItem(index, { pickup_point: e.target.value })}
        sx={fieldSx}
      />
    </Stack>
  );

  const renderCustomPickupFields = (
    item,
    index,
    { showInstructions = true, optionalInstructions = false } = {}
  ) => (
    <Stack spacing={1.25}>
      <Typography
        variant="caption"
        sx={{ color: tickahub.textMuted, lineHeight: 1.45 }}
      >
        Search and pin the other pickup location buyers may use.
      </Typography>
      <VenueMapPicker
        label="pickup location"
        venue={item.pickup_address}
        latitude={item.pickup_latitude}
        longitude={item.pickup_longitude}
        mapHeight={260}
        helperText="Search, pick a result, or tap/drag the marker on the map"
        onLocationChange={({ venue, venue_latitude, venue_longitude }) =>
          updateItem(index, {
            pickup_address: venue || "",
            pickup_latitude: venue_latitude || "",
            pickup_longitude: venue_longitude || "",
          })
        }
      />
      {showInstructions && (
        <TextField
          label={
            optionalInstructions ? "pickup instructions (optional)" : "pickup instructions"
          }
          size="small"
          fullWidth
          placeholder="Counter 2, ask for your name"
          value={item.pickup_point}
          onChange={(e) => updateItem(index, { pickup_point: e.target.value })}
          sx={fieldSx}
        />
      )}
    </Stack>
  );

  const handleImageSelect = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateItem(index, {
        imageFile: file,
        imagePreview: e.target.result,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const clearImage = (index) => {
    updateItem(index, {
      imageFile: null,
      imagePreview: "",
      image_url: "",
    });
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => onChange([...items, emptyItem()]);

  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <Typography variant="body2" sx={{ color: tickahub.textMuted }}>
        Optional add-ons fans can buy with tickets. For each item, choose one
        pickup location or let buyers pick between the event and another location.
      </Typography>

      {items.length === 0 && (
        <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
          No merchandise yet.
        </Typography>
      )}

      {items.map((item, index) => {
        const displayImage = getMerchandiseDisplayImage(item);
        const pickupType =
      item.pickup_type === "both"
        ? "both"
        : item.pickup_type === "custom"
          ? "custom"
          : "event";

        return (
          <Box
            key={item.id || `merch-${index}`}
            sx={{
              width: "100%",
              borderRadius: 2,
              border: `1px solid ${tickahub.borderSubtle}`,
              bgcolor: tickahub.navy,
              overflow: "hidden",
            }}
          >
            <Stack spacing={1.5} sx={{ p: 1.5 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Button component="label" variant="outlined" size="small">
                  {displayImage ? "Replace image" : "Add image"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageSelect(index, e)}
                  />
                </Button>
                {displayImage && (
                  <Button
                    size="small"
                    onClick={() => clearImage(index)}
                    sx={{
                      color: tickahub.textMuted,
                      textTransform: "none",
                    }}
                  >
                    Remove image
                  </Button>
                )}
              </Stack>
            </Stack>

            {displayImage && (
              <Box
                sx={{
                  width: "100%",
                  borderTop: `1px solid ${tickahub.borderSubtle}`,
                  borderBottom: `1px solid ${tickahub.borderSubtle}`,
                }}
              >
                <Box
                  component="img"
                  src={displayImage}
                  alt={item.name || "Merchandise"}
                  sx={{
                    width: "100%",
                    maxHeight: 280,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            )}

            <Stack spacing={1.5} sx={{ p: 1.5 }}>
              <TextField
                label="item name"
                size="small"
                fullWidth
                placeholder="Event T-Shirt"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                sx={fieldSx}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="price (KES)"
                  type="number"
                  size="small"
                  fullWidth
                  value={item.price}
                  onChange={(e) => updateItem(index, { price: e.target.value })}
                  inputProps={{ min: 0, step: "0.01" }}
                  sx={fieldSx}
                />
                <TextField
                  label="quantity available"
                  type="number"
                  size="small"
                  fullWidth
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, { quantity: e.target.value })
                  }
                  inputProps={{ min: 0, step: 1 }}
                  sx={fieldSx}
                />
              </Stack>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: tickahub.textMuted,
                    fontWeight: 700,
                    display: "block",
                    mb: 0.75,
                  }}
                >
                  Pickup location
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={pickupType}
                  onChange={(_, value) => handlePickupTypeChange(index, value)}
                  sx={{
                    "& .MuiToggleButton-root": {
                      color: tickahub.textMuted,
                      borderColor: tickahub.borderSubtle,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      py: 0.75,
                    },
                    "& .MuiToggleButton-root.Mui-selected": {
                      color: tickahub.gold,
                      bgcolor: alpha(tickahub.gold, 0.12),
                      borderColor: alpha(tickahub.gold, 0.45),
                    },
                  }}
                >
                  <ToggleButton value="event">At event</ToggleButton>
                  <ToggleButton value="custom">Other location</ToggleButton>
                  <ToggleButton value="both">Either location</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {pickupType === "event" && renderEventPickupFields(item, index)}

              {pickupType === "custom" && (
                <Stack spacing={1.25}>
                  <Typography
                    variant="caption"
                    sx={{ color: tickahub.textMuted, lineHeight: 1.45 }}
                  >
                    Buyers must pick up at this pinned location.
                  </Typography>
                  {renderCustomPickupFields(item, index, { optionalInstructions: true })}
                </Stack>
              )}

              {pickupType === "both" && (
                <Stack spacing={1.5}>
                  <Typography
                    variant="caption"
                    sx={{ color: tickahub.textMuted, lineHeight: 1.45 }}
                  >
                    Set both locations. Buyers will choose one at checkout.
                  </Typography>
                  {renderEventPickupFields(item, index)}
                  {renderCustomPickupFields(item, index, { showInstructions: false })}
                </Stack>
              )}

              <TextField
                label="commission_rate (%)"
                type="number"
                size="small"
                fullWidth
                placeholder="Uses event commission if blank"
                value={item.commission_rate}
                onChange={(e) =>
                  updateItem(index, { commission_rate: e.target.value })
                }
                inputProps={{ min: 0, max: 50, step: "0.1" }}
              helperText="Platform fee on this item. Leave blank to use the event commission rate."
              sx={fieldSx}
            />
            <Button
                size="small"
                startIcon={<CloseIcon />}
                onClick={() => removeItem(index)}
                sx={{
                  color: tickahub.textMuted,
                  textTransform: "none",
                  alignSelf: "flex-start",
                }}
              >
                Remove item
              </Button>
            </Stack>
          </Box>
        );
      })}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={addItem}
        sx={{
          color: tickahub.cyan,
          textTransform: "none",
          alignSelf: "flex-start",
          bgcolor: alpha(tickahub.cyan, 0.08),
        }}
      >
        Add merchandise item
      </Button>
    </Stack>
  );
};

export default EventMerchandiseFields;
