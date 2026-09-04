import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { connection } from "next/server";
import {
  getAnalyticsStartDate,
  parseAnalyticsPeriod,
  summarizeAnalytics,
  type AnalyticsPeriod,
  type OfferAnalyticsSummary,
} from "@/lib/offerAnalytics";
import { offerKindPolicy } from "@/lib/offers/policy";
import { prisma } from "@/lib/prisma";
import { requireCreatorContext } from "@/lib/creatorAuth";
import {
  DashboardMetricCard,
  DashboardPageHeader,
} from "../_components/DashboardPrimitives";

const periodLabels: Record<AnalyticsPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

const formatSource = (source: string) =>
  source === "Direct or unknown"
    ? source
    : source
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

const statusColor = (status: OfferAnalyticsSummary["status"]) => {
  if (status === "Strong signal") {
    return "success" as const;
  }

  if (status === "Promising") {
    return "primary" as const;
  }

  if (status === "Needs more traffic") {
    return "default" as const;
  }

  return "warning" as const;
};

const DashboardAnalyticsPage = async ({
  searchParams,
}: PageProps<"/dashboard/analytics">) => {
  await connection();
  const creator = await requireCreatorContext();
  const query = await searchParams;
  const period = parseAnalyticsPeriod(query.period);
  const startDate = getAnalyticsStartDate(period);
  const dateFilter = startDate ? { createdAt: { gte: startDate } } : undefined;

  const site = await prisma.site.findFirst({
    where: { id: creator.siteId, organizationId: creator.organizationId },
    select: {
      offers: {
        where: { isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        select: {
          id: true,
          title: true,
          kind: true,
          mode: true,
          ctaType: true,
          events: {
            where: dateFilter,
            select: {
              id: true,
              type: true,
              sessionId: true,
              source: true,
            },
          },
          signups: {
            where: dateFilter,
            select: { id: true, email: true, source: true },
          },
        },
      },
    },
  });

  const analytics = summarizeAnalytics(site?.offers ?? []);
  const strongestOffer = analytics.strongestOffer;
  const recommendation = strongestOffer
    ? `${strongestOffer.title} is showing your strongest intent signal. Consider featuring it first and asking your audience what would make them act.`
    : analytics.offers.length === 0
      ? "Publish your first offer to start learning what your audience wants."
      : "Keep sharing your bio page. An offer needs at least 10 viewing sessions before 36Stories compares its signal.";

  return (
    <Stack spacing={{ xs: 4, md: 5 }}>
      <DashboardPageHeader
        action={(
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {Object.entries(periodLabels).map(([value, label]) => (
              <Button
                component="a"
                href={`/dashboard/analytics?period=${value}`}
                key={value}
                size="small"
                variant={period === value ? "contained" : "outlined"}
              >
                {label}
              </Button>
            ))}
          </Stack>
        )}
        description="See which offers are earning real intent—not just likes or comments."
        eyebrow="Audience intent"
        title="Analytics"
      />

      <Paper
        sx={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 58%, #4f46e5 100%)",
          borderRadius: 4,
          boxShadow: "0 18px 42px rgba(37, 99, 235, 0.2)",
          color: "white",
          p: { xs: 3, sm: 4 },
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 700 }} variant="body2">
          What should I focus on?
        </Typography>
        <Typography component="h2" sx={{ fontSize: { xs: "1.65rem", sm: "2rem" }, mt: 1, lineHeight: 1.25 }}>
          {strongestOffer ? strongestOffer.title : "Gather a little more traffic"}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.65, mt: 1.5, maxWidth: 760 }}>
          {recommendation}
        </Typography>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        <DashboardMetricCard
          label="Offer views"
          mark="V"
          value={analytics.totalViews.toLocaleString()}
          explanation="Unique viewing sessions where an offer card was actually seen."
        />
        <DashboardMetricCard
          label="Intent actions"
          mark="↗"
          tone="violet"
          value={analytics.totalIntentActions.toLocaleString()}
          explanation="Clicks, waitlist signups, or interest actions matched to each offer’s goal."
        />
        <DashboardMetricCard
          label="Strongest response"
          mark="S"
          tone="cyan"
          value={strongestOffer?.title ?? "Not enough data"}
          explanation="36Stories waits for at least 10 views before comparing offers."
        />
      </Box>

      <Stack component="section" aria-labelledby="offer-signals-heading" spacing={2}>
        <Box>
          <Typography component="h2" id="offer-signals-heading" variant="h4">
            Offer signals
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Compare the action each offer is asking visitors to take.
          </Typography>
        </Box>

        {analytics.offers.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ border: "1px dashed #bfdbfe", borderRadius: 3, bgcolor: "#f8fbff", p: 3, textAlign: "center" }}
          >
            <Typography sx={{ fontWeight: 800 }}>No published offers yet</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Publish an offer and share your bio page to begin collecting intent.
            </Typography>
            <Button component="a" href="/dashboard/offers" sx={{ mt: 2 }} variant="contained">
              Go to offers
            </Button>
          </Paper>
        ) : (
          analytics.offers.map((offer) => (
            <Paper
              component="article"
              id={`offer-${offer.id}`}
              key={offer.id}
              elevation={0}
              sx={{
                border: "1px solid #e4e7ec",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(16, 24, 40, 0.035)",
                p: { xs: 2.5, sm: 3 },
                scrollMarginTop: 24,
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ alignItems: { sm: "flex-start" }, justifyContent: "space-between" }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                      <Typography component="h3" sx={{ fontSize: "1.2rem", fontWeight: 800 }}>
                        {offer.title}
                      </Typography>
                      <Chip label={offer.status} color={statusColor(offer.status)} size="small" />
                    </Stack>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>
                      {offerKindPolicy[offer.kind].label} · {offer.primaryActionLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { sm: "right" } }}>
                    <Typography sx={{ fontSize: "1.75rem", fontWeight: 800 }}>
                      {offer.intentRate}%
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      intent rate
                    </Typography>
                  </Box>
                </Stack>

                <Typography sx={{ lineHeight: 1.6 }}>
                  This offer was seen in <strong>{offer.views}</strong> unique viewing sessions and generated{" "}
                  <strong>{offer.intentActions}</strong> {offer.primaryActionLabel.toLowerCase()}.
                </Typography>

                {offer.sources.length > 0 && (
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                      Where views came from
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}>
                      {offer.sources.slice(0, 3).map((source) => (
                        <Chip
                          key={source.source}
                          label={`${formatSource(source.source)} · ${source.views}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Paper>
          ))
        )}
      </Stack>

      <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.6 }}>
        Intent signals show interest, not completed purchases. Use them to decide what to promote,
        improve, stock, or build next.
      </Typography>
    </Stack>
  );
};

export default DashboardAnalyticsPage;
