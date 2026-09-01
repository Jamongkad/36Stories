import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { connection } from "next/server";
import { offerIntentEvents } from "@/lib/offers/policy";
import { prisma } from "@/lib/prisma";

const DashboardPage = async () => {
  await connection();

  const site = await prisma.site.findFirst({
    where: {
      domain: "localhost",
      organization: { slug: "36stories-demo" },
    },
    select: {
      id: true,
      organization: { select: { slug: true } },
      offers: { select: { isPublished: true } },
    },
  });
  const offers = site?.offers ?? [];
  const publishedOffers = offers.filter((offer) => offer.isPublished).length;
  const intentActions = site
    ? await prisma.offerEvent.count({
        where: {
          offer: { siteId: site.id },
          type: { in: offerIntentEvents },
        },
      })
    : 0;

  return (
    <Stack spacing={4}>
      <Box>
        <Chip label={`${offers.length} offers`} color="primary" size="small" />
        <Typography
          component="h1"
          variant="h2"
          sx={{ mt: 2, fontSize: { xs: "2.75rem", md: "4rem" } }}
        >
          Overview
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
          Create offers, share your bio page, and learn what your audience is most likely to act on.
        </Typography>
      </Box>

      {offers.length === 0 ? (
        <Paper variant="outlined" sx={{ borderRadius: 4, p: { xs: 3, sm: 4 } }}>
          <Typography component="h2" variant="h4">
            Create your first offer
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 620, lineHeight: 1.6 }}>
            Add a live product, a coming-soon launch, or an idea you want to pressure-test.
          </Typography>
          <Button component="a" href="/dashboard/offers/new" sx={{ mt: 2.5 }} variant="contained">
            Create your first offer
          </Button>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
              <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                Published offers
              </Typography>
              <Typography sx={{ fontSize: "2rem", fontWeight: 800, mt: 0.5 }}>
                {publishedOffers}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
              <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                Intent actions
              </Typography>
              <Typography sx={{ fontSize: "2rem", fontWeight: 800, mt: 0.5 }}>
                {intentActions}
              </Typography>
            </Paper>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component="a" href="/dashboard/offers" variant="contained">
              Manage offers
            </Button>
            <Button component="a" href="/dashboard/analytics" variant="outlined">
              View analytics
            </Button>
            {site && (
              <Button component="a" href={`/bio/${site.organization.slug}`} target="_blank" variant="outlined">
                View bio page
              </Button>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default DashboardPage;
