"use client";

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import {
  getDisplayPageAppearance,
  type DisplayPageAppearance,
} from "@/lib/displayPage";
import { offerKindPolicy, offerModePolicy } from "@/lib/offers/policy";
import type { PublicOffer } from "@/lib/offers/types";
import OfferAction from "./offer-card/OfferAction";
import { useOfferViewTracking } from "./offer-card/useOfferViewTracking";

type OfferCardProps = {
  appearance?: DisplayPageAppearance;
  offer: PublicOffer;
  trackingEnabled?: boolean;
};

const OfferCard = ({ appearance, offer, trackingEnabled = true }: OfferCardProps) => {
  const pageAppearance = appearance ?? getDisplayPageAppearance({
    theme: "sophisticated",
    backgroundColor: "sand",
    buttonColor: "forest",
  });
  const cardRef = useOfferViewTracking(offer.id, trackingEnabled);

  return (
    <Paper
      component="article"
      ref={cardRef}
      variant="outlined"
      sx={{
        borderColor: pageAppearance.border,
        bgcolor: pageAppearance.card,
        borderRadius: pageAppearance.cardRadius,
        overflow: "hidden",
      }}
    >
      {offer.imageUrl && (
        <Box
          component="img"
          src={offer.imageUrl}
          alt=""
          sx={{ display: "block", height: 180, objectFit: "cover", width: "100%" }}
        />
      )}
      <Stack spacing={1.5} sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Chip label={offerKindPolicy[offer.kind].label} size="small" />
          <Typography sx={{ color: pageAppearance.mutedText }} variant="body2">
            {offerModePolicy[offer.mode].label}
          </Typography>
          {offer.priceLabel && (
            <Typography sx={{ fontWeight: 800, ml: "auto" }} variant="body2">
              {offer.priceLabel}
            </Typography>
          )}
        </Stack>

        <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1.3rem" }}>
          {offer.title}
        </Typography>

        {offer.description && (
            <Typography sx={{ color: pageAppearance.mutedText, lineHeight: 1.6 }}>
            {offer.description}
          </Typography>
        )}

        {offer.launchAt && (
          <Typography sx={{ color: pageAppearance.mutedText }} variant="body2">
            Launches {offer.launchAt}
          </Typography>
        )}

        {offer.isAffiliate && offer.disclosureText && (
          <Typography sx={{ color: pageAppearance.mutedText, fontSize: "0.75rem" }}>
            {offer.disclosureText}
          </Typography>
        )}

        <OfferAction appearance={pageAppearance} offer={offer} trackingEnabled={trackingEnabled} />
      </Stack>
    </Paper>
  );
};

export default OfferCard;
