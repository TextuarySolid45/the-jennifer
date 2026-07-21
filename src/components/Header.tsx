import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";

export const Header = () => {
  return (
    <AppBar>
      <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h2" color="textPrimary">Jennifers Bakery</Typography>
      </Toolbar>
    </AppBar>
  );
};
