import {
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { PublicOffer } from "@/lib/offers/types";
import OfferCard from "./OfferCard";
import {
  getDisplayPageAppearance,
  type DisplayPageConfigurationV2,
} from "@/lib/displayPage";

type BioPageViewProps = {
  config: DisplayPageConfigurationV2;
  offers?: PublicOffer[];
  preview?: boolean;
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "36";

const BioPageView = ({
  config,
  offers = [],
  preview = false,
}: BioPageViewProps) => {
  const appearance = getDisplayPageAppearance(config);
  const linkButtonColor = config.theme === "minimalist" ? appearance.button : appearance.buttonText;

  return (
    <Box
      component={preview ? "div" : "main"}
      data-theme={config.theme}
      sx={{
        minHeight: preview ? 640 : "100dvh",
        overflowX: "hidden",
        bgcolor: appearance.background,
        backgroundImage: appearance.backgroundImage,
        borderRadius: preview ? appearance.pageRadius : 0,
        color: appearance.text,
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Stack
        spacing={appearance.sectionSpacing}
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
              bgcolor: appearance.button,
              color: appearance.buttonText,
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
                fontFamily: appearance.headingFontFamily,
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
                  color: appearance.mutedText,
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

        <Stack component="section" aria-labelledby="offers-heading" spacing={2}>
          <Typography
            component="h2"
            id="offers-heading"
            sx={{
              fontFamily: appearance.headingFontFamily,
              fontSize: "1.65rem",
              textAlign: "center",
            }}
          >
            Products & services
          </Typography>

          {offers.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                borderColor: appearance.border,
                bgcolor: appearance.card,
                borderRadius: appearance.cardRadius,
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">Offers are coming soon.</Typography>
            </Paper>
          ) : (
            offers.map((offer) => (
              <OfferCard
                appearance={appearance}
                key={offer.id}
                offer={offer}
                trackingEnabled={!preview}
              />
            ))
          )}
        </Stack>

        {config.links.length > 0 && (
          <Stack component="section" aria-labelledby="social-links-heading" spacing={1.5}>
            <Typography
              component="h2"
              id="social-links-heading"
              sx={{
                fontFamily: appearance.headingFontFamily,
                fontSize: "1.35rem",
                textAlign: "center",
              }}
            >
              My socials
            </Typography>
            <Stack component="nav" aria-label="Creator links" spacing={1.5}>
              {config.links.map((link) => (
                <Button
                  component="a"
                  href={link.url}
                  key={link.id}
                  rel="noopener noreferrer"
                  target="_blank"
                  variant={config.theme === "minimalist" ? "outlined" : "contained"}
                  sx={{
                    minHeight: 52,
                    borderColor: appearance.button,
                    bgcolor: config.theme === "minimalist" ? "transparent" : appearance.button,
                    color: linkButtonColor,
                    borderRadius: appearance.buttonRadius,
                    justifyContent: "space-between",
                    px: 2.5,
                    textAlign: "left",
                    "&:hover": {
                      borderColor: appearance.button,
                      bgcolor: config.theme === "minimalist" ? `${appearance.button}12` : appearance.button,
                    },
                  }}
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">↗</span>
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        <Typography
          component="footer"
          sx={{ color: appearance.mutedText, fontSize: "0.75rem", textAlign: "center" }}
        >
          Powered by 36Stories
        </Typography>
      </Stack>
    </Box>
  );
};

export default BioPageView;
