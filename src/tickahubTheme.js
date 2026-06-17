/** TickaHub palette — matches mobile EventTheme */
export const tickahub = {
  navy: "#0B0F1A",
  navyLight: "#151B2E",
  gold: "#FFB800",
  goldDark: "#FF8C00",
  cyan: "#00D4FF",
  cyanDark: "#0096C7",
  surface: "#1A2235",
  surfaceElevated: "#232D45",
  textMuted: "rgba(255, 255, 255, 0.58)",
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  borderLight: "rgba(255, 255, 255, 0.14)",
};

export const goldGradient = `linear-gradient(135deg, ${tickahub.gold}, ${tickahub.goldDark})`;
export const cyanGradient = `linear-gradient(135deg, ${tickahub.cyan}, ${tickahub.cyanDark})`;
export const backgroundGradient = `linear-gradient(135deg, #0B0F1A 0%, #12182B 50%, #0D1528 100%)`;
export const heroGradient = `linear-gradient(135deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 100%)`;

export const slideTransition = "0.65s cubic-bezier(0.4, 0, 0.2, 1)";
