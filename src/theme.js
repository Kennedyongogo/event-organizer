import { createTheme } from "@mui/material/styles";
import { tickahub } from "./tickahubTheme";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: tickahub.gold,
      light: "#FFC933",
      dark: tickahub.goldDark,
      contrastText: tickahub.navy,
    },
    secondary: {
      main: tickahub.cyan,
      light: "#33DDFF",
      dark: tickahub.cyanDark,
      contrastText: tickahub.navy,
    },
    background: {
      default: tickahub.navy,
      paper: tickahub.surface,
    },
    text: {
      primary: "#FFFFFF",
      secondary: tickahub.textMuted,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
});

export default theme;
