import { Box, Chip, Stack, Typography } from "@mui/material";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

const DashboardPage = async () => {
  await connection();

  const feedbackCount = await prisma.feedback.count();

  return (
    <Stack spacing={4}>
      <Box>
        <Chip label={`${feedbackCount} total`} color="primary" size="small" />
        <Typography
          component="h1"
          variant="h2"
          sx={{ mt: 2, fontSize: { xs: "2.75rem", md: "4rem" } }}
        >
          Feedback dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
          Explore the qualitative evidence collected by 36Stories. Customer and
          business enrichment will join this evidence here over time.
        </Typography>
      </Box>
    </Stack>
  );
};

export default DashboardPage;
