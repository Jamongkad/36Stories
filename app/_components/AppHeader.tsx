import { AppBar, Button, Container, Toolbar, Typography } from "@mui/material";

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
          href="/"
          variant="h6"
          color="text.primary"
          sx={{ flexGrow: 1, fontWeight: 800, textDecoration: "none" }}
        >
          36Stories
        </Typography>
        <Button color="inherit" href="/">
          Capture
        </Button>
        <Button color="inherit" href="/dashboard">
          Dashboard
        </Button>
      </Toolbar>
    </Container>
  </AppBar>
);

export default AppHeader;
