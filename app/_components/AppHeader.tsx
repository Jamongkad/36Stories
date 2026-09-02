import { AppBar, Box, Chip, Toolbar, Typography } from "@mui/material";

const AppHeader = () => (
  <AppBar
    position="sticky"
    color="transparent"
    elevation={0}
    sx={{
      backdropFilter: "blur(18px)",
      bgcolor: "rgba(255, 255, 255, 0.88)",
      boxShadow: "0 1px 0 rgba(16, 24, 40, 0.05)",
    }}
  >
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: { xs: 2, sm: 3 } }}>
        <Box
          aria-hidden="true"
          sx={{
            alignItems: "center",
            bgcolor: "primary.main",
            borderRadius: 2.5,
            color: "primary.contrastText",
            display: "flex",
            fontSize: "0.78rem",
            fontWeight: 800,
            height: 36,
            justifyContent: "center",
            mr: 1.25,
            width: 36,
          }}
        >
          36
        </Box>
        <Typography
          component="a"
          href="/dashboard"
          variant="h6"
          color="text.primary"
          sx={{ flexGrow: 1, fontWeight: 800, textDecoration: "none" }}
        >
          36Stories
        </Typography>
        <Chip
          label="Creator workspace"
          size="small"
          sx={{
            bgcolor: "#eff6ff",
            color: "#1d4ed8",
            display: { xs: "none", sm: "inline-flex" },
          }}
        />
      </Toolbar>
  </AppBar>
);

export default AppHeader;
