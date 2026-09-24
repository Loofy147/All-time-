# Verification Ledger

Date: 2026-09-24

## Epistemic status

### Established

- Repository: `Loofy147/All-time-`
- Default branch: `main`
- Current main head: `fcad119c5de292faf5a06879ffbe7791786f2eb0`
- Vercel project: `all-time-`
- Current production deployment for the current main head: `dpl_HCz6RNLSc9G5HzHpkMAtejrNEPWj`
- Current production deployment state: `READY`
- Production root response: HTTP 200
- Supabase project: `All-time-`
- Supabase status: `ACTIVE_HEALTHY`
- Supabase application tables: none
- Supabase Edge Functions: none
- Supabase security advisor: 0 findings
- Supabase performance advisor: 0 findings
- Hugging Face SmolLM2 ONNX revision exists and its q4/q4f16 artifacts were previously verified
- Hugging Face Qwen2.5 0.5B ONNX revision exists and its q4/q4f16 artifacts were previously verified
- Browser-side inference has succeeded once on the owner's device/session
- Transformers.js model revisions are explicitly pinned in source

### Current infrastructure constraints

- Current source pins Next.js `16.3.5`.
- The official Next.js security update of September 22, 2026 states that 16.3.x users should upgrade to `16.3.6` for a critical out-of-band security issue.
- Repository has no package lockfile.
- Repository currently has no GitHub Actions workflow.
- Repository migration filenames do not exactly match the live Supabase migration history.
- Browser inference is client-side; Vercel runtime error telemetry cannot represent browser-side inference failures.

### Experimentally supported

A user-run browser test on the deployed application produced:

- model/runtime load: 128333 ms
- generation: 11288 ms
- output: 265 chars

This supports end-to-end browser execution on that tested environment only. It does not establish general compatibility, performance, or model quality.

The application also records successful-run measurements for:

- model and pinned revision
- runtime and dtype
- cold/warm cache state
- load time
- generation time
- output size

The current `cacheHit` field is implementation-specific and should not yet be interpreted as definitive browser model-cache state.

### Corrected

- Vercel commit `ed09df6…` failed with `lint_or_type_error`; later code restored READY deployments.
- TypeScript path aliases were configured.
- Model pipeline typing was simplified.
- Failed model initialization is removed from the in-memory cache.
- WebGPU and WASM use separate dtype selections.
- WebGPU is checked through `requestAdapter()`, not merely by checking for `navigator.gpu`.
- PWA icon routes using dynamic `ImageResponse` generation were removed after Vercel reported a `nextjs_docs` build error in that path.
- PWA icons are now static SVG files.
- Service worker cache is limited to the application shell and does not intentionally cache model artifacts.
- The previous statement that current HEAD production state was OPEN is superseded by the current Vercel evidence: current HEAD is deployed and READY.

## Deployment verification

### Current production deployment

Commit:

`fcad119c5de292faf5a06879ffbe7791786f2eb0`

State:

`READY`

Deployment:

`dpl_HCz6RNLSc9G5HzHpkMAtejrNEPWj`

Observed production root:

- HTTP 200
- Next.js App Router response
- production alias active

Vercel grouped runtime errors:

- none observed in the selected seven-day window

Boundary:

**This does not establish browser-side inference health.**

### Historical READY deployment

Commit:

`c3fbff3a0f88c385df04d29cba511ccb529e933a`

State:

`READY`

This remains a historical deployment record and is not the current production reference.

## Open claims

### Runtime

- Android-specific WebGPU behavior is not yet controlled or benchmarked.
- Automated browser benchmark through cloud browser automation was inconclusive.
- No device-independent performance claim has been established.
- No stress evidence exists for repeated model switching, long sessions, or browser memory pressure.
- No evidence yet proves cross-device output identity.

### Evidence

- No logical run identity exists yet.
- No output digest exists in successful-run records.
- WebGPU failure followed by WASM fallback does not preserve the original failure in the measurement record.
- No deterministic acceptance state exists.
- Runtime preflight and actual runtime resolution are not persisted as claim-grade evidence.

### Product

- No product data schema exists yet.
- Supabase remains intentionally unused by application logic.
- No product-specific persistence requirements have been validated.
- Local prompt/history retention policy is not explicitly documented in the UI.

### Verification infrastructure

- No current repository CI gate exists.
- No browser acceptance test suite exists.
- Vercel build success is currently the strongest automated deployment gate.
- No reproducible package install is established because no dependency lockfile is committed.

### PWA

- The Update button currently targets the active service-worker controller rather than explicitly messaging the waiting worker; real installed-session verification remains OPEN.
- Navigation cache currently does not gate caching on `response.ok`.
- Service-worker cache retention is not explicitly garbage-collected across many deployments.

### Database

- Live migration history contains `20260924183236/remove_public_execute_rls_auto_enable`, while the repository contains `20260924190000_remove_public_execute_rls_auto_enable.sql`.
- The live database currently exposes no `public.rls_auto_enable()` routine through `information_schema`.
- Database bootstrap reproducibility is therefore not established.

## Evidence boundaries

- Vercel build/deployment success is evidence for deployment/build correctness only.
- HTTP 200 is evidence that the deployed route responds; it is not evidence of client-side inference.
- One successful browser generation is evidence for that tested environment; it is not a population-level performance claim.
- Vercel runtime error absence does not cover browser inference errors.
- Search/research results do not become project facts until they are checked against the relevant repository or experiment.

## Pause condition

No new product features should be added yet.

The admissible next implementation work is limited to:

1. dependency/security baseline correction;
2. reproducible dependency installation;
3. PWA correctness fixes;
4. local evidence-contract experiment;
5. browser acceptance and resource-lifecycle verification.

