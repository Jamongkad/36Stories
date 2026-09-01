"use client";

import Link from "next/link";

const Sidebar = () => {
	return (
		<nav aria-label="Dashboard">
			<Link href="/dashboard">Overview</Link>
			<Link href="/dashboard/offers">Offers</Link>
			<Link href="/dashboard/analytics">Analytics</Link>
		</nav>
	)
}

export default Sidebar;
