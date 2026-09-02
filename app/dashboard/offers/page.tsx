import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { offerKindPolicy, offerModePolicy } from "@/lib/offers/policy";
import { DashboardPageHeader } from "../_components/DashboardPrimitives";
import { setOfferPublished } from "./actions";

const DashboardOffersPage = async () => {
  await connection();

  const site = await prisma.site.findFirst({
    where: {
      domain: "localhost",
      organization: { slug: "36stories-demo" },
    },
    select: {
      organization: { select: { slug: true } },
      offers: {
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          kind: true,
          mode: true,
          ctaLabel: true,
          isPublished: true,
          isFeatured: true,
          updatedAt: true,
          _count: { select: { events: true, signups: true } },
        },
      },
    },
  });

  const offers = site?.offers ?? [];

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        action={(
          <Button component="a" href="/dashboard/offers/new" variant="contained">
            Create offer
          </Button>
        )}
        description="Manage what your audience can discover, click, join, or show interest in."
        eyebrow="Your storefront"
        title="Offers"
      />

      {offers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ border: "1px dashed #bfdbfe", borderRadius: 3, bgcolor: "#f8fbff", p: 4, textAlign: "center" }}
        >
          <Typography sx={{ fontWeight: 800 }}>No offers yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Start with something live, something coming soon, or an idea you want to test.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {offers.map((offer) => (
            <Paper
              component="article"
              elevation={0}
              key={offer.id}
              sx={{
                border: "1px solid #e4e7ec",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(16, 24, 40, 0.035)",
                p: { xs: 2.5, sm: 3 },
                transition: "border-color 160ms ease, box-shadow 160ms ease",
                "&:hover": {
                  borderColor: "#bfdbfe",
                  boxShadow: "0 12px 28px rgba(37, 99, 235, 0.07)",
                },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <Typography component="h2" sx={{ fontSize: "1.2rem", fontWeight: 800, overflowWrap: "anywhere" }}>
                      {offer.title}
                    </Typography>
                    <Chip label={offerKindPolicy[offer.kind].label} size="small" />
                    <Chip label={offerModePolicy[offer.mode].label} size="small" variant="outlined" />
                    <Chip
                      color={offer.isPublished ? "success" : "default"}
                      label={offer.isPublished ? "Published" : "Draft"}
                      size="small"
                    />
                  </Stack>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                    {offer.ctaLabel} · {offer._count.events} events · {offer._count.signups} signups
                  </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Box component="form" action={setOfferPublished}>
                    <input name="offerId" type="hidden" value={offer.id} />
                    <input name="isPublished" type="hidden" value={offer.isPublished ? "false" : "true"} />
                    <Button fullWidth type="submit" variant={offer.isPublished ? "outlined" : "contained"}>
                      {offer.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                  </Box>
                  <Button component="a" href={`/dashboard/analytics#offer-${offer.id}`} variant="outlined">
                    View signal
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {site && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button component="a" href={`/bio/${site.organization.slug}`} target="_blank" variant="outlined">
            View bio page
          </Button>
          <Button component="a" href="/dashboard/analytics" variant="outlined">
            View analytics
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default DashboardOffersPage;
