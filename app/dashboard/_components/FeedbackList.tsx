import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

type FeedbackContact = {
	fullName: string | null;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
};

export type FeedbackListItem = {
	id: string;
	message: string;
	rating: number | null;
	permission: "PRIVATE" | "PUBLIC";
	isPublished: boolean;
	createdAt: string;
	contact: FeedbackContact | null;
};

type FeedbackListProps = {
	items: FeedbackListItem[];
};

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const formatRelativeDate = (
	dateValue: string | Date,
	now: Date = new Date(),
) => {
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) {
		return "Unknown date";
	}

	const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const daysAgo = Math.floor(
		(currentDay.getTime() - dateDay.getTime()) / MILLISECONDS_PER_DAY,
	);

	if (daysAgo <= 0) {
		return "Today";
	}
	if (daysAgo === 1) {
		return "Yesterday";
	}

	return `${daysAgo} days ago`;
};

const getSenderName = (contact: FeedbackContact | null) => {
	const legacyName = [contact?.firstName, contact?.lastName]
		.filter(Boolean)
		.join(" ")
		.trim();

	return contact?.fullName?.trim() || legacyName || "Anonymous sender";
};

const getPublicationLabel = (feedback: FeedbackListItem) => {
	if (feedback.isPublished) {
		return "Published";
	}

	return feedback.permission === "PRIVATE" ? "Private" : "Unpublished";
};

const Rating = ({ value }: { value: number | null }) => {
	const normalizedRating =
		value === null ? null : Math.max(0, Math.min(5, Math.round(value)));

	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
			<Box
				component="span"
				role="img"
				aria-label={
					normalizedRating === null
						? "No rating"
						: `${normalizedRating} out of 5 stars`
				}
				sx={{ display: "inline-flex", gap: 0.25, lineHeight: 1 }}
			>
				{Array.from({ length: 5 }, (_, index) => {
					const filled = normalizedRating !== null && index < normalizedRating;

					return (
						<Box
							component="span"
							key={index}
							data-filled={filled}
							data-testid="feedback-star"
							aria-hidden="true"
							sx={{
								color: filled ? "#e4a72c" : "text.disabled",
								fontSize: "1.25rem",
							}}
						>
							★
						</Box>
					);
				})}
			</Box>
			{normalizedRating === null && (
				<Typography variant="caption" color="text.secondary">
					No rating
				</Typography>
			)}
		</Stack>
	);
};

const FeedbackList = ({ items }: FeedbackListProps) => {
	if (items.length === 0) {
		return (
			<Box component="section" aria-label="Feedback inbox">
				<Typography color="text.secondary">No feedback yet.</Typography>
			</Box>
		);
	}

	return (
		<Stack
			component="section"
			aria-label="Feedback inbox"
			spacing={2}
			sx={{ width: "100%", maxWidth: 760, mx: "auto" }}
		>
			{items.map((feedback) => {
				const senderName = getSenderName(feedback.contact);
				const email = feedback.contact?.email?.trim() || "No email provided";

				return (
					<Card
						key={feedback.id}
						component="article"
						variant="outlined"
						sx={{
							borderColor: "divider",
							borderRadius: 3,
							boxShadow: "0 2px 10px rgba(23, 34, 27, 0.04)",
						}}
					>
						<CardContent
							sx={{
								p: { xs: 2, sm: 2.5 },
								"&:last-child": { pb: { xs: 2, sm: 2.5 } },
							}}
						>
							<Stack spacing={2}>
								<Stack
									direction="row"
									spacing={2}
									sx={{
										justifyContent: "space-between",
										alignItems: "flex-start",
									}}
								>
									<Box sx={{ minWidth: 0 }}>
										<Typography
											component="h2"
											variant="h6"
											sx={{ overflowWrap: "anywhere" }}
										>
											{senderName}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ overflowWrap: "anywhere" }}
										>
											{email}
										</Typography>
									</Box>
									<Typography
										component="time"
										dateTime={feedback.createdAt}
										variant="body2"
										color="text.secondary"
										sx={{ flexShrink: 0, ml: "auto", whiteSpace: "nowrap" }}
									>
										{formatRelativeDate(feedback.createdAt)}
									</Typography>
								</Stack>

								<Typography
									variant="body1"
									sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
								>
									{feedback.message}
								</Typography>

								<Stack
									direction="row"
									spacing={1.5}
									sx={{
										alignItems: "center",
										justifyContent: "space-between",
										flexWrap: "wrap",
									}}
								>
									<Rating value={feedback.rating} />
									<Chip
										label={getPublicationLabel(feedback)}
										size="small"
										variant="outlined"
										color={feedback.isPublished ? "primary" : "default"}
									/>
								</Stack>
							</Stack>
						</CardContent>
					</Card>
				);
			})}
		</Stack>
	);
};

export default FeedbackList;
