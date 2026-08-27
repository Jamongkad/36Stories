import { connection } from "next/server";

const DashboardTestimonial = async () => {
	await connection();

	return (
		<h1>Testimonials</h1>
	)
}

export default DashboardTestimonial;
