import React from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { tickahub, fieldSx } from "../shared/tickahubPageStyles";

const emptyItem = () => ({
  name: "",
  price: "",
  pickup_point: "",
  quantity: "",
  commission_rate: "",
  imageFile: null,
  imagePreview: "",
  existingImageUrl: "",
});

export const parseMerchandiseFromApi = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    id: item.id || "",
    name: item.name || "",
    price: item.price != null ? String(item.price) : "",
    pickup_point: item.pickup_point || "",
    quantity:
      item.quantity_available != null ? String(item.quantity_available) : "",
    commission_rate:
      item.commission_rate != null ? String(item.commission_rate) : "",
    imageFile: null,
    imagePreview: "",
    existingImageUrl: item.image_url || "",
  }));
};

export const serializeMerchandiseForSubmit = (items) =>
  items
    .filter((item) => item.name?.trim() && item.price !== "" && item.pickup_point?.trim())
    .map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      name: item.name.trim(),
      price: parseFloat(item.price),
      pickup_point: item.pickup_point.trim(),
      quantity_available:
        item.quantity !== "" ? parseInt(item.quantity, 10) : 0,
      ...(item.commission_rate !== ""
        ? { commission_rate: parseFloat(item.commission_rate) }
        : {}),
      ...(item.existingImageUrl && !item.imageFile
        ? { image_url: item.existingImageUrl }
        : {}),
    }));

export const appendMerchandiseToFormData = (formData, items) => {
  const payload = serializeMerchandiseForSubmit(items);
  if (payload.length) {
    formData.append("merchandise", JSON.stringify(payload));
  }
  let imageIndex = 0;
  items.forEach((item) => {
    if (!item.name?.trim() || item.price === "" || !item.pickup_point?.trim()) {
      return;
    }
    if (item.imageFile) {
      formData.append(`merchandise_image_${imageIndex}`, item.imageFile);
    }
    imageIndex += 1;
  });
};

const EventMerchandiseFields = ({ items, onChange }) => {
  const updateItem = (index, patch) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

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
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => onChange([...items, emptyItem()]);

  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <Typography variant="body2" sx={{ color: tickahub.textMuted }}>
        Optional add-ons fans can buy with tickets. Pickup is at the venue on
        event day.
      </Typography>

      {items.length === 0 && (
        <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
          No merchandise yet.
        </Typography>
      )}

      {items.map((item, index) => (
        <Box
          key={item.id || `merch-${index}`}
          sx={{
            width: "100%",
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${tickahub.borderSubtle}`,
            bgcolor: tickahub.navy,
          }}
        >
          <Stack spacing={1.5}>
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
                onChange={(e) => updateItem(index, { quantity: e.target.value })}
                inputProps={{ min: 0, step: 1 }}
                sx={fieldSx}
              />
            </Stack>
            <TextField
              label="pickup point"
              size="small"
              fullWidth
              placeholder="Main gate, left booth"
              value={item.pickup_point}
              onChange={(e) =>
                updateItem(index, { pickup_point: e.target.value })
              }
              sx={fieldSx}
            />
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant="outlined" size="small">
                {item.imageFile || item.existingImageUrl
                  ? "Change image"
                  : "Add image"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageSelect(index, e)}
                />
              </Button>
              {(item.imagePreview || item.existingImageUrl) && (
                <Box
                  component="img"
                  src={item.imagePreview || item.existingImageUrl}
                  alt={item.name || "Merchandise"}
                  sx={{
                    width: 56,
                    height: 56,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: `1px solid ${tickahub.borderSubtle}`,
                  }}
                />
              )}
            </Stack>
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
      ))}

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
