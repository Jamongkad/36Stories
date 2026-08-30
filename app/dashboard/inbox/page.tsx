import { Box, Stack, Typography } from "@mui/material";
import { connection } from "next/server";
import FeedbackList from "../_components/FeedbackList";
import { prisma } from "@/lib/prisma";

const DashboardInboxPage = async () => {
	await connection();

	const site = await prisma.site.findFirst({
		where: {
			domain: "localhost",
			organization: { slug: "36stories-demo" },
		},
		select: {
			feedback: {
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					message: true,
					rating: true,
					permission: true,
					isPublished: true,
					createdAt: true,
					contact: {
						select: {
							fullName: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
				},
			},
		},
	});

	const items = (site?.feedback ?? []).map((item) => ({
		...item,
		permission: item.permission as "PRIVATE" | "PUBLIC",
		createdAt: item.createdAt.toISOString(),
	}));

	return (
		<Stack spacing={{ xs: 3, sm: 4 }}>
			<Box>
				<Typography
					component="h1"
					variant="h2"
					sx={{ fontSize: { xs: "2.5rem", sm: "3rem" } }}
				>
					Inbox
				</Typography>
				<Typography color="text.secondary" sx={{ mt: 1 }}>
					Review feedback from your audience.
				</Typography>
			</Box>
			<FeedbackList items={items} />
		</Stack>
	);
};

export default DashboardInboxPage;
