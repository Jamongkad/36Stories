"use client";

import { useState, type FormEvent } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { DisplayPageAppearance } from "@/lib/displayPage";
import { offerCtaPolicy } from "@/lib/offers/policy";
import type { PublicOffer } from "@/lib/offers/types";
import { joinOfferWaitlist, recordOfferEvent } from "./tracking";

type SubmissionState = "idle" | "pending" | "success" | "error";

type OfferActionProps = {
  appearance: DisplayPageAppearance;
  offer: PublicOffer;
  trackingEnabled: boolean;
};

const OutboundOfferAction = ({ appearance, offer, trackingEnabled }: OfferActionProps) => {
  if (!offer.destinationUrl) {
    return (
      <Button
        disabled
        sx={{ bgcolor: appearance.button, borderRadius: appearance.buttonRadius, color: appearance.buttonText, minHeight: 48, mt: 0.5 }}
        variant="contained"
      >
        {offer.ctaLabel}
      </Button>
    );
  }

  return (
    <Button
      component="a"
      href={offer.destinationUrl}
      onClick={() => {
        if (trackingEnabled) {
          void recordOfferEvent(
            offer.id,
            offerCtaPolicy.OUTBOUND.intentEvent,
          ).catch(() => undefined);
        }
      }}
      rel="noopener noreferrer"
      target="_blank"
      variant="contained"
      sx={{ bgcolor: appearance.button, borderRadius: appearance.buttonRadius, color: appearance.buttonText, minHeight: 48, mt: 0.5 }}
    >
      {offer.ctaLabel}
    </Button>
  );
};

const WaitlistOfferAction = ({ appearance, offer, trackingEnabled }: OfferActionProps) => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmissionState>("idle");

  const joinWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trackingEnabled) {
      setState("success");
      return;
    }

    setState("pending");
    try {
      await joinOfferWaitlist(offer.id, email);
      setState("success");
    } catch {
      setState("error");
    }
  };

  return (
    <Box component="form" onSubmit={joinWaitlist} sx={{ mt: 0.5 }}>
      <Stack spacing={1.25}>
        <TextField
          autoComplete="email"
          disabled={state === "pending" || state === "success"}
          fullWidth
          label="Email for early access"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <Button
          disabled={state === "pending" || state === "success"}
          sx={{ bgcolor: appearance.button, borderRadius: appearance.buttonRadius, color: appearance.buttonText, minHeight: 48 }}
          type="submit"
          variant="contained"
        >
          {state === "pending"
            ? "Joining…"
            : state === "success"
              ? "You’re on the list"
              : offer.ctaLabel}
        </Button>
        <Typography
          aria-live="polite"
          color={state === "error" ? "error" : "text.secondary"}
          sx={{ minHeight: 20 }}
          variant="body2"
        >
          {state === "success"
            ? "We’ll let you know when this is ready."
            : state === "error"
              ? "We couldn’t add you. Check your email and try again."
              : ""}
        </Typography>
      </Stack>
    </Box>
  );
};

const InterestOfferAction = ({ appearance, offer, trackingEnabled }: OfferActionProps) => {
  const [state, setState] = useState<SubmissionState>("idle");

  const recordInterest = async () => {
    if (!trackingEnabled) {
      setState("success");
      return;
    }

    setState("pending");
    try {
      await recordOfferEvent(offer.id, offerCtaPolicy.INTEREST.intentEvent);
      setState("success");
    } catch {
      setState("error");
    }
  };

  return (
    <Stack spacing={1} sx={{ mt: 0.5 }}>
      <Button
        disabled={state === "pending" || state === "success"}
        onClick={recordInterest}
        sx={{ bgcolor: appearance.button, borderRadius: appearance.buttonRadius, color: appearance.buttonText, minHeight: 48 }}
        variant="contained"
      >
        {state === "pending"
          ? "Saving…"
          : state === "success"
            ? "Interest recorded"
            : offer.ctaLabel}
      </Button>
      <Typography
        aria-live="polite"
        color={state === "error" ? "error" : "text.secondary"}
        sx={{ minHeight: 20 }}
        variant="body2"
      >
        {state === "success"
          ? "Thanks—your interest helps shape what gets built."
          : state === "error"
            ? "We couldn’t save that. Please try again."
            : ""}
      </Typography>
    </Stack>
  );
};

const OfferAction = ({ appearance, offer, trackingEnabled }: OfferActionProps) => {
  switch (offer.ctaType) {
    case "OUTBOUND":
      return <OutboundOfferAction appearance={appearance} offer={offer} trackingEnabled={trackingEnabled} />;
    case "WAITLIST":
      return <WaitlistOfferAction appearance={appearance} offer={offer} trackingEnabled={trackingEnabled} />;
    case "INTEREST":
      return <InterestOfferAction appearance={appearance} offer={offer} trackingEnabled={trackingEnabled} />;
    default: {
      const unsupportedCta: never = offer.ctaType;
      throw new Error(`Unsupported offer CTA: ${unsupportedCta}`);
    }
  }
};

export default OfferAction;
