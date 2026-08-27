"use client";

import { useState } from "react";

type FeedbackItem = {
	id: string;
	siteId: string;
	contactId: string | null;
	categoryId: string | null;
	title: string | null;
	message: string;
	rating: number | null;
	status: "NEW" | "IN_PROGRESS" | "CLOSED";
	permission: "PRIVATE" | "PUBLIC";
	isPublished: boolean;
	isFeatured: boolean;
	createdAt: string;
	updatedAt: string;
};

type FeedbackListProps = {
	items: FeedbackItem[]
}

const FeedbackList = ({ items }: FeedbackListProps )  => {
	return (
		<section>
			<h1>Hello from Feedbacklist</h1>
			<ul>
				{items.map((feedback, index) => (
					<li key={index}>{feedback.message}</li>
				))}
			</ul>
		</section>
	)
}

export default FeedbackList;
