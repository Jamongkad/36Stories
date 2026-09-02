"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  initialOfferFormActionState,
} from "@/lib/offerForm";
import {
  defaultOfferMode,
  offerDestinationTypePolicy,
  offerDestinationTypes,
  offerKindPolicy,
  offerKinds,
  offerModePolicy,
  offerModes,
  type OfferMode,
} from "@/lib/offers/policy";
import { createOffer } from "../actions";

const OfferEditor = () => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createOffer, initialOfferFormActionState);
  const [mode, setMode] = useState<OfferMode>(defaultOfferMode);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const modePolicy = offerModePolicy[mode];

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard/offers");
    }
  }, [router, state.status]);

  return (
    <Box component="form" action={formAction}>
      <Stack spacing={3}>
        {state.message && state.status !== "idle" && (
          <Alert severity={state.status === "success" ? "success" : "error"}>
            {state.message}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e4e7ec",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(16, 24, 40, 0.035)",
            p: { xs: 2.5, sm: 3 },
          }}
        >
          <Stack spacing={2.5}>
            <Box sx={{ alignItems: "flex-start", display: "flex", gap: 1.5 }}>
              <Box
                aria-hidden="true"
                sx={{
                  alignItems: "center",
                  bgcolor: "#dbeafe",
                  borderRadius: 2,
                  color: "primary.dark",
                  display: "flex",
                  flexShrink: 0,
                  fontWeight: 800,
                  height: 38,
                  justifyContent: "center",
                  width: 38,
                }}
              >
                1
              </Box>
              <Box>
                <Typography component="h2" variant="h5">
                  What are you testing?
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Start with the simplest description your audience will understand.
                </Typography>
              </Box>
            </Box>
            <FormControl error={Boolean(state.fieldErrors?.kind)} fullWidth>
              <InputLabel id="offer-kind-label">Offer type</InputLabel>
              <Select defaultValue="PRODUCT" label="Offer type" labelId="offer-kind-label" name="kind">
                {offerKinds.map((kind) => (
                  <MenuItem key={kind} value={kind}>
                    {offerKindPolicy[kind].label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{state.fieldErrors?.kind}</FormHelperText>
            </FormControl>
            <FormControl error={Boolean(state.fieldErrors?.mode)} fullWidth>
              <InputLabel id="offer-mode-label">Availability</InputLabel>
              <Select
                label="Availability"
                labelId="offer-mode-label"
                name="mode"
                onChange={(event) => setMode(event.target.value as OfferMode)}
                value={mode}
              >
                {offerModes.map((offerMode) => (
                  <MenuItem key={offerMode} value={offerMode}>
                    {offerModePolicy[offerMode].editorLabel} 
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{state.fieldErrors?.mode ?? modePolicy.description}</FormHelperText>
            </FormControl>
            <TextField
              error={Boolean(state.fieldErrors?.title)}
              fullWidth
              helperText={state.fieldErrors?.title}
              label="Offer title"
              name="title"
              required
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <TextField
              error={Boolean(state.fieldErrors?.description)}
              fullWidth
              helperText={state.fieldErrors?.description ?? "Explain the outcome, not every feature."}
              label="Short description"
              minRows={3}
              multiline
              name="description"
              slotProps={{ htmlInput: { maxLength: 600 } }}
            />
            <TextField
              error={Boolean(state.fieldErrors?.priceLabel)}
              fullWidth
              helperText={state.fieldErrors?.priceLabel ?? "Optional, for example $75 or $40–$60."}
              label="Price or expected range"
              name="priceLabel"
            />
            <TextField
              error={Boolean(state.fieldErrors?.imageUrl)}
              fullWidth
              helperText={state.fieldErrors?.imageUrl ?? "Optional for now; image uploads can come later."}
              label="Image URL"
              name="imageUrl"
              placeholder="https://"
              type="url"
            />
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e4e7ec",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(16, 24, 40, 0.035)",
            p: { xs: 2.5, sm: 3 },
          }}
        >
          <Stack spacing={2.5}>
            <Box sx={{ alignItems: "flex-start", display: "flex", gap: 1.5 }}>
              <Box
                aria-hidden="true"
                sx={{
                  alignItems: "center",
                  bgcolor: "#ede9fe",
                  borderRadius: 2,
                  color: "#6d28d9",
                  display: "flex",
                  flexShrink: 0,
                  fontWeight: 800,
                  height: 38,
                  justifyContent: "center",
                  width: 38,
                }}
              >
                2
              </Box>
              <Box>
                <Typography component="h2" variant="h5">
                  What should visitors do?
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  36Stories uses this action as the offer’s primary intent signal.
                </Typography>
              </Box>
            </Box>

            {modePolicy.requiresDestination && (
              <>
                <TextField
                  error={Boolean(state.fieldErrors?.destinationUrl)}
                  fullWidth
                  helperText={state.fieldErrors?.destinationUrl}
                  label="Destination URL"
                  name="destinationUrl"
                  placeholder="https://"
                  required
                  type="url"
                />
                <FormControl error={Boolean(state.fieldErrors?.destinationType)} fullWidth>
                  <InputLabel id="destination-type-label">Destination type</InputLabel>
                  <Select defaultValue="STORE" label="Destination type" labelId="destination-type-label" name="destinationType">
                    {offerDestinationTypes.map((destinationType) => (
                      <MenuItem key={destinationType} value={destinationType}>
                        {offerDestinationTypePolicy[destinationType].label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{state.fieldErrors?.destinationType}</FormHelperText>
                </FormControl>
                {modePolicy.supportsAffiliate && (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isAffiliate}
                          name="isAffiliate"
                          onChange={(event) => setIsAffiliate(event.target.checked)}
                        />
                      }
                      label="This is an affiliate link"
                    />
                    {isAffiliate && (
                      <TextField
                        error={Boolean(state.fieldErrors?.disclosureText)}
                        fullWidth
                        helperText={state.fieldErrors?.disclosureText ?? "Shown on the public offer card."}
                        label="Affiliate disclosure"
                        name="disclosureText"
                      />
                    )}
                  </>
                )}
              </>
            )}

            {modePolicy.supportsLaunchDate && (
              <TextField
                error={Boolean(state.fieldErrors?.launchAt)}
                fullWidth
                helperText={state.fieldErrors?.launchAt ?? "Optional—visitors can still join without a date."}
                label="Expected launch date"
                name="launchAt"
                slotProps={{ inputLabel: { shrink: true } }}
                type="datetime-local"
              />
            )}

            <TextField
              error={Boolean(state.fieldErrors?.ctaLabel)}
              fullWidth
              helperText={
                state.fieldErrors?.ctaLabel ??
                `Defaults to “${modePolicy.defaultCtaLabel}”.`
              }
              label="Button label"
              name="ctaLabel"
            />
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ bgcolor: "#f8fbff", border: "1px solid #dbeafe", borderRadius: 3, p: { xs: 2.5, sm: 3 } }}
        >
          <FormControlLabel
            control={<Checkbox name="isPublished" />}
            label="Publish this offer on my bio page now"
          />
          <Typography color="text.secondary" variant="body2" sx={{ ml: 4, mt: 0.5 }}>
            Leave this unchecked to save a draft.
          </Typography>
        </Paper>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button disabled={isPending} size="large" type="submit" variant="contained">
            {isPending ? "Creating…" : "Create offer"}
          </Button>
          <Button component="a" href="/dashboard/offers" size="large" variant="outlined">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default OfferEditor;
