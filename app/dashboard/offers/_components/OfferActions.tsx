"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import { deleteOffer, setOfferPublished } from "../actions";

type OfferActionsProps = {
  isPublished: boolean;
  offerId: string;
  offerTitle: string;
};

type PendingAction = "publish" | "delete" | null;

const OfferActions = ({ isPublished, offerId, offerTitle }: OfferActionsProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePublishChange = () => {
    setErrorMessage(null);
    setPendingAction("publish");

    startTransition(async () => {
      try {
        await setOfferPublished(offerId, !isPublished);
      } catch {
        setErrorMessage(`Could not ${isPublished ? "unpublish" : "publish"} this offer. Please try again.`);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleDelete = () => {
    setErrorMessage(null);
    setPendingAction("delete");

    startTransition(async () => {
      try {
        await deleteOffer(offerId);
        setIsDeleteOpen(false);
      } catch {
        setErrorMessage("Could not delete this offer. Please try again.");
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <Stack spacing={1}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button
          disabled={isPending}
          fullWidth
          onClick={handlePublishChange}
          type="button"
          variant={isPublished ? "outlined" : "contained"}
        >
          {pendingAction === "publish"
            ? isPublished
              ? "Unpublishing…"
              : "Publishing…"
            : isPublished
              ? "Unpublish"
              : "Publish"}
        </Button>
        <Button component="a" href={`/dashboard/analytics#offer-${offerId}`} variant="outlined">
          View signal
        </Button>
        <Button
          color="error"
          disabled={isPending}
          fullWidth
          onClick={() => {
            setErrorMessage(null);
            setIsDeleteOpen(true);
          }}
          type="button"
          variant="outlined"
        >
          Delete
        </Button>
      </Stack>

      {errorMessage && !isDeleteOpen && <Alert severity="error">{errorMessage}</Alert>}

      <Dialog
        aria-labelledby={`delete-offer-${offerId}-title`}
        fullWidth
        maxWidth="xs"
        onClose={() => {
          if (!isPending) {
            setIsDeleteOpen(false);
          }
        }}
        open={isDeleteOpen}
      >
        <DialogTitle id={`delete-offer-${offerId}-title`}>Delete “{offerTitle}”?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes the offer, its intent analytics, waitlist signups, and social post references.
            Feedback will be preserved but will no longer be associated with this offer.
          </DialogContentText>
          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={isPending} onClick={() => setIsDeleteOpen(false)} type="button">
            Cancel
          </Button>
          <Button
            color="error"
            disabled={isPending}
            onClick={handleDelete}
            type="button"
            variant="contained"
          >
            {pendingAction === "delete" ? "Deleting…" : "Delete offer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OfferActions;
