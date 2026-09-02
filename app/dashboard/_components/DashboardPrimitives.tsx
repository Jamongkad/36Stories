import { Box, Paper, Stack, Typography } from "@mui/material";

type PageHeaderProps = {
  action?: React.ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

export const DashboardPageHeader = ({
  action,
  description,
  eyebrow,
  title,
}: PageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between" }}
  >
    <Box>
      {eyebrow && (
        <Typography
          color="primary.dark"
          sx={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          {eyebrow}
        </Typography>
      )}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mt: eyebrow ? 0.75 : 0 }}>
        <Typography component="h1" variant="h2" sx={{ fontSize: { xs: "2.25rem", sm: "2.75rem" } }}>
          {title}
        </Typography>
        <Box
          aria-hidden="true"
          sx={{ bgcolor: "#3b82f6", borderRadius: "50%", boxShadow: "0 0 0 5px #dbeafe", height: 10, width: 10 }}
        />
      </Stack>
      <Typography color="text.secondary" sx={{ lineHeight: 1.65, mt: 1, maxWidth: 680 }}>
        {description}
      </Typography>
    </Box>
    {action}
  </Stack>
);

const metricTones = {
  blue: { background: "#eff6ff", bubble: "#dbeafe", foreground: "#1d4ed8" },
  cyan: { background: "#ecfeff", bubble: "#cffafe", foreground: "#0e7490" },
  violet: { background: "#f5f3ff", bubble: "#ede9fe", foreground: "#6d28d9" },
} as const;

type MetricCardProps = {
  explanation?: string;
  label: string;
  mark?: string;
  tone?: keyof typeof metricTones;
  value: React.ReactNode;
};

export const DashboardMetricCard = ({
  explanation,
  label,
  mark = "↗",
  tone = "blue",
  value,
}: MetricCardProps) => {
  const colors = metricTones[tone];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: colors.background,
        border: "1px solid rgba(37, 99, 235, 0.06)",
        borderRadius: 3,
        minWidth: 0,
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          alignItems: "center",
          bgcolor: colors.bubble,
          borderRadius: 2,
          color: colors.foreground,
          display: "flex",
          fontWeight: 900,
          height: 38,
          justifyContent: "center",
          mb: 2,
          width: 38,
        }}
      >
        {mark}
      </Box>
      <Typography sx={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.035em", overflowWrap: "anywhere" }}>
        {value}
      </Typography>
      <Typography sx={{ fontWeight: 750, mt: 0.5 }}>{label}</Typography>
      {explanation && (
        <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.5, mt: 0.5 }}>
          {explanation}
        </Typography>
      )}
    </Paper>
  );
};
