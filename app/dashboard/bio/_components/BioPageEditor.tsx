"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BioPageView from "@/app/_components/BioPageView";
import {
  displayPageBackgroundColorPolicy,
  displayPageBackgroundColors,
  displayPageButtonColorPolicy,
  displayPageButtonColors,
  displayPageThemePolicy,
  displayPageThemes,
  initialDisplayPageActionState,
  type DisplayPageConfigurationV2,
  type DisplayPageLink,
  type DisplayPageTheme,
} from "@/lib/displayPage";
import type { PublicOffer } from "@/lib/offers/types";
import { saveDisplayPage } from "../actions";

type BioPageEditorProps = {
  config: DisplayPageConfigurationV2;
  offers: PublicOffer[];
  publicSlug: string;
};

const createLinkId = () => `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const BioPageEditor = ({ config: initialConfig, offers, publicSlug }: BioPageEditorProps) => {
  const [config, setConfig] = useState(initialConfig);
  const [state, formAction, isPending] = useActionState(
    saveDisplayPage,
    initialDisplayPageActionState,
  );

  const updateConfig = (changes: Partial<DisplayPageConfigurationV2>) => {
    setConfig((current) => ({ ...current, ...changes }));
  };

  const updateLink = (id: string, changes: Partial<DisplayPageLink>) => {
    setConfig((current) => ({
      ...current,
      links: current.links.map((link) => (link.id === id ? { ...link, ...changes } : link)),
    }));
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    setConfig((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.links.length) return current;
      const links = [...current.links];
      [links[index], links[nextIndex]] = [links[nextIndex], links[index]];
      return { ...current, links };
    });
  };

  const selectTheme = (theme: DisplayPageTheme) => {
    const defaults = displayPageThemePolicy[theme];
    updateConfig({
      theme,
      backgroundColor: defaults.backgroundColor,
      buttonColor: defaults.buttonColor,
    });
  };

  return (
    <Box sx={{ mt: { xs: 3, md: 4 } }}>
      <Box
        sx={{
          display: { xs: "flex", lg: "grid" },
          flexDirection: "column",
          gap: { xs: 3, lg: 4 },
          gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 430px)",
        }}
      >
        <Box component="form" action={formAction} sx={{ display: "contents" }}>
          <input name="theme" type="hidden" value={config.theme} />
          <input name="backgroundColor" type="hidden" value={config.backgroundColor} />
          <input name="buttonColor" type="hidden" value={config.buttonColor} />
          <input name="links" type="hidden" value={JSON.stringify(config.links)} />

          <Stack spacing={3} sx={{ order: { xs: 2, lg: 1 } }}>
            {state.message && (
              <Alert severity={state.status === "success" ? "success" : "error"}>
                {state.message}
              </Alert>
            )}

            <Paper elevation={0} sx={{ border: "1px solid #e4e7ec", borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="h2" variant="h5">Profile</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Keep this clear and recognizable when someone arrives from Instagram or TikTok.
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(state.fieldErrors?.displayName)}
                  fullWidth
                  helperText={state.fieldErrors?.displayName ?? "Your name or creator identity."}
                  label="Display name"
                  name="displayName"
                  onChange={(event) => updateConfig({ displayName: event.target.value })}
                  slotProps={{ htmlInput: { maxLength: 80 } }}
                  value={config.displayName}
                />
                <TextField
                  error={Boolean(state.fieldErrors?.bio)}
                  fullWidth
                  helperText={state.fieldErrors?.bio ?? "A short description of what you create."}
                  label="Bio"
                  multiline
                  name="bio"
                  onChange={(event) => updateConfig({ bio: event.target.value })}
                  slotProps={{ htmlInput: { maxLength: 240 } }}
                  value={config.bio}
                />
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ border: "1px solid #e4e7ec", borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="h2" variant="h5">Links</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Add up to 10 destinations and arrange them in the order visitors should see.
                  </Typography>
                </Box>
                {state.fieldErrors?.links && <Alert severity="error">{state.fieldErrors.links}</Alert>}
                {config.links.map((link, index) => (
                  <Paper key={link.id} variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                        <Typography sx={{ fontWeight: 750 }}>Link {index + 1}</Typography>
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            aria-label={`Move link ${index + 1} up`}
                            disabled={index === 0}
                            onClick={() => moveLink(index, -1)}
                            size="small"
                          >
                            ↑
                          </Button>
                          <Button
                            aria-label={`Move link ${index + 1} down`}
                            disabled={index === config.links.length - 1}
                            onClick={() => moveLink(index, 1)}
                            size="small"
                          >
                            ↓
                          </Button>
                          <Button
                            aria-label={`Remove link ${index + 1}`}
                            color="error"
                            onClick={() => setConfig((current) => ({ ...current, links: current.links.filter((item) => item.id !== link.id) }))}
                            size="small"
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Stack>
                      <TextField
                        fullWidth
                        label="Link label"
                        onChange={(event) => updateLink(link.id, { label: event.target.value })}
                        slotProps={{ htmlInput: { maxLength: 60 } }}
                        value={link.label}
                      />
                      <TextField
                        fullWidth
                        label="URL"
                        onChange={(event) => updateLink(link.id, { url: event.target.value })}
                        placeholder="https://"
                        type="url"
                        value={link.url}
                      />
                    </Stack>
                  </Paper>
                ))}
                <Button
                  disabled={config.links.length >= 10}
                  onClick={() => setConfig((current) => ({
                    ...current,
                    links: [...current.links, { id: createLinkId(), label: "", url: "" }],
                  }))}
                  sx={{ alignSelf: "flex-start" }}
                  variant="outlined"
                >
                  Add link
                </Button>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ border: "1px solid #e4e7ec", borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography component="h2" variant="h5">Theme</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Pick a starting style, then tune the two most important colors.
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
                  {displayPageThemes.map((theme) => {
                    const policy = displayPageThemePolicy[theme];
                    const selected = config.theme === theme;
                    return (
                      <ButtonBase
                        aria-pressed={selected}
                        key={theme}
                        onClick={() => selectTheme(theme)}
                        sx={{
                          alignItems: "flex-start",
                          border: selected ? "2px solid #2563eb" : "1px solid #e4e7ec",
                          borderRadius: 2.5,
                          display: "flex",
                          justifyContent: "flex-start",
                          minHeight: 108,
                          p: 1.5,
                          textAlign: "left",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 800 }}>{policy.label}</Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                            {policy.description}
                          </Typography>
                        </Box>
                      </ButtonBase>
                    );
                  })}
                </Box>

                <ColorSwatches
                  error={state.fieldErrors?.backgroundColor}
                  label="Background color"
                  options={displayPageBackgroundColors}
                  policy={displayPageBackgroundColorPolicy}
                  selected={config.backgroundColor}
                  onSelect={(backgroundColor) => updateConfig({ backgroundColor })}
                />
                <ColorSwatches
                  error={state.fieldErrors?.buttonColor}
                  label="Button color"
                  options={displayPageButtonColors}
                  policy={displayPageButtonColorPolicy}
                  selected={config.buttonColor}
                  onSelect={(buttonColor) => updateConfig({ buttonColor })}
                />
              </Stack>
            </Paper>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button disabled={isPending} size="large" type="submit" variant="contained">
                {isPending ? "Saving…" : "Save bio page"}
              </Button>
              <Button component="a" href={`/bio/${publicSlug}`} size="large" target="_blank" variant="outlined">
                Preview in new tab
              </Button>
            </Stack>
          </Stack>
        </Box>

          <Paper
            elevation={0}
            sx={{
              alignSelf: "start",
              bgcolor: "#eef2f7",
              border: "1px solid #dce3ec",
              borderRadius: 4,
              order: { xs: 1, lg: 2 },
              overflow: "hidden",
              p: { xs: 1, sm: 2 },
              position: { lg: "sticky" },
              top: { lg: 88 },
            }}
          >
            <Typography sx={{ color: "#667085", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", mb: 1.25, px: 1, textTransform: "uppercase" }}>
              Live preview
            </Typography>
            <Box sx={{ borderRadius: 3, overflow: "hidden" }}>
              <BioPageView config={config} offers={offers} preview />
            </Box>
          </Paper>
      </Box>
    </Box>
  );
};

type ColorSwatchesProps<T extends string> = {
  error?: string;
  label: string;
  options: readonly T[];
  policy: Record<T, { label: string; value: string }>;
  selected: T;
  onSelect: (value: T) => void;
};

const ColorSwatches = <T extends string>({ error, label, options, policy, selected, onSelect }: ColorSwatchesProps<T>) => (
  <Box>
    <Typography sx={{ fontWeight: 750 }}>{label}</Typography>
    <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap", mt: 1 }}>
      {options.map((option) => (
        <ButtonBase
          aria-label={`${policy[option].label} ${label.toLowerCase()}`}
          aria-pressed={selected === option}
          key={option}
          onClick={() => onSelect(option)}
          sx={{
            border: selected === option ? "3px solid #2563eb" : "1px solid #d0d5dd",
            borderRadius: "50%",
            height: 44,
            p: 0.5,
            width: 44,
          }}
        >
          <Box sx={{ bgcolor: policy[option].value, border: "1px solid rgba(16, 24, 40, 0.12)", borderRadius: "50%", height: "100%", width: "100%" }} />
        </ButtonBase>
      ))}
    </Stack>
    {error && <Typography color="error" sx={{ mt: 0.75 }} variant="body2">{error}</Typography>}
  </Box>
);

export default BioPageEditor;
