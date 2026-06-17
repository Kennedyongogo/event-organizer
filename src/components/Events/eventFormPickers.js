import dayjs from "dayjs";
import { tickahub } from "../shared/tickahubPageStyles";

export const pickerFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: tickahub.navy,
    "& fieldset": { borderColor: tickahub.borderSubtle },
    "&:hover fieldset": { borderColor: tickahub.borderLight },
    "&.Mui-focused fieldset": { borderColor: tickahub.cyan },
  },
  "& .MuiInputLabel-root": { color: tickahub.textMuted },
  "& .MuiOutlinedInput-input": { color: "#fff" },
  "& .MuiFormHelperText-root": { color: tickahub.textMuted },
  "& .MuiIconButton-root": { color: tickahub.cyan },
};

export const pickerPaperSx = {
  bgcolor: tickahub.surface,
  color: "#fff",
  border: `1px solid ${tickahub.borderSubtle}`,
  "& .MuiPickersDay-root.Mui-selected": {
    bgcolor: `${tickahub.cyan} !important`,
    color: `${tickahub.navy} !important`,
  },
  "& .MuiClock-pin, & .MuiClockPointer-root": { bgcolor: tickahub.cyan },
  "& .MuiClockPointer-thumb": { borderColor: tickahub.cyan, bgcolor: tickahub.cyan },
  "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
    bgcolor: tickahub.cyan,
    color: tickahub.navy,
  },
};

export const getPickerSlotProps = (required = false) => ({
  textField: { size: "small", fullWidth: true, required, sx: pickerFieldSx },
  openPickerButton: { sx: { color: tickahub.cyan } },
  desktopPaper: { sx: pickerPaperSx },
  mobilePaper: { sx: pickerPaperSx },
  layout: { sx: pickerPaperSx },
});

export const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const parseTimeValue = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  const parsed = dayjs(`1970-01-01T${raw.length === 5 ? `${raw}:00` : raw}`);
  return parsed.isValid() ? parsed : null;
};

export const appendEventScheduleFields = (formData, eventDate, startTime, endTime) => {
  if (eventDate?.isValid()) {
    formData.append("event_date", eventDate.format("YYYY-MM-DD"));
  }
  if (startTime?.isValid()) {
    formData.append("start_time", startTime.format("HH:mm:ss"));
  }
  if (endTime?.isValid()) {
    formData.append("end_time", endTime.format("HH:mm:ss"));
  }
};
