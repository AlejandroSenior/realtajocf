# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm preview    # Preview production build
```

There is no test suite or linter configured.

## Architecture

This is the official website for **Real Tajo C.F.**, a Spanish football club. It is a single-page public site plus a protected admin panel.

**Stack:** Astro 5 + Vue 3 (via `@astrojs/vue`) + Tailwind CSS v4 + Firebase Auth + Cloudinary

### Rendering model

Astro handles the shell and static components (SSG). Interactive sections are Vue components loaded client-side with `client:only="vue"`. There is no SSR — everything either renders at build time (Astro) or in the browser (Vue).

### Pages and layouts

- `src/pages/index.astro` — public homepage assembling all sections
- `src/pages/login.astro` — Firebase email/password login
- `src/pages/admin.astro` — admin panel (file uploads); protected by `Admin.astro` layout
- `src/layouts/Layout.astro` — base HTML shell (Graduate font, Swiper CSS CDN link)
- `src/layouts/Admin.astro` — wraps `Layout.astro`; runs a `DOMContentLoaded` Firebase auth check and redirects to `/login` if unauthenticated

### Data flow

Vue components fetch live data from an external REST API on mount. All endpoints are relative to `PUBLIC_API_BASE_URL`:

| Component | Endpoint | Method |
|-----------|----------|--------|
| `LeaderBoard.vue` | `/classification` | GET |
| `TopScorers.vue` | `/top-scorers` | GET |
| `Calendar.vue` | `/real-tajo/calendar` | GET |
| `LastMatch.vue` | (same calendar or matchdays) | GET |
| `SeasonBadge.vue` | `/top-scorers`, `/classification`, `/real-tajo/calendar` | GET (parallel) |
| `FileUpload.vue` (admin) | `/classification`, `/real-tajo/calendar`, `/matchdays`, `/top-scorers` | PUT |

`SeasonBadge.vue` derives season label and champion status at runtime from these three endpoints — no separate API call for it.

### Firebase

`src/firebase/client.ts` initialises Firebase once (guards against double-init with `getApps()`). It exports `loginWithEmailAndPassword`, `logout`, `onAuthStateChange`, and `getCurrentUser`. Only Authentication is used; Firestore/Storage are not.

### Cloudinary gallery

`src/content/config.ts` defines an Astro content collection (`assets`) backed by `astro-cloudinary`'s `cldAssetsLoader`, pulling up to 100 images from the `realtajocf` Cloudinary folder at build time. `Gallery.astro` splits them into three Swiper carousels (two scrolling right, one left).

### Styling

Tailwind CSS v4 is configured entirely via `src/global.css` using the `@theme` block — there is no `tailwind.config.*` file. Custom design tokens:

- `--color-primary` / `--color-primary-*` — dark navy blue shades
- `--color-secondary` — gold (`#cfa43c`)

### Environment variables

All are prefixed `PUBLIC_` (exposed to the browser):

```
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_DATABASE_URL
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_STORAGE_BUCKET
PUBLIC_FIREBASE_MESSAGING_SENDER_ID
PUBLIC_FIREBASE_APP_ID
PUBLIC_API_BASE_URL          # Base URL of the external football data API
CLOUDINARY_*                 # Required by astro-cloudinary at build time
```

### Deployment

Pushes to `master` trigger Firebase Hosting deployment via GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`). PRs get a preview channel deployment. The workflow uses pnpm v10 and Node 22.
