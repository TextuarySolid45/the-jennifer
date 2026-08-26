import type { ThemeOptions } from "@mui/material";

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#5F7050",
      light: "#73825E",
      dark: "#4B5940",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#C89A3D",
      light: "#D8B463",
      dark: "#A87722",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FDFBF7",
      paper: "#F6F1E8",
    },
    text: {
      primary: "#56463A",
      secondary: "#8A7666",
    },
    divider: "#E6DED2",
    success: {
      main: "#73825E",
    },
    warning: {
      main: "#C89A3D",
    },
    info: {
      main: "#A8B59A",
    },
    grey: {
      "50": "#FDFBF7",
      "100": "#F6F1E8",
      "200": "#EEE7DA",
      "300": "#DCE6D8",
      "400": "#C8D1C1",
      "500": "#A8B59A",
      "600": "#73825E",
      "700": "#5F7050",
      "800": "#4B5940",
      "900": "#2F372A",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "#5F7050",
    },
    h2: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color: "#5F7050",
    },
    h3: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
      color: "#5F7050",
    },
    h4: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
      color: "#5F7050",
    },
    h5: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Fraunces", serif',
      fontWeight: 600,
    },
    subtitle1: {
      color: "#8A7666",
      letterSpacing: "0.04em",
    },
    body1: {
      color: "#56463A",
    },
    body2: {
      color: "#8A7666",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: "12px 28px",
          boxShadow: "none",
        },
        colorPrimary: {
          backgroundColor: "#5F7050",
          color: "#FFFFFF",
        },
        colorSecondary: {
          backgroundColor: "#C89A3D",
          color: "#FFFFFF",
        },
        outlined: {
          borderColor: "#C89A3D",
          color: "#5F7050",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FDFBF7",
          borderRadius: 20,
          border: "1px solid #EEE7DA",
          boxShadow: "0px 6px 24px rgba(95,112,80,0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#F6F1E8",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#5F7050",
          color: "#FFFFFF",
          boxShadow: "none",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: "1px solid #EEE7DA",
          boxShadow: "0px 6px 24px rgba(95,112,80,0.06)",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 72,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "8px 24px 24px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
        },
      },
    },
  },
};
