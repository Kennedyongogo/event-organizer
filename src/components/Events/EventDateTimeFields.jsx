import React from "react";
import { Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { getPickerSlotProps } from "./eventFormPickers";

export default function EventDateTimeFields({
  eventDate,
  onEventDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={1.5} sx={{ width: "100%" }}>
        <DatePicker
          label="event_date"
          value={eventDate}
          onChange={onEventDateChange}
          slotProps={getPickerSlotProps(true)}
        />
        <TimePicker
          label="start_time"
          value={startTime}
          onChange={onStartTimeChange}
          ampm
          slotProps={getPickerSlotProps(true)}
        />
        <TimePicker
          label="end_time"
          value={endTime}
          onChange={onEndTimeChange}
          ampm
          slotProps={getPickerSlotProps()}
        />
      </Stack>
    </LocalizationProvider>
  );
}
