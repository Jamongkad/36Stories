"use client";

import { useState } from "react";
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
  type CollectionFormConfiguration,
  type FeedbackSubmissionResult,
  initialFeedbackSubmissionResult,
} from "@/app/dashboard/forms/new/_lib/collectionForm";

type FeedbackWizardProps = {
  configuration: CollectionFormConfiguration;
  creatorName: string;
  creatorPath: string;
  publicKey: string;
};

type Step = 1 | 2 | 3 | 4;
type SocialPlatform = "INSTAGRAM" | "TIKTOK";

const stepTitles = {
  1: "Rate your experience",
  2: "Tell us about your experience",
  3: "Add your details",
  4: "Thanks for sharing!",
} as const;

const FeedbackWizard = ({
  configuration,
  creatorName,
  creatorPath,
  publicKey,
}: FeedbackWizardProps) => {
  const [step, setStep] = useState<Step>(1);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("INSTAGRAM");
  const [socialHandle, setSocialHandle] = useState("");
  const [publicationConsent, setPublicationConsent] = useState(false);
  const [stepError, setStepError] = useState("");
  const [submissionState, setSubmissionState] = useState<FeedbackSubmissionResult>(
    initialFeedbackSubmissionResult,
  );
  const [isPending, setIsPending] = useState(false);

  const actionErrorStep: Step =
    submissionState.status === "error" && submissionState.fieldErrors?.rating
      ? 1
      : submissionState.status === "error" && submissionState.fieldErrors?.message
        ? 2
        : 3;
  const visibleStep: Step =
    submissionState.status === "success"
      ? 4
      : submissionState.status === "error" && submissionState.fieldErrors
        ? actionErrorStep
        : step;

  const goNext = () => {
    if (step === 1 && rating === null) {
      setStepError("Choose a rating to continue.");
      return;
    }
    if (step === 2 && !message.trim()) {
      setStepError("Tell us about your experience to continue.");
      return;
    }

    setStepError("");
    setStep((current) => (current === 3 ? current : ((current + 1) as Step)));
  };

  const goBack = () => {
    setStepError("");
    setStep((current) => (current === 1 ? current : ((current - 1) as Step)));
  };

  const fieldError = (name: keyof NonNullable<FeedbackSubmissionResult["fieldErrors"]>) =>
    submissionState.fieldErrors?.[name];

  const clearSubmissionFieldError = (
    name: keyof NonNullable<FeedbackSubmissionResult["fieldErrors"]>,
  ) => {
    setSubmissionState((current) => {
      if (current.status !== "error" || !current.fieldErrors?.[name]) {
        return current;
      }

      const fieldErrors = { ...current.fieldErrors };
      delete fieldErrors[name];
      return Object.keys(fieldErrors).length > 0
        ? { ...current, fieldErrors }
        : initialFeedbackSubmissionResult;
    });
  };

  const handleSubmit = async () => {
    if (isPending || visibleStep !== 3) {
      return;
    }

    setIsPending(true);
    setSubmissionState(initialFeedbackSubmissionResult);
    try {
      const response = await fetch(`/api/forms/${encodeURIComponent(publicKey)}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          message,
          fullName,
          email,
          socialPlatform,
          socialHandle,
          publicationConsent,
        }),
      });
      const result = (await response.json()) as FeedbackSubmissionResult;
      setSubmissionState(result);
    } catch {
      setSubmissionState({
        status: "error",
        message: "We couldn't send your feedback. Please check your connection and try again.",
      });
    } finally {
      setIsPending(false);
    }
  };

  if (visibleStep === 4) {
    return (
      <Box
        component="main"
        sx={{ bgcolor: "#f7f2e9", minHeight: "100dvh", px: 2, py: { xs: 5, sm: 8 } }}
      >
        <Paper
          variant="outlined"
          sx={{ bgcolor: "#fffef9", maxWidth: 560, mx: "auto", p: { xs: 3, sm: 5 }, textAlign: "center" }}
        >
          <Stack spacing={3} sx={{ alignItems: "center" }}>
            <Typography aria-hidden="true" sx={{ color: "primary.main", fontSize: "3rem" }}>
              ✓
            </Typography>
            <Typography component="h1" variant="h4">
              {stepTitles[4]}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {submissionState.message || configuration.successMessage}
            </Typography>
            <Button href={creatorPath} size="large" variant="contained" sx={{ minHeight: 48, width: "100%" }}>
              Back to {creatorName}
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        bgcolor: "#f7f2e9",
        color: "#231f1a",
        minHeight: "100dvh",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 7 },
      }}
    >
      <Paper
        component="div"
        variant="outlined"
        sx={{ bgcolor: "#fffef9", maxWidth: 560, mx: "auto", p: { xs: 2.5, sm: 5 } }}
      >
        <Stack spacing={4}>
          <Box>
            <Typography color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {visibleStep} of 3
            </Typography>
            <Typography component="h1" sx={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: { xs: "2rem", sm: "2.4rem" }, lineHeight: 1.1, mt: 1 }}>
              {stepTitles[visibleStep]}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Share your feedback with {creatorName}.
            </Typography>
          </Box>

          {submissionState.status === "error" && (
            <Alert severity="error">{submissionState.message}</Alert>
          )}
          {stepError && <Alert severity="warning">{stepError}</Alert>}

          {visibleStep === 1 && (
            <Stack spacing={2}>
              <Typography component="fieldset" sx={{ border: 0, m: 0, p: 0, fontWeight: 700 }}>
                How would you rate your experience?
              </Typography>
              <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ justifyContent: "space-between" }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    aria-label={`${value} out of 5 stars`}
                    aria-pressed={rating === value}
                    data-highlighted={rating !== null && value <= rating}
                    key={value}
                    onClick={() => {
                      setRating(value);
                      setStepError("");
                      clearSubmissionFieldError("rating");
                    }}
                    sx={{ border: 1, borderColor: rating === value ? "primary.main" : "divider", borderRadius: 2, color: rating !== null && value <= rating ? "#f0a928" : "#aaa39b", flex: 1, fontSize: { xs: "1.7rem", sm: "2rem" }, minHeight: 58, minWidth: 0, px: 0 }}
                    type="button"
                  >
                    ★
                  </Button>
                ))}
              </Stack>
              {fieldError("rating") && <FormHelperText error>{fieldError("rating")}</FormHelperText>}
            </Stack>
          )}

          {visibleStep === 2 && (
            <TextField
              error={Boolean(fieldError("message"))}
              fullWidth
              helperText={fieldError("message") ?? `${message.length}/2,000`}
              label="Your story"
              minRows={7}
              multiline
              onChange={(event) => {
                setMessage(event.target.value);
                setStepError("");
                clearSubmissionFieldError("message");
              }}
              slotProps={{ htmlInput: { maxLength: 2000 } }}
              value={message}
            />
          )}

          {visibleStep === 3 && (
            <Stack spacing={2.5}>
              {configuration.fields.fullName.show && (
                <TextField
                  error={Boolean(fieldError("fullName"))}
                  fullWidth
                  helperText={fieldError("fullName")}
                  label="Full name"
                  name="fullName"
                  onChange={(event) => {
                    setFullName(event.target.value);
                    clearSubmissionFieldError("fullName");
                  }}
                  required={configuration.fields.fullName.required}
                  value={fullName}
                />
              )}
              {configuration.fields.email.show && (
                <TextField
                  error={Boolean(fieldError("email"))}
                  fullWidth
                  helperText={fieldError("email")}
                  label="Email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearSubmissionFieldError("email");
                  }}
                  required={configuration.fields.email.required}
                  type="email"
                  value={email}
                />
              )}
              {configuration.fields.socialProfile.show && (
                <Stack spacing={1.5}>
                  <FormControl fullWidth error={Boolean(fieldError("socialPlatform"))}>
                    <InputLabel id="social-platform-label">Social platform</InputLabel>
                    <Select
                      label="Social platform"
                      labelId="social-platform-label"
                      name="socialPlatform"
                      onChange={(event) => {
                        setSocialPlatform(event.target.value as SocialPlatform);
                        clearSubmissionFieldError("socialPlatform");
                      }}
                      value={socialPlatform}
                    >
                      <MenuItem value="INSTAGRAM">Instagram</MenuItem>
                      <MenuItem value="TIKTOK">TikTok</MenuItem>
                    </Select>
                    {fieldError("socialPlatform") && <FormHelperText>{fieldError("socialPlatform")}</FormHelperText>}
                  </FormControl>
                  <TextField
                    error={Boolean(fieldError("socialHandle"))}
                    fullWidth
                    helperText={fieldError("socialHandle") ?? "Optional"}
                    label="Social handle"
                    name="socialHandle"
                    onChange={(event) => {
                      setSocialHandle(event.target.value);
                      clearSubmissionFieldError("socialHandle");
                    }}
                    required={configuration.fields.socialProfile.required}
                    value={socialHandle}
                  />
                </Stack>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={publicationConsent}
                    name="publicationConsent"
                    onChange={(event) => setPublicationConsent(event.target.checked)}
                  />
                }
                label="I’m okay with the creator publishing this feedback with my name or handle."
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Stack>
          )}

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between" }}>
            <Button
              disabled={isPending}
              href={visibleStep === 1 ? creatorPath : undefined}
              onClick={visibleStep === 1 ? undefined : goBack}
              sx={{ minHeight: 48, minWidth: 110 }}
              type={visibleStep === 1 ? undefined : "button"}
              variant="outlined"
            >
              Back
            </Button>
            {visibleStep < 3 ? (
              <Button onClick={goNext} size="large" sx={{ minHeight: 48, minWidth: 110 }} type="button" variant="contained">
                Next
              </Button>
            ) : (
              <Button disabled={isPending} onClick={handleSubmit} size="large" sx={{ minHeight: 48, minWidth: 150 }} type="button" variant="contained">
                {isPending ? "Sending…" : "Send feedback"}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default FeedbackWizard;
