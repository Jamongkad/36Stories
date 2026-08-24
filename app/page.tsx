import { connection } from "next/server";
import { createFeedback } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  await connection();

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">36Stories foundation</p>
        <h1>Feedback, persisted.</h1>
        <p className="lede">
          A small end-to-end slice: submit feedback here and it is stored in
          PostgreSQL.
        </p>
      </section>

      <section className="panel" aria-labelledby="new-feedback-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">New entry</p>
            <h2 id="new-feedback-heading">Capture feedback</h2>
          </div>
        </div>

        <form action={createFeedback}>
          <label htmlFor="source">Source</label>
          <input id="source" name="source" defaultValue="widget" required />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            defaultValue="The feedback widget is clear and easy to use."
            required
          />

          <button type="submit">Save feedback</button>
        </form>
      </section>

      <section className="panel" aria-labelledby="stored-feedback-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PostgreSQL</p>
            <h2 id="stored-feedback-heading">Stored feedback</h2>
          </div>
          <span className="count">{feedback.length}</span>
        </div>

        {feedback.length === 0 ? (
          <p className="empty-state">No feedback yet. Add the first entry above.</p>
        ) : (
          <ul className="feedback-list">
            {feedback.map((item) => (
              <li key={item.id}>
                <div className="feedback-meta">
                  <span>{item.source}</span>
                  <time dateTime={item.createdAt.toISOString()}>
                    {item.createdAt.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </div>
                <p>{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
