import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

const DashboardForms = async () => {
	await connection();

  const widgets = await prisma.widget.findMany({
		orderBy: {
			createdAt: "desc",
		},
	});

	const items = widgets.map((item) => ({
		...item,
		createdAt: item.createdAt.toISOString(),
		updatedAt: item.updatedAt.toISOString(),
	}));

	console.log(items);

	return (
		<h1>Forms</h1>
	)
}

export default DashboardForms;
