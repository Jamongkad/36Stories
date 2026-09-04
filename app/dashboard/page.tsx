import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { connection } from "next/server";
import {
  DashboardMetricCard,
  DashboardPageHeader,
} from "./_components/DashboardPrimitives";
import { offerIntentEvents } from "@/lib/offers/policy";
import { prisma } from "@/lib/prisma";
import { requireCreatorContext } from "@/lib/creatorAuth";

const DashboardPage = async () => {
  await connection();
  const creator = await requireCreatorContext();

  const site = await prisma.site.findFirst({
    where: { id: creator.siteId, organizationId: creator.organizationId },
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
          offer: { siteId: creator.siteId },
          type: { in: offerIntentEvents },
        },
      })
    : 0;

  return (
    <Stack spacing={{ xs: 4, md: 5 }}>
      <DashboardPageHeader
        description="Create offers, share your bio page, and learn what your audience is most likely to act on."
        eyebrow="Welcome back"
        title="Overview"
      />

      {offers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 72%)",
            border: "1px solid #dbeafe",
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
          }}
        >
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
            <DashboardMetricCard
              explanation="Offers currently visible on your public bio page."
              label="Published offers"
              mark="P"
              value={publishedOffers}
            />
            <DashboardMetricCard
              explanation="Clicks, signups, and interest actions across your offers."
              label="Intent actions"
              mark="↗"
              tone="violet"
              value={intentActions}
            />
          </Box>
          <Paper
            elevation={0}
            sx={{
              alignItems: { sm: "center" },
              border: "1px solid #e4e7ec",
              borderRadius: 3,
              display: { sm: "flex" },
              justifyContent: "space-between",
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box sx={{ mb: { xs: 2, sm: 0 }, mr: { sm: 3 } }}>
              <Typography sx={{ fontWeight: 800 }}>Ready for your next signal?</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Keep your offers current, then check which one earns the strongest response.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ flexShrink: 0 }}>
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
          </Paper>
        </>
      )}
    </Stack>
  );
};

export default DashboardPage;
