import { Box, Container } from "@mui/material";
import AppHeader from "@/app/_components/AppHeader";
import Sidebar from "./_components/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppHeader />
      <Box
        sx={{
          display: { xs: "block", md: "grid" },
          gridTemplateColumns: { md: "240px minmax(0, 1fr)" },
          minWidth: 0,
        }}
      >
        <Box
          component="aside"
          sx={{
            borderBottom: { xs: 1, md: 0 },
            borderRight: { md: 1 },
            borderColor: "divider",
            "& nav": {
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              flexWrap: "wrap",
              gap: 1,
              p: 2,
            },
            "& a": {
              display: "inline-flex",
              minHeight: 44,
              alignItems: "center",
              borderRadius: 2,
              px: 2,
              color: "text.primary",
              textDecoration: "none",
              "&:hover": {
                bgcolor: "action.hover",
              },
            },
          }}
        >
          <Sidebar />
        </Box>

        <Box component="main" sx={{ minWidth: 0 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default DashboardLayout;
