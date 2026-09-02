<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Family Kitchen - Multi-Agent Guidelines & Architecture

## 1. Domain Ownership & Boundaries
- **UI & Frontend (`src/app/`, `src/components/`)**:
  - Focus: Visual polish, meal planning UX, mobile ergonomics, responsive sheets, avatars.
  - Rule: Build new UI features into separate, modular components in `src/components/` rather than adding bulk to `src/app/page.tsx`.
- **Supermarket Automation (`scripts/`, `src/app/api/checkout/`)**:
  - Focus: Playwright browser robots (Tesco, Sainsbury's), queue handling, slot booking.
  - Rule: Maintain the API contract with `src/app/api/checkout/route.ts`.
- **Data & Supabase Sync (`src/lib/store.ts`, `src/lib/supabase.ts`)**:
  - Focus: Data models, persistence, cloud synchronization.
  - Rule: Never change or remove existing fields on `Recipe`, `DinnerSlot`, `Ingredient`, or `Planner` without backward compatibility.

## 2. Mandatory Verification & Health Check
- Before concluding any task, the agent MUST run:
  - `npm run build` or `npx tsc --noEmit`
- Never leave a broken TypeScript type or build failure for the next agent.

## 3. Surgical Edits & Preservation
- Do not overwrite or delete unrelated features when refactoring.
- Maintain existing comments, type guards, and knowledge base structures.

## 4. Git Commit Discipline
- After verifying changes, create clean atomic commits with conventional prefixes:
  - `feat(ui): ...`
  - `fix(automation): ...`
  - `refactor(store): ...`
  - `chore(deps): ...`
- When triaging bugs, inspect `git log -n 5` and `git diff` first to locate the regression.

## 5. Security & Configuration
- Store all sensitive supermarket credentials, Supabase keys, and tokens in `.env.local`. Never hardcode secrets in source files.

