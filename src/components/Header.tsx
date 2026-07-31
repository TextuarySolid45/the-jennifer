import { useState } from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { SignInDialog } from "./SignInDialog";

export const Header = () => {
  const [signInOpen, setSignInOpen] = useState(false);
  const { authStatus, user, signOut } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);
  const isAuthenticated = authStatus === "authenticated";

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "center", position: "relative" }}>
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

        <Box
          sx={{
            position: "absolute",
            right: 16,
            bottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: "none", md: "block" } }}>
                {user?.signInDetails?.loginId}
              </Typography>
              <Button color="inherit" variant="outlined" size="small" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button color="inherit" variant="outlined" size="small" onClick={() => setSignInOpen(true)}>
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>

      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
    </AppBar>
  );
};
