import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AppHeader from "@/app/_components/AppHeader";
import { createFeedback } from "@/app/actions";

export default function Home() {
  return (
    <>
      <AppHeader />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={5}>
        <Box>
          <Chip label="36Stories foundation" color="primary" size="small" />
          <Typography
            component="h1"
            variant="h1"
            sx={{ mt: 2, fontSize: { xs: "3.25rem", md: "5rem" }, lineHeight: 0.95 }}
          >
            Feedback, persisted.
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 2, maxWidth: 600, fontSize: "1.1rem", lineHeight: 1.65 }}
          >
            Capture qualitative feedback now. Connect it to customer context
            and business outcomes as 36Stories grows.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography color="primary" variant="overline" sx={{ fontWeight: 800 }}>
              New entry
            </Typography>
            <Typography component="h2" variant="h4">
              Capture feedback
            </Typography>
          </Stack>

          <form action={createFeedback}>
            <Stack spacing={3}>
              <TextField
                id="source"
                name="source"
                label="Source"
                defaultValue="widget"
                required
                fullWidth
              />
              <TextField
                id="message"
                name="message"
                label="Message"
                defaultValue="The feedback widget is clear and easy to use."
                required
                fullWidth
                multiline
                minRows={4}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button type="submit" variant="contained" size="large">
                  Save feedback
                </Button>
                <Button href="/dashboard" variant="outlined" size="large">
                  View dashboard
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Stack>
      </Container>
    </>
  );
}
