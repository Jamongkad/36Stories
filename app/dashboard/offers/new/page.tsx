import { Box, Stack, Typography } from "@mui/material";
import OfferEditor from "./_components/OfferEditor";
import { createOffer } from "./actions";

const NewOfferPage = () => (
  <Stack spacing={4} sx={{ maxWidth: 760 }}>
    <Box>
      <Typography component="h1" variant="h2" sx={{ fontSize: { xs: "2.5rem", sm: "3.25rem" } }}>
        Create an offer
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
        Add something available now, announce what’s coming, or test an idea before building it.
      </Typography>
    </Box>
    <OfferEditor action={createOffer} />
  </Stack>
);

export default NewOfferPage;
