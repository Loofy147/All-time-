# All-time — Project State

Date: 2026-09-24 — consolidated audit state

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
3. Verification is deliberately separated from generation; current source does not yet implement the full evidence/acceptance contract.
3. WebGPU is used only after `navigator.gpu.requestAdapter()` succeeds.
4. WASM/CPU is the fallback runtime.
5. Model artifacts are fetched from fixed Hugging Face revisions.
6. Transformers.js/browser caching handles model artifacts; the service worker caches only the lightweight application shell.
8. Supabase is provisioned but has no application schema yet.

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

## Research source-of-truth

- `docs/RESEARCH_MASTER_LEDGER_2026-09-24.md` — consolidated chronology, contradictions, and decision boundary.
- `docs/DIRECT_INFRA_INDIRECT_GAP_AUDIT_2026-09-24.md` — current direct/infrastructure/indirect gaps.
- `docs/CROSS_REPOSITORY_AUDIT_2026-09-24.md` — cross-repository mechanism findings.
- `docs/INVENTORY_GUIDED_RESEARCH_2026-09-24.md` — inventory-guided mechanisms.
- `docs/UNREGISTERED_REPOSITORY_RESEARCH_2026-09-24.md` — repositories missing from prior inventory snapshot.
- `docs/DIVERSE_REPOSITORY_RESEARCH_2026-09-24.md` — CI/CD, provenance, reliability, security, privacy, and runtime research from different repository families.

## Current evidence state

### Main verification

The hardening baseline was merged into `main` as commit `3a076a8ec0ea048e121e7b29033d2cc8838a3959`.

The main-branch Quality run `36056291780` passed:

- npm lockfile present and consumed by `npm ci`
- `npm run typecheck` passed
- `npm run build` passed
- build provenance artifact generated and uploaded

### Historical hardening branch verification

The branch `hardening/p0-runtime-evidence` contains the P0/P1/P2 baseline changes and passed GitHub Actions Quality run `36056005521` on commit `a12b1b5eab14160fa9d77873fce41a4fb01bba70`.

Verified in that run:

- npm lockfile present and consumed by `npm ci`
- `npm run typecheck` passed
- `npm run build` passed
- build provenance artifact generated and uploaded

Implemented source changes on the branch:

- Next.js `16.3.6`
- PWA waiting-worker activation fix
- navigation-cache `response.ok` guard
- service-worker cache namespace bump
- runtime pipeline disposal on switch/failure with current pipeline residency retained
- prompt safety limit
- run-level evidence identity/digests/fallback/failure recording
- CI quality/provenance workflow

### Established

- GitHub repository and main branch
- Vercel Git integration
- Supabase project health
- Supabase security/performance advisor state
- Hugging Face model repositories and pinned revisions/artifacts
- one successful real browser inference reported by the owner
- a READY Vercel deployment for commit `fcad119c5de292faf5a06879ffbe7791786f2eb0` (latest independently verified production reference in this audit window)
- current Supabase project health and clean security/performance advisor state

### Open

- no enforced branch protection/status-check gate
- PWA update behavior is not verified on a real installed Android session
- deterministic acceptance state is not implemented yet
- app/build revision is not present in browser run records
- structured failure taxonomy is not implemented
- Supabase migration replay equivalence
- machine-addressable limitations/OPEN claim registry
- adversarial verifier tests
- static capability vs live capability binding
- evidence privacy classification
- automated browser benchmark
- controlled Android WebGPU benchmark
- comparative model capability/quality
- product-specific schema and persistence requirements

## Operating boundary

No further product feature work should be added until the repository research pass requested by the owner is completed. New changes should first be justified against evidence and this state document.
