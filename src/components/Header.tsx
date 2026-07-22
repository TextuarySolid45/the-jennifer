import { AppBar, Box, Toolbar } from "@mui/material";

export const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          component="img"
          src="/header.png"
          alt="Jennifer's Bakery"
          sx={{
            display: "block",
            height: { xs: 150, md: 200 },
            width: "auto",
            maxWidth: "100%",
            backgroundColor: "white",
            borderRadius: 5,
          }}
        />
      </Toolbar>
    </AppBar>
  );
};
