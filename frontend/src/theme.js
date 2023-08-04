import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: "#e0fbfd",
    100: "#b3f7fb",
    200: "#80f2fa",
    300: "#4dedf8",
    400: "#1be9f6",
    500: "#00f0ff", // Neon Cyan
    600: "#00cce6",
    700: "#009ea8",
    800: "#006f75",
    900: "#003c3f",
  },
};

const fonts = {
  heading: "'Outfit', 'Space Grotesk', system-ui, -apple-system, sans-serif",
  body: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  mono: "'Fira Code', 'Cascadia Code', monospace",
};

const styles = {
  global: {
    body: {
      bg: "#040516",
      color: "#f1f5f9",
      fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
    },
    // Custom scrollbar with cyan neon thumb
    "::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      background: "rgba(0, 240, 255, 0.2)",
      borderRadius: "3px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "rgba(0, 240, 255, 0.5)",
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "700",
      borderRadius: "xl",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: "rgba(6, 7, 26, 0.95)",
        backdropFilter: "blur(30px) saturate(2)",
        border: "1px solid rgba(0, 240, 255, 0.25)",
      },
    },
  },
  Select: {
    baseStyle: {
      field: {
        borderRadius: "xl",
      },
    },
  },
  Tooltip: {
    baseStyle: {
      bg: "rgba(6, 7, 26, 0.95)",
      color: "gray.200",
      borderRadius: "xl",
      border: "1px solid rgba(0, 240, 255, 0.25)",
      px: 3,
      py: 2,
      fontSize: "xs",
    },
  },
};

const theme = extendTheme({ config, colors, fonts, styles, components });

export default theme;
