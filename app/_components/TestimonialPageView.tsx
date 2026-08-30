import {
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { DisplayPageConfigurationV1 } from "@/lib/displayPage";

export type TestimonialPageItem = {
  id: string;
  title: string | null;
  message: string;
  rating: number | null;
  attribution: string | null;
};

type TestimonialPageViewProps = {
  config: DisplayPageConfigurationV1;
  testimonials: TestimonialPageItem[];
  ctaLabel?: string;
  reviewHref?: string;
  showReviewCta?: boolean;
  preview?: boolean;
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "36";

const Rating = ({ value }: { value: number }) => {
  const normalized = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <Box aria-label={`${normalized} out of 5 stars`} sx={{ color: "#f6b73c" }}>
      <span aria-hidden="true">{"★".repeat(normalized)}</span>
    </Box>
  );
};

const TestimonialPageView = ({
  config,
  testimonials,
  ctaLabel = "Leave a review",
  reviewHref,
  showReviewCta = false,
  preview = false,
}: TestimonialPageViewProps) => {
  return (
    <Box
      component={preview ? "div" : "main"}
      sx={{
        minHeight: preview ? 640 : "100dvh",
        overflowX: "hidden",
        bgcolor: "#f7f2e9",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(230, 180, 104, 0.22), transparent 22rem)",
        color: "#231f1a",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Stack
        spacing={4}
        sx={{
          width: "100%",
          maxWidth: 620,
          mx: "auto",
        }}
      >
        <Stack component="header" spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <Avatar
            aria-hidden="true"
            sx={{
              width: 72,
              height: 72,
              bgcolor: "#1f6849",
              color: "white",
              fontSize: "1.3rem",
              fontWeight: 800,
            }}
          >
            {getInitials(config.displayName)}
          </Avatar>
          <Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: { xs: "2rem", sm: "2.35rem" },
                fontWeight: 500,
                lineHeight: 1.08,
                overflowWrap: "anywhere",
              }}
            >
              {config.displayName}
            </Typography>
            {config.bio && (
              <Typography
                sx={{
                  color: "#655f57",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  mt: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {config.bio}
              </Typography>
            )}
          </Box>
        </Stack>

        {config.links.length > 0 && (
          <Stack component="nav" aria-label="Creator links" spacing={1.5}>
            {config.links.map((link) => (
              <Button
                component="a"
                href={link.url}
                key={link.id}
                rel="noopener noreferrer"
                target="_blank"
                variant="outlined"
                sx={{
                  minHeight: 52,
                  borderColor: "#bbb1a3",
                  bgcolor: "rgba(255, 255, 255, 0.62)",
                  color: "#231f1a",
                  justifyContent: "space-between",
                  px: 2.5,
                  textAlign: "left",
                  "&:hover": {
                    borderColor: "#1f6849",
                    bgcolor: "white",
                  },
                }}
              >
                <span>{link.label}</span>
                <span aria-hidden="true">↗</span>
              </Button>
            ))}
          </Stack>
        )}

        {showReviewCta && (
          <Button
            component={reviewHref ? "a" : "button"}
            disabled={!reviewHref}
            fullWidth
            href={reviewHref}
            size="large"
            variant="contained"
            sx={{ minHeight: 52 }}
          >
            {ctaLabel}
          </Button>
        )}

        <Stack component="section" aria-labelledby="testimonial-heading" spacing={2}>
          <Typography
            component="h2"
            id="testimonial-heading"
            sx={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "1.65rem",
              textAlign: "center",
            }}
          >
            What people are saying
          </Typography>

          {testimonials.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                borderColor: "#ded5c8",
                bgcolor: "rgba(255, 255, 255, 0.64)",
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                Stories are coming soon.
              </Typography>
            </Paper>
          ) : (
            testimonials.map((testimonial) => (
              <Paper
                component="article"
                key={testimonial.id}
                variant="outlined"
                sx={{
                  borderColor: "#ded5c8",
                  bgcolor: "rgba(255, 255, 255, 0.78)",
                  borderRadius: 3,
                  p: { xs: 2.5, sm: 3 },
                }}
              >
                <Stack spacing={1.5}>
                  {testimonial.rating !== null && <Rating value={testimonial.rating} />}
                  {testimonial.title && (
                    <Typography component="h3" sx={{ fontWeight: 800 }}>
                      {testimonial.title}
                    </Typography>
                  )}
                  <Typography sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    “{testimonial.message}”
                  </Typography>
                  {testimonial.attribution && (
                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                      — {testimonial.attribution}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))
          )}
        </Stack>

        <Typography
          component="footer"
          sx={{ color: "#777067", fontSize: "0.75rem", textAlign: "center" }}
        >
          Powered by 36Stories
        </Typography>
      </Stack>
    </Box>
  );
};

export default TestimonialPageView;
