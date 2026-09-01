import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AppHeader from "@/app/_components/AppHeader";

export default function Home() {
  return (
    <>
      <AppHeader />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={5}>
          <Box>
            <Chip label="Demand testing for emerging creators" color="primary" size="small" />
            <Typography
              component="h1"
              variant="h1"
              sx={{ mt: 2, fontSize: { xs: "3.25rem", md: "5rem" }, lineHeight: 0.95 }}
            >
              Learn what your audience wants next.
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 2, maxWidth: 640, fontSize: "1.1rem", lineHeight: 1.65 }}
            >
              Publish products, services, and early ideas on one bio page. Measure which offers
              earn views, clicks, waitlist signups, and real expressions of interest.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
              <Button href="/dashboard/offers/new" size="large" variant="contained">
                Create an offer
              </Button>
              <Button href="/bio/36stories-demo" size="large" variant="outlined">
                View demo bio page
              </Button>
            </Stack>
          </Box>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h4">
              Pressure-test before you commit
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
              Send visitors to something available now, collect a waitlist for something coming
              soon, or measure interest in an idea before you build it.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
