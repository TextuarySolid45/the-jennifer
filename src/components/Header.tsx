import { useMemo, useState } from "react";
import { AppBar, Box, Button, Chip, Toolbar, Typography } from "@mui/material";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { SignInDialog } from "./SignInDialog";
import { useGetVisits } from "../hooks/api/useGetVisits";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const formatVisitDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

const formatVisitRange = (startDate: string, endDate: string) =>
  startDate === endDate
    ? formatVisitDate(startDate)
    : `${formatVisitDate(startDate)} – ${formatVisitDate(endDate)}`;

export const Header = () => {
  const [signInOpen, setSignInOpen] = useState(false);
  const { authStatus, user, signOut } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);
  const isAuthenticated = authStatus === "authenticated";

  const { data: visitsResponse } = useGetVisits();
  const visits = visitsResponse?.data ?? [];

  const nextVisit = useMemo(() => {
    const today = getTodayDate();

    return visits
      .filter((visit) => Boolean(visit.id) && (visit.endDate ?? "") >= today)
      .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""))[0] ?? null;
  }, [visits]);

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="img"
              src="/header.png"
              alt="The Jennifer badge logo"
              sx={{
                display: "block",
                height: 44,
                width: 44,
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.6)",
                backgroundColor: "white",
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Fraunces", serif',
                fontWeight: 600,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                color: "#FFFFFF",
                lineHeight: 1,
              }}
            >
              The Jennifer
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ display: { xs: "none", md: "block" }, color: "secondary.main" }}
                >
                  {user?.signInDetails?.loginId}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => signOut()}
                  sx={{ color: "secondary.main", borderColor: "secondary.main" }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSignInOpen(true)}
                sx={{ color: "secondary.main", borderColor: "secondary.main" }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          background: "linear-gradient(180deg, #F6F1E8 0%, #FDFBF7 100%)",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ textTransform: "uppercase", fontWeight: 600, mb: 1 }}
        >
          Handmade Sourdough · Pretzels · Bagels
        </Typography>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 1.5 }}
        >
          Warm bread, baked in small batches
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 560, mx: "auto", mb: 2 }}>
          Order ahead below and it'll be ready when it's ready — fresh, homemade, and made just
          for you.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {nextVisit ? (
            <Chip
              color="secondary"
              label={`Next visit: ${formatVisitRange(nextVisit.startDate ?? "", nextVisit.endDate ?? "")}${
                nextVisit.label ? ` — ${nextVisit.label}` : ""
              }`}
              sx={{ fontWeight: 600, px: 1 }}
            />
          ) : (
            <Chip
              variant="outlined"
              label="No visit scheduled yet — check back soon"
              sx={{ fontWeight: 600, px: 1, borderColor: "secondary.main", color: "secondary.dark" }}
            />
          )}
        </Box>
      </Box>

      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
};
