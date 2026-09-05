<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 36Stories MVP Addendum: Mobile-First Intent Signalling

## Product Direction

36Stories is an intent-signalling product for small, up-and-coming
influencers, creators, and small business owners. It helps them decide which
products or services to pursue based on their audience's actions.

The product has pivoted from feedback collection to hosted bio pages,
offers, and intent analytics. Feedback collection, a feedback inbox, and
testimonial publishing are no longer the MVP workflow. Existing feedback
models or legacy code do not imply a requirement to restore that workflow.

The primary use case is:

Creator or business owner creates and publishes offers
→ Shares their 36Stories bio page through social media, Linktree, or other channels
→ Visitor views an offer and clicks through, joins a waitlist, or expresses interest
→ Owner reviews intent analytics and compares offers
→ Owner decides what to promote, improve, stock, or build next

Do not expand the product beyond this loop without discussion.

## Mobile-First Requirement

36Stories must be completely usable from a mobile phone.

For the public-facing experience, mobile is the PRIMARY platform, not a
responsive adaptation of a desktop design.

Public pages should be designed at mobile widths first and enhanced for
larger screens afterward.

Use 375px as a primary development/testing viewport, while ensuring the
interface remains usable at 320px and scales appropriately upward.

## Public Hosted Bio Page

Optimize heavily for followers arriving from Instagram, TikTok, or
Linktree on their phones.

Requirements:

- Fast initial load
- Large touch targets
- No horizontal scrolling
- Readable typography without zooming
- Minimal navigation
- Minimal required typing
- No visitor account required to interact with an offer
- One clear primary action per offer
- Proper mobile keyboard/input behavior
- Accessible form controls
- Clear success state after a waitlist signup or interest action

The hosted page should support:

- Creator or business identity/profile and a short bio
- Published product and service offers
- Clear offer descriptions and calls to action
- Social or other relevant links
- Affiliate disclosure when applicable

The page should look intentional at phone width, not like a desktop SaaS
page compressed into one column. Basic bio-page links support offer discovery;
do not expand into a general-purpose Linktree replacement without discussion.

## Offers and Intent Signals

MVP offers support products and services in three modes:

- Live: an outbound link to a store, affiliate destination, booking page,
  or other relevant destination
- Coming soon: an email waitlist signup
- Idea: a lightweight expression of interest

Use the shared offer policy in `lib/offers/policy.ts` for mode/CTA mappings,
labels, and validation rules. Keep server validation consistent with the UI.

Measure offer views, outbound clicks, waitlist signups, and interest actions.
Keep visitor interactions short and typing minimal. Prefer a short inline
form over a multi-step wizard for waitlist capture.

Public signals must have appropriate input validation, abuse controls, and
deduplication so repeated actions do not misleadingly inflate demand.
Do not introduce external social API dependencies, social OAuth, or identity
verification for MVP.

## Intent Analytics

Analytics are central to MVP. Help owners understand:

- How many viewing sessions each offer receives
- How many visitors take the offer's intended action
- Intent rates, relevant time periods, and available traffic-source context
- Which offers show stronger audience interest and which need more traffic

Be clear about what each metric counts and avoid strong conclusions from
small samples. Clicks, signups, and interest actions are intent signals, not
verified purchases, revenue, or guaranteed demand. Keep comparisons grounded
in the action each offer asks visitors to take.

Defer complex attribution, predictive analytics, and external sales tracking
unless needed to test the core hypothesis and discussed first.

## Creator Admin Experience

The creator dashboard must also be fully usable on mobile.

Prioritize the DAILY creator workflow for mobile:

1. Create and manage product/service offers
2. Publish or unpublish offers
3. Configure and view the hosted bio page
4. Copy/share the hosted page URL
5. Review offer views and intent actions
6. Compare offer signals to decide what to pursue next

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
- Feedback collection forms, a feedback inbox, and testimonial publishing
- Embeddable JavaScript testimonial widget
- Two-way creator/follower messaging
- Reply-to-feedback functionality
- Creator CRM/contact management
- Facebook identity verification
- Instagram/TikTok OAuth
- Complex attribution, predictive analytics, and external sales tracking
- Social media integrations
- General-purpose Linktree replacement functionality beyond the hosted offer bio page
- Checkout, payment processing, inventory management, or booking infrastructure
- Subscription/billing implementation
- Complex theme marketplace

Do not create infrastructure for these features preemptively unless the
current architecture naturally requires an extensibility point.

Avoid speculative abstractions.

## MVP Product Test

The product should allow us to answer one question:

"Will small, up-and-coming influencers and small business owners share a
36Stories bio page, gather meaningful intent signals on product/service
offers, and use those signals to decide which products or services to pursue?"

Every proposed feature should be evaluated against that question.

If a feature is not necessary to test that hypothesis, defer it.
