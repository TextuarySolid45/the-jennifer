# The Jennifer

A React + MUI + AWS Amplify site so my aunt (a hobby baker) can post a bread/pretzel/bagel
menu and family can place orders. Not a real business — a family side project. She recently
moved away, so this replaces "just tell her what you want" with something that tracks orders
and, eventually, her visits back to Orange County.

## Who uses it

- **My aunt** — the only account that can sign in (self sign-up disabled; her user is created
  manually via the Cognito console / `admin-create-user`). Signed in, she manages the menu and
  moves order statuses forward.
- **Everyone else** (family, her friends, her husband's coworkers) — orders as a guest, no
  account needed.

## Goals (roughly in priority order)

1. **Make it look professional**, not like a side project. A design doc for this exists —
   see `docs/designs/storefront-visual-redesign.md` (Status: APPROVED, not yet implemented).
   Direction: "Warm Artisan Bakery" — small badge logo + wordmark instead of the current
   oversized family-portrait header, real menu content instead of placeholder test data.
2. **Payment** — she asked for the cheapest option. Leaning toward just sharing her Venmo,
   open to alternatives. Not yet designed or built.
3. **Visits** — she travels; when she's back in Orange County she wants to post the dates,
   and orders (not all of them) get attached to a visit so she knows what to prep for that
   trip. Schema/hooks/UI built (see "Current state" below) but **not deployed**.
4. **Know who ordered what** — the `Order` model already had a `name` field but nothing in
   the UI ever let anyone type into it (it was hardcoded to `"New Order"`). Fixed in the same
   uncommitted branch of work as Visits — see below.

## Technical

- Frontend: React + Vite + MUI (`src/util/theme.ts` has the custom green/gold palette).
- Backend: AWS Amplify Gen2 (`amplify/`). Data layer uses AppSync with
  `defaultAuthorizationMode: "identityPool"` — both guest and signed-in access go through
  Cognito Identity Pool IAM roles, not Cognito User Pool JWTs directly.
- Deploy: `amplify.yml` runs `ampx pipeline-deploy` automatically on every push to a branch
  via Amplify Hosting — pushing to `main` deploys the backend schema too, not just the frontend.
- Tests: Vitest + Testing Library, `npm run test`. Currently minimal coverage
  (`src/components/Home/__tests__/`) — "still need unit tests" is an open goal.
- No formal e2e/browser test setup exists yet.

## Current state (as of 2026-08-26) — uncommitted local work

Nothing below is pushed or deployed. Local working tree has two bundles of changes:

**1. Visits + order name field (new feature work):**
- New `Visit` model in `amplify/data/resource.ts` (start/end date range + optional label),
  replacing an unused `Chef.visits` date-array stub nothing ever read. `Order` got an
  optional `visitId` (guest read-only, aunt-only write — same pattern as the existing
  `status` field).
- New hooks: `useGetVisits`, `useCreateVisit`, `useDeleteVisit`, `useUpdateOrder`.
- New components: `Visits.tsx` (accordion section), `NewVisitModal.tsx`.
- `OrderSidePanel` now has an editable "Your name" field (was hardcoded).
- `OrdersAccordion`/`PastOrdersAccordion` show/assign the visit a given order belongs to.
- **This requires an actual Amplify backend deploy (schema change) before it does anything
  live** — right now it degrades gracefully (Visits section just shows empty).

**2. Bug fixes found and fixed while testing the above, unrelated to Visits:**
- `Providers.tsx` was creating a `new QueryClient()` and `createTheme()` on every render
  instead of memoizing them — a real, confirmed bug (verified `Providers` re-renders
  spontaneously) that wipes all cached data and forces the whole app back into a loading
  state whenever it happens. Fixed via `useState(() => new QueryClient())` / module-scope
  `theme`. This is the most likely root cause of a "the whole page reloads" complaint.
- Nested `<button>` inside `<button>` in `Menu.tsx` / `OrdersAccordion.tsx` (invalid HTML —
  an `IconButton` was rendered inside `AccordionSummary`, which is itself a button). Fixed
  with `component="span"` on the inner `IconButton`s. My new `Visits.tsx` copied the same
  pattern and got the same fix.
- `Home.tsx`'s page-wide loading gate no longer blocks on the Visits fetch (non-critical
  data — shouldn't stall the whole page if it's slow or, pre-deploy, erroring).

**Still unresolved:** a full-page spinner flash still reproduces on "Create Order" in local
testing even after the fixes above. Root cause not fully isolated — ran out of session budget
chasing it. Next session should treat this as its own narrowly-scoped `/investigate`, not get
bundled with other work.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

## Known issue not yet investigated

- **Auth bug** (from original notes): "seen some auth issues with the endpoint when a guest
  and authenticated user tries to hit the API." Not reproduced or root-caused this session —
  the user wasn't sure it was still happening post-earlier auth fixes (`9890d40`, `4bb1174`).
  Worth a fresh, evidence-first `/investigate` pass if it resurfaces.

## Notes for whoever picks this up next

- There's a design doc at `docs/designs/storefront-visual-redesign.md` — read it before
  touching anything visual, it has the approved direction and specific next-step list.
- Don't assume the dev server (`npm run dev`) is a safe sandbox — `amplify_outputs.json`
  points at the **real production backend**, so local testing writes real data.
- Before deploying the Visit schema change, double check the git diff on
  `amplify/data/resource.ts` — it's a real schema migration (removes the old `Chef` model).
