### Project snapshot

This is a Vite + React + TypeScript frontend scaffolded with shadcn-ui and Tailwind CSS.
Key entry points:

- `src/main.tsx` — app bootstrap (renders `App`).
- `src/App.tsx` — routing is defined with `react-router-dom` Routes. Add custom routes here above the catch-all `*` route.

Build & dev commands (from `package.json`):

- `npm run dev` — start Vite dev server (default port 8080 configured in `vite.config.ts`).
- `npm run build` — production build.
- `npm run preview` — preview built site.

Important project patterns and conventions

- File alias: `@/*` maps to `src/*` (see `vite.config.ts` and `tsconfig.json`). Prefer `@/` imports for app code.
- UI primitives: `src/components/ui/*` contain shadcn-style wrapper components (button, dialog, toast, etc.). Use these instead of raw Radix primitives to keep styling consistent.
- Utility `cn(...)` helper in `src/lib/utils.ts` uses `clsx` + `tailwind-merge` to merge Tailwind classes — use it for conditional classNames.
- State & data fetching: React Query (`@tanstack/react-query`) is used with a root `QueryClient` in `App.tsx`.

Routing and layout

- `App.tsx` mounts `DesktopNav` and `BottomNav`; pages live in `src/pages/` (Home, Transactions, Invoices, Reports, Settings, NotFound). Place new pages in `src/pages` and register routes in `App.tsx`.
- Keep the comment convention: "ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL \"\*\" ROUTE" — follow this to avoid accidentally shadowing fallback route.

Styling and CSS

- Tailwind is used via `index.css` and `tailwind.config.ts`. Use utility classes and the `cn` helper when composing conditional styles.

Dev ergonomics and editor hints

- Vite plugin `lovable-tagger` runs only in development mode (see `vite.config.ts`). It may inject tags or metadata for the Lovable platform — avoid changing its conditional unless intentional.
- Ports/server: Vite server configured to host `::` on port `8080`; tests or local infra may expect this port.

Conventions to follow in edits

- Don't import Radix components directly unless you need a feature not exposed by `src/components/ui/*`.
- Keep TypeScript path aliases when moving files: use `@/components/...` and update `tsconfig`/`vite` if adding aliases.
- Small components go in `src/components/`. Large pages go in `src/pages/`.

Examples

- Adding a page: create `src/pages/ReportsNew.tsx`, then in `src/App.tsx` add
  - `import ReportsNew from "./pages/ReportsNew";`
  - `<Route path="/reports/new" element={<ReportsNew />} />` placed above the `*` route.

Files to reference when making changes

- `package.json` — scripts and deps
- `vite.config.ts` — dev server, aliases, dev-only plugins
- `src/App.tsx`, `src/main.tsx` — app shell and routing
- `src/components/ui/*` — UI primitives and patterns
- `src/lib/utils.ts` — `cn` helper

What not to change without checking

- `vite.config.ts` server settings (host/port) — other tooling may expect port 8080.
- Removing `QueryClientProvider` or global `Toaster` providers in `App.tsx` — these are used app-wide.
- Path alias entries in `tsconfig.json` and `vite.config.ts` separately; keep them in sync.

If something is unclear or missing

- Tell me which area you'd like expanded (tests, CI, API integration, or backend contract examples). I can iterate and add specific examples or commands.
