import { connection } from "next/server";

const DashboardForms = async () => {
	await connection();

	return (
		<h1>Forms</h1>
	)
}

export default DashboardForms;
