<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 36Stories MVP Addendum: Creator-Focused Mobile Experience

## Product Direction

36Stories is being rebuilt initially for small creators and influencers,
particularly Instagram and TikTok creators.

The primary use case is:

Instagram / TikTok
→ Creator's Linktree or link-in-bio page
→ 36Stories hosted feedback page
→ Follower leaves feedback
→ Feedback appears in creator's inbox
→ Creator keeps it private or publishes it

Do not expand the product beyond this loop without discussion.

## Mobile-First Requirement

36Stories must be completely usable from a mobile phone.

For the public-facing experience, mobile is the PRIMARY platform, not a
responsive adaptation of a desktop design.

Public pages should be designed at mobile widths first and enhanced for
larger screens afterward.

Use 375px as a primary development/testing viewport, while ensuring the
interface remains usable at 320px and scales appropriately upward.

## Public Hosted Feedback Page

Optimize heavily for followers arriving from Instagram, TikTok, or
Linktree on their phones.

Requirements:

- Fast initial load
- Large touch targets
- No horizontal scrolling
- Readable typography without zooming
- Minimal navigation
- Minimal required typing
- No account required to submit feedback
- One clear primary action
- Proper mobile keyboard/input behavior
- Accessible form controls
- Clear success state after submission

Prefer a short single-page form over a multi-step wizard for MVP.

## Feedback Form

MVP feedback should support:

- Feedback/message
- Name
- Optional social handle
- Social platform:
  - Instagram
  - TikTok
- Any publication/attribution consent required by the existing schema

Social handles are SELF-REPORTED.

Do NOT implement:

- Instagram OAuth
- TikTok OAuth
- Social identity verification
- Meta APIs
- TikTok APIs

Do not introduce external social API dependencies for MVP.

## Hosted Public Page

The creator's hosted page should also be mobile-first.

It should support:

- Creator identity/profile
- Creator-defined feedback prompt
- Published feedback/stories
- Attribution when appropriate
- Prominent "Leave Feedback" action

The page should look intentional at phone width, not like a desktop SaaS
page compressed into one column.

## Creator Admin Experience

The creator dashboard must also be fully usable on mobile.

Prioritize the DAILY creator workflow for mobile:

1. Open inbox
2. Read feedback
3. See submitter identity/social handle
4. Keep feedback private or publish it
5. Unpublish previously published feedback
6. View hosted page
7. Copy/share hosted page URL

A creator should not require a desktop computer to perform normal
36Stories operations.

Less-frequent configuration screens may take advantage of additional
desktop space, but they must remain functional on mobile.

Principle:

"Desktop provides more room, not required functionality."

## Authentication

Do not build native-mobile-specific authentication.

The current product remains a web application.

Authentication should work cleanly from mobile browsers and maintain
reasonable session persistence.

Do not build a React Native/mobile application as part of MVP.

## Explicitly Out of Scope

The following ideas have been discussed but are NOT MVP requirements:

- Native iOS/Android application
- React Native
- Embeddable JavaScript testimonial widget
- Two-way creator/follower messaging
- Reply-to-feedback functionality
- Creator CRM/contact management
- Facebook identity verification
- Instagram/TikTok OAuth
- Advanced analytics
- Social media integrations
- Linktree replacement functionality
- Subscription/billing implementation
- Complex theme marketplace

Do not create infrastructure for these features preemptively unless the
current architecture naturally requires an extensibility point.

Avoid speculative abstractions.

## MVP Product Test

The product should allow us to answer one question:

"Will creators put a 36Stories link in their Linktree/bio, receive
meaningful feedback from followers, and find value in reviewing and
selectively publishing that feedback?"

Every proposed feature should be evaluated against that question.

If a feature is not necessary to test that hypothesis, defer it.
