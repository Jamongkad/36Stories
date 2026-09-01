import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Sidebar from "./Sidebar";

describe("Sidebar Component", () => {
	it("renders the focused offer navigation", () => {
		render(<Sidebar />);

		expect(
			screen.getByRole("link", { name: "Overview" })
		).toHaveAttribute("href", "/dashboard");

		expect(
			screen.getByRole("link", { name: "Offers" })
		).toHaveAttribute("href", "/dashboard/offers");

		expect(
			screen.getByRole("link", { name: "Analytics" })
		).toHaveAttribute("href", "/dashboard/analytics");

		expect(screen.queryByRole("link", { name: "Inbox" })).not.toBeInTheDocument();
		expect(screen.queryByRole("link", { name: "Collection Forms" })).not.toBeInTheDocument();
		expect(screen.queryByRole("link", { name: "Testimonial Page" })).not.toBeInTheDocument();
	});	
});
