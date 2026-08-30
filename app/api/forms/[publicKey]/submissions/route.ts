import { saveFeedbackSubmission } from "@/lib/submitFeedback";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  const { publicKey } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { status: "error", message: "Send feedback as a JSON object." },
      { status: 400 },
    );
  }

  const result = await saveFeedbackSubmission(publicKey, body);
  const status =
    result.code === "not_found"
      ? 404
      : result.code === "invalid"
        ? 422
        : result.code === "server"
          ? 500
          : 200;

  return Response.json(
    {
      status: result.status,
      message: result.message,
      ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
    },
    { status },
  );
}
