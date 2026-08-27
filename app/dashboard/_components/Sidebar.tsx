"use client";

import Link from "next/link";

const Sidebar = () => {
	return (
		<nav aria-label="Dashboard">
			<Link href="/dashboard">Overview</Link>
			<Link href="/dashboard/inbox">Inbox</Link>
			<Link href="/dashboard/forms">Collection Forms</Link>
			<Link href="/dashboard/testimonial-page">Testimonial Page</Link>
		</nav>
	)
}

export default Sidebar;
