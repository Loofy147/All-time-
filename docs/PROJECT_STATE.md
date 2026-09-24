# All-time — Project State

Date: 2026-09-24

## Purpose

All-time is currently a browser-first local AI workspace. Its purpose at this stage is to establish a small, reproducible client-side inference path before product-specific data modeling or server-side inference is introduced.

## Source of truth

| Area | Source |
|---|---|
| Model registry | `lib/models.ts` |
| Runtime + inference UI | `components/model-lab.tsx` |
| Install/update runtime | `components/pwa-runtime.tsx` |
| PWA manifest | `app/manifest.ts` |
| PWA shell cache | `public/sw.js` |
| Verification ledger | `docs/VERIFICATION.md` |
| Current project state | this file |

## Runtime architecture

1. Next.js serves the application shell.
2. Transformers.js executes text generation in the browser.
3. WebGPU is used only after `navigator.gpu.requestAdapter()` succeeds.
4. WASM/CPU is the fallback runtime.
5. Model artifacts are fetched from fixed Hugging Face revisions.
6. Transformers.js/browser caching handles model artifacts; the service worker caches only the lightweight application shell.
7. Supabase is provisioned but has no application schema yet.

## Model candidates

| Model | Parameters | WebGPU | WASM |
|---|---:|---:|---:|
| SmolLM2 135M Instruct | 135M | q4f16 / ~118 MB | q4 / ~182 MB |
| Qwen2.5 0.5B Instruct | 0.5B | q4f16 / ~483 MB | q4 / ~786 MB |

Model revisions are pinned in `lib/models.ts` and were checked against their Hugging Face repositories.

## PWA state

The application contains:

- installable web-app manifest
- standalone display mode
- static 192px and 512px SVG icons
- service-worker application-shell cache
- offline fallback route
- in-app install/update affordances where the browser exposes them
- mobile-first workspace layout

The PWA must not cache large model artifacts through the service worker.

## Persistence boundary

Browser-local:

- prompt
- recent measurement history

Supabase:

- provisioned and security-hardened
- intentionally unused by application logic until product behavior is defined

## Current evidence state

### Established

- GitHub repository and main branch
- Vercel Git integration
- Supabase project health
- Supabase security/performance advisor state
- Hugging Face model repositories and pinned revisions/artifacts
- one successful real browser inference reported by the owner
- a READY Vercel deployment containing the PWA/static-icon architecture through commit `c3fbff3a0f88c385df04d29cba511ccb529e933a`

### Open

- final `main` deployment after the cleanup commits
- automated browser benchmark
- controlled Android WebGPU benchmark
- comparative model capability/quality
- product-specific schema and persistence requirements

## Operating boundary

No further product feature work should be added until the repository research pass requested by the owner is completed. New changes should first be justified against evidence and this state document.
