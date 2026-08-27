"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#246b4b",
      dark: "#185139",
      light: "#dcece3",
    },
    background: {
      default: "#f5f3ed",
      paper: "#fffef9",
    },
    text: {
      primary: "#17221b",
      secondary: "#647068",
    },
    divider: "#d9ddd4",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h1: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 500,
      letterSpacing: "-0.045em",
    },
    h2: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 500,
      letterSpacing: "-0.025em",
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
