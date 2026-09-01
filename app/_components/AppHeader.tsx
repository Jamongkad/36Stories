import { AppBar, Container, Toolbar, Typography } from "@mui/material";

const AppHeader = () => (
  <AppBar
    position="static"
    color="transparent"
    elevation={0}
    sx={{ borderBottom: 1, borderColor: "divider" }}
  >
    <Container maxWidth="lg">
      <Toolbar disableGutters sx={{ gap: 1 }}>
        <Typography
          component="a"
          href="/dashboard"
          variant="h6"
          color="text.primary"
          sx={{ flexGrow: 1, fontWeight: 800, textDecoration: "none" }}
        >
          36Stories
        </Typography>
      </Toolbar>
    </Container>
  </AppBar>
);

export default AppHeader;
