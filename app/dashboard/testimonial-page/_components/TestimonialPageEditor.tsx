"use client";

import { useActionState, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import TestimonialPageView, {
  type TestimonialPageItem,
} from "@/app/_components/TestimonialPageView";
import {
  DISPLAY_BIO_MAX_LENGTH,
  DISPLAY_LINK_LABEL_MAX_LENGTH,
  DISPLAY_LINK_LIMIT,
  DISPLAY_LINK_URL_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  type DisplayPageActionState,
  type DisplayPageConfigurationV1,
  type DisplayPageLink,
  initialDisplayPageActionState,
} from "@/lib/displayPage";

type CollectionFormOption = {
  id: string;
  name: string;
  headline: string | null;
};

type TestimonialPageEditorProps = {
  initialConfig: DisplayPageConfigurationV1;
  collectionForms: CollectionFormOption[];
  testimonials: TestimonialPageItem[];
  publicPath: string;
  saveAction: (
    state: DisplayPageActionState,
    formData: FormData,
  ) => Promise<DisplayPageActionState>;
};

const createLinkId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `link-${Date.now()}`;

const TestimonialPageEditor = ({
  initialConfig,
  collectionForms,
  testimonials,
  publicPath,
  saveAction,
}: TestimonialPageEditorProps) => {
  const [actionState, formAction, isPending] = useActionState(
    saveAction,
    initialDisplayPageActionState,
  );
  const [displayName, setDisplayName] = useState(initialConfig.displayName);
  const [bio, setBio] = useState(initialConfig.bio);
  const [links, setLinks] = useState(initialConfig.links);
  const [selectedCollectionWidgetId, setSelectedCollectionWidgetId] = useState(
    initialConfig.selectedCollectionWidgetId ?? "",
  );
  const [copied, setCopied] = useState(false);

  const selectedCollectionForm = collectionForms.find(
    (form) => form.id === selectedCollectionWidgetId,
  );
  const previewConfig = useMemo<DisplayPageConfigurationV1>(
    () => ({
      version: 1,
      displayName: displayName.trim() || "Your name",
      bio,
      links: links.filter((link) => link.label.trim() && link.url.trim()),
      selectedCollectionWidgetId: selectedCollectionWidgetId || null,
    }),
    [bio, displayName, links, selectedCollectionWidgetId],
  );

  const updateLink = (id: string, changes: Partial<DisplayPageLink>) => {
    setLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, ...changes } : link)),
    );
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    setLinks((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const copyPublicUrl = async () => {
    const url = new URL(publicPath, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section aria-labelledby="testimonial-page-editor-heading">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "flex-start" }, justifyContent: "space-between", mb: 4 }}
      >
        <Box>
          <Typography component="h1" id="testimonial-page-editor-heading" variant="h4">
            Testimonial Page
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Build the page followers will open from your link in bio.
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            36stories.com{publicPath}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button onClick={copyPublicUrl} variant="outlined">
            {copied ? "Copied" : "Copy URL"}
          </Button>
          <Button href={publicPath} target="_blank" variant="outlined">
            View page
          </Button>
        </Stack>
      </Stack>

      <form action={formAction}>
        <input name="links" type="hidden" value={JSON.stringify(links)} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 407px" },
            gap: { xs: 4, lg: 5 },
            alignItems: "start",
          }}
        >
          <Stack spacing={4} sx={{ minWidth: 0 }}>
            {actionState.status !== "idle" && (
              <Alert severity={actionState.status === "success" ? "success" : "error"}>
                {actionState.message}
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography component="h2" variant="h6">
                    Creator profile
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    Introduce yourself before followers explore your links and stories.
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(actionState.fieldErrors?.displayName)}
                  fullWidth
                  helperText={actionState.fieldErrors?.displayName}
                  label="Display name"
                  name="displayName"
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  slotProps={{ htmlInput: { maxLength: DISPLAY_NAME_MAX_LENGTH } }}
                  value={displayName}
                />
                <TextField
                  error={Boolean(actionState.fieldErrors?.bio)}
                  fullWidth
                  helperText={
                    actionState.fieldErrors?.bio ?? `${bio.length}/${DISPLAY_BIO_MAX_LENGTH}`
                  }
                  label="Bio"
                  minRows={3}
                  multiline
                  name="bio"
                  onChange={(event) => setBio(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: DISPLAY_BIO_MAX_LENGTH } }}
                  value={bio}
                />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography component="h2" variant="h6">
                    Links
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    Add YouTube, Amazon, Linktree, Beacons, or any other web link.
                  </Typography>
                </Box>

                {actionState.fieldErrors?.links && (
                  <Alert severity="error">{actionState.fieldErrors.links}</Alert>
                )}

                {links.map((link, index) => (
                  <Paper key={link.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label={`Link ${index + 1} label`}
                        onChange={(event) => updateLink(link.id, { label: event.target.value })}
                        required
                        slotProps={{ htmlInput: { maxLength: DISPLAY_LINK_LABEL_MAX_LENGTH } }}
                        value={link.label}
                      />
                      <TextField
                        fullWidth
                        label={`Link ${index + 1} URL`}
                        onChange={(event) => updateLink(link.id, { url: event.target.value })}
                        placeholder="https://"
                        required
                        slotProps={{ htmlInput: { maxLength: DISPLAY_LINK_URL_MAX_LENGTH } }}
                        type="url"
                        value={link.url}
                      />
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Button
                          disabled={index === 0}
                          onClick={() => moveLink(index, -1)}
                          size="small"
                          type="button"
                        >
                          Move up
                        </Button>
                        <Button
                          disabled={index === links.length - 1}
                          onClick={() => moveLink(index, 1)}
                          size="small"
                          type="button"
                        >
                          Move down
                        </Button>
                        <Button
                          color="error"
                          onClick={() =>
                            setLinks((current) => current.filter((item) => item.id !== link.id))
                          }
                          size="small"
                          type="button"
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}

                <Button
                  disabled={links.length >= DISPLAY_LINK_LIMIT}
                  onClick={() =>
                    setLinks((current) => [
                      ...current,
                      { id: createLinkId(), label: "", url: "" },
                    ])
                  }
                  sx={{ alignSelf: "flex-start", minHeight: 44 }}
                  type="button"
                  variant="outlined"
                >
                  Add link
                </Button>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Box>
                  <Typography component="h2" variant="h6">
                    Review button
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    Select the collection form whose headline will label the future review button.
                  </Typography>
                </Box>
                <FormControl
                  error={Boolean(actionState.fieldErrors?.selectedCollectionWidgetId)}
                  fullWidth
                >
                  <InputLabel id="collection-form-label">Collection form</InputLabel>
                  <Select
                    label="Collection form"
                    labelId="collection-form-label"
                    name="selectedCollectionWidgetId"
                    onChange={(event) => setSelectedCollectionWidgetId(event.target.value)}
                    value={selectedCollectionWidgetId}
                  >
                    <MenuItem disabled value="">
                      Select a collection form
                    </MenuItem>
                    {collectionForms.map((form) => (
                      <MenuItem key={form.id} value={form.id}>
                        {form.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {actionState.fieldErrors?.selectedCollectionWidgetId ??
                      "This form powers the public Leave me a review button."}
                  </FormHelperText>
                </FormControl>
              </Stack>
            </Paper>

            <Button
              disabled={isPending}
              size="large"
              sx={{ minHeight: 48, width: { xs: "100%", sm: "auto" }, alignSelf: "flex-start" }}
              type="submit"
              variant="contained"
            >
              {isPending ? "Saving…" : "Save and publish"}
            </Button>
          </Stack>

          <Box sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 24 } }}>
            <Typography component="h2" variant="overline" sx={{ fontWeight: 800 }}>
              Mobile preview
            </Typography>
            <Paper
              variant="outlined"
              sx={{ mt: 1, borderRadius: 4, maxHeight: { lg: "calc(100dvh - 80px)" }, overflowY: "auto" }}
            >
              <TestimonialPageView
                config={previewConfig}
                ctaLabel={selectedCollectionForm?.headline ?? "Leave a review"}
                preview
                showReviewCta
                testimonials={testimonials}
              />
            </Paper>
          </Box>
        </Box>
      </form>
    </section>
  );
};

export default TestimonialPageEditor;
