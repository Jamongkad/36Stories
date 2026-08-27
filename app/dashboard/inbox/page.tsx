import { connection } from "next/server";

const DashboardPage = async () => {
	await connection();

	return (
		<h1>Inbox</h1>
	)
}

export default DashboardPage;
