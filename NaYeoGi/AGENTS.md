# Repository Guidelines

## Project Structure & Module Organization
The NaYeoGi Vue 3 SPA lives under `src/`, with entry points in `main.js` and `App.vue`. Shared components and layout primitives sit in `src/components/`, while routed pages are grouped in `src/views/`. Domain logic is split into Pinia stores (`src/stores/`), composables (`src/composables/`), and lightweight API shims in `src/restapi/`. Assets that must be fingerprinted go in `src/assets/`, whereas static files (favicons, fonts) belong in `public/`. Keep experimental mock data inside the matching module folder so tree-shaking works when building with Vite.

## Build, Test, and Development Commands
- `pnpm install` (or `npm install`) resolves dependencies using the engines stated in `package.json` (`node` >=20.19).
- `pnpm dev` starts Vite in watch mode. Use `pnpm dev --host` when testing on devices.
- `pnpm build` emits the production bundle in `dist/`.
- `pnpm preview` serves the built bundle to verify routing and lazy-loading before release.
- `pnpm lint` runs ESLint with caching and auto-fix.
- `pnpm format` applies Prettier to `src/`.

## Coding Style & Naming Conventions
Follow the ESLint + Prettier combo already configured. Use 2-space indentation, single quotes in JavaScript, and `<script setup>` SFC blocks when possible. Components that render routes keep PascalCase filenames (e.g., `TravelPlannerView.vue`), composables start with `use` (such as `useStorybook.js`), and Pinia stores use `useXxxStore`. Keep module-relative imports (e.g., `@/components/...`) consistent once an alias is added to `jsconfig.json`.

## Testing Guidelines
A formal test runner has not been wired up yet. Add Vitest and Vue Test Utils when writing new features, place specs alongside the code as `Component.spec.js`, and gate merges on `pnpm test`. Snapshot updates must document the scenario they represent, and any REST stubs under `src/restapi/` should expose deterministic fixtures for repeatable tests.

## Commit & Pull Request Guidelines
Recent commits use short, descriptive subjects such as `DB data`. Continue with imperative, <=50 character titles and optional "scope: detail" prefixes when touching multiple areas. Each PR should describe the user story, list testing evidence (`pnpm build`, screenshots for UI), and link the relevant issue. Include before/after screenshots for visible changes and mention any new configs under `public/` or `src/restapi/`.

## Environment & Configuration Tips
Vite reads environment variables with the `VITE_` prefix; create `.env.local` for secrets and exclude it from commits. Treat files under `src/restapi/` as temporary shims—replace them with real API calls once endpoints exist. When routing, prefer lazy `defineAsyncComponent` imports to keep the initial bundle small, and validate that navigation guards stay in `src/router/index.js`.
