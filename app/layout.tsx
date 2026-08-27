import type { Metadata } from "next";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "36Stories Feedback",
  description: "A persisted feedback foundation for 36Stories",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Providers>
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
          <Box component="main">{children}</Box>
        </Providers>
      </body>
    </html>
  );
}
