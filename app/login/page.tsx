import { Box, Paper, Stack, Typography } from "@mui/material";
import LoginForm from "./_components/LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const returnTo = Array.isArray(query.returnTo) ? query.returnTo[0] : query.returnTo;
  return (
    <Box sx={{ alignItems: "center", bgcolor: "#f8fafc", display: "flex", minHeight: "100vh", p: 2 }}>
      <Paper elevation={0} sx={{ border: "1px solid #e4e7ec", borderRadius: 4, maxWidth: 440, mx: "auto", p: { xs: 3, sm: 5 }, width: "100%" }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography color="primary.dark" sx={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>36Stories</Typography>
          <Typography component="h1" variant="h3">Creator sign in</Typography>
          <Typography color="text.secondary">Sign in to manage your private dashboard.</Typography>
        </Stack>
        <LoginForm returnTo={returnTo} />
      </Paper>
    </Box>
  );
}
