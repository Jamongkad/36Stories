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
  FormGroup,
  FormLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  type CollectionFormActionState,
  initialCollectionFormActionState,
  initialSubmitterFields,
  type SubmitterFieldName,
} from "../_lib/collectionForm";

type CollectionFormEditorProps = {
  createCollectionAction: (
    state: CollectionFormActionState,
    formData: FormData,
  ) => Promise<CollectionFormActionState>;
};

const submitterFields: Array<{
  name: SubmitterFieldName;
  label: string;
  description: string;
}> = [
  {
    name: "fullName",
    label: "Full name",
    description: "Let followers identify themselves by name.",
  },
  {
    name: "email",
    label: "Email",
    description: "Collect an email address with the submission.",
  },
  {
    name: "socialProfile",
    label: "Social profile",
    description: "Let followers share their Instagram or TikTok handle.",
  },
];

const initialMessages = {
  internalName: "",
  headline: "Share your story",
  instructions: "Tell us about your experience.",
  successMessage: "Thanks for sharing your story!",
};

const CollectionFormEditor = ({ createCollectionAction }: CollectionFormEditorProps) => {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState(
    createCollectionAction,
    initialCollectionFormActionState,
  );
  const [messages, setMessages] = useState(initialMessages);
  const [fields, setFields] = useState(initialSubmitterFields);

  useEffect(() => {
    if (actionState.status === "success") {
      router.push("/dashboard/forms");
    }
  }, [actionState.status, router]);

  const updateMessage = (name: keyof typeof messages, value: string) => {
    setMessages((current) => ({ ...current, [name]: value }));
  };

  const updateShow = (name: SubmitterFieldName, show: boolean) => {
    setFields((current) => ({
      ...current,
      [name]: {
        show,
        required: show ? current[name].required : false,
      },
    }));
  };

  const updateRequired = (name: SubmitterFieldName, required: boolean) => {
    setFields((current) => ({
      ...current,
      [name]: { ...current[name], required },
    }));
  };

  return (
    <section aria-labelledby="collection-form-editor-heading">
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography
          component="h1"
          id="collection-form-editor-heading"
          variant="h4"
        >
          Collection Form Editor
        </Typography>
        <Typography color="text.secondary">
          Choose what followers see when they share feedback with you.
        </Typography>
      </Stack>

      <form action={formAction}>
        <Stack spacing={4}>
          {actionState.status === "error" && (
            <Alert severity="error">{actionState.message}</Alert>
          )}
          {actionState.status === "success" && (
            <Alert severity="success">{actionState.message}</Alert>
          )}

          <Stack spacing={3}>
            <Typography component="h2" variant="h6">
              Form messaging
            </Typography>

            <TextField
              error={Boolean(actionState.fieldErrors?.internalName)}
              fullWidth
              helperText={
                actionState.fieldErrors?.internalName ??
                "Only you will see this name in the dashboard."
              }
              label="Internal form name"
              name="internalName"
              onChange={(event) =>
                updateMessage("internalName", event.target.value)
              }
              required
              slotProps={{
                htmlInput: { maxLength: 100 },
                inputLabel: { shrink: true },
              }}
              value={messages.internalName}
            />

            <TextField
              error={Boolean(actionState.fieldErrors?.headline)}
              fullWidth
              helperText={actionState.fieldErrors?.headline}
              label="Headline"
              name="headline"
              onChange={(event) => updateMessage("headline", event.target.value)}
              required
              slotProps={{
                htmlInput: { maxLength: 120 },
                inputLabel: { shrink: true },
              }}
              value={messages.headline}
            />

            <TextField
              error={Boolean(actionState.fieldErrors?.instructions)}
              fullWidth
              helperText={actionState.fieldErrors?.instructions}
              label="Instructions"
              minRows={3}
              multiline
              name="instructions"
              onChange={(event) =>
                updateMessage("instructions", event.target.value)
              }
              required
              slotProps={{ htmlInput: { maxLength: 500 } }}
              value={messages.instructions}
            />

            <TextField
              error={Boolean(actionState.fieldErrors?.successMessage)}
              fullWidth
              helperText={actionState.fieldErrors?.successMessage}
              label="Success message"
              minRows={2}
              multiline
              name="successMessage"
              onChange={(event) =>
                updateMessage("successMessage", event.target.value)
              }
              required
              slotProps={{ htmlInput: { maxLength: 240 } }}
              value={messages.successMessage}
            />
          </Stack>

          <FormControl component="fieldset">
            <FormLabel component="legend">Submitter fields</FormLabel>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              The feedback message is always shown and required.
            </Typography>

            <FormGroup>
              <Stack spacing={2}>
                {submitterFields.map(({ name, label, description }) => (
                  <Paper key={name} variant="outlined" sx={{ p: 2 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      sx={{
                        alignItems: { sm: "center" },
                        gap: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {description}
                        </Typography>
                      </Box>

                      <Stack direction="row" sx={{ flexWrap: "wrap" }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={fields[name].show}
                              name={`${name}Show`}
                              onChange={(event) =>
                                updateShow(name, event.target.checked)
                              }
                              slotProps={{
                                input: { "aria-label": `Show ${label}` },
                              }}
                            />
                          }
                          label="Show"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={fields[name].required}
                              disabled={!fields[name].show}
                              name={`${name}Required`}
                              onChange={(event) =>
                                updateRequired(name, event.target.checked)
                              }
                              slotProps={{
                                input: { "aria-label": `Require ${label}` },
                              }}
                            />
                          }
                          label="Required"
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </FormGroup>
          </FormControl>

          <Button
            disabled={isPending}
            size="large"
            type="submit"
            variant="contained"
            sx={{
              alignSelf: { sm: "flex-start" },
              minHeight: 48,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {isPending ? "Creating form…" : "Create form"}
          </Button>
        </Stack>
      </form>
    </section>
  );
};

export default CollectionFormEditor;
