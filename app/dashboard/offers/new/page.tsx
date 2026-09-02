import { Stack } from "@mui/material";
import { DashboardPageHeader } from "../../_components/DashboardPrimitives";
import OfferEditor from "./_components/OfferEditor";

const NewOfferPage = () => (
  <Stack spacing={4} sx={{ maxWidth: 760 }}>
    <DashboardPageHeader
      description="Add something available now, announce what’s coming, or test an idea before building it."
      eyebrow="New signal test"
      title="Create an offer"
    />
    <OfferEditor />
  </Stack>
);

export default NewOfferPage;
