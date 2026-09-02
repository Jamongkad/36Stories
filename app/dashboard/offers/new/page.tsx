import { Stack } from "@mui/material";
import { DashboardPageHeader } from "../../_components/DashboardPrimitives";
import OfferEditor from "./_components/OfferEditor";
import { createOffer } from "./actions";

const NewOfferPage = () => (
  <Stack spacing={4} sx={{ maxWidth: 760 }}>
    <DashboardPageHeader
      description="Add something available now, announce what’s coming, or test an idea before building it."
      eyebrow="New signal test"
      title="Create an offer"
    />
    <OfferEditor action={createOffer} />
  </Stack>
);

export default NewOfferPage;
