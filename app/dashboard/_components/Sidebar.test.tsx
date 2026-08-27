import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Sidebar from "./Sidebar";

describe('Sidebar Component', () => {
	it('renders an Overview link', () => {
		render(<Sidebar />);

		expect(
			screen.getByRole('link', { name: 'Overview' })
		).toHaveAttribute('href', '/dashboard');

		expect(
			screen.getByRole('link', { name: 'Inbox' })
		).toHaveAttribute('href', '/dashboard/inbox');

		expect(
			screen.getByRole('link', { name: 'Collection Forms' })
		).toHaveAttribute('href', '/dashboard/forms');

		expect(
			screen.getByRole('link', { name: 'Testimonial Page' })
		).toHaveAttribute('href', '/dashboard/testimonial-page');


	});	
});
