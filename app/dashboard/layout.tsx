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
          gridTemplateColumns: { md: "252px minmax(0, 1fr)" },
          minHeight: { md: "calc(100vh - 72px)" },
          minWidth: 0,
        }}
      >
        <Box
          component="aside"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.76)",
            boxShadow: {
              xs: "0 1px 0 rgba(16, 24, 40, 0.05)",
              md: "1px 0 0 rgba(16, 24, 40, 0.05)",
            },
            borderRight: { md: 1 },
            borderColor: { md: "rgba(228, 231, 236, 0.72)" },
            "& nav": {
              minHeight: { md: "calc(100vh - 72px)" },
            },
          }}
        >
          <Sidebar />
        </Box>

        <Box
          component="main"
          sx={{
            backgroundColor: "#f8fafc",
            backgroundImage: "radial-gradient(#dbe4f0 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            minWidth: 0,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 4, md: 5 } }}>
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default DashboardLayout;
