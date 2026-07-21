import { AppBar, Toolbar, Typography } from "@mui/material";

export const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h2" color="textPrimary">
          Jennifers Bakery
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
