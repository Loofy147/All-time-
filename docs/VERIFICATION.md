# Verification Ledger

Date: 2026-09-24

## Epistemic status

### Established

- Repository: `Loofy147/All-time-`
- Default branch: `main`
- Vercel project: `all-time-`
- Last independently verified production deployment in this audit: `dpl_HCz6RNLSc9G5HzHpkMAtejrNEPWj`
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

- `main` now references Next.js `16.3.6`.
- The September 22, 2026 Next.js security release patches the critical `next/og` ImageResponse issue in `16.3.6`.
- `main` contains the generated npm lockfile and has passed `npm ci`.
- `main` contains GitHub Actions for reproducible quality/build verification; required status checks are not enabled on the branch.
- Repository migration filenames do not exactly match the live Supabase migration history.
- Browser inference is client-side; Vercel runtime error telemetry cannot represent browser-side inference failures.

### Experimentally supported

A hardening-branch GitHub Actions run on commit `a12b1b5eab14160fa9d77873fce41a4fb01bba70` completed successfully with:

- `npm ci`
- `npm run typecheck`
- `npm run build`
- build-provenance generation and artifact upload

A user-run browser test on the deployed application produced:

- model/runtime load: 128333 ms
- generation: 11288 ms
- output: 265 chars

This supports end-to-end browser execution on that tested environment only. It does not establish general compatibility, performance, or model quality.

The hardening branch now records, per run:

- logical run ID
- model and pinned revision
- requested and actual runtime
- dtype
- in-memory pipeline cache state
- load and generation timing
- prompt length
- SHA-256 digests for prompt, generation configuration, and output when browser crypto is available
- WebGPU preflight state
- online state at run start
- fallback cause
- explicit success/failure status and error text for failed runs

The existing `cacheHit` field remains implementation-specific and is not evidence of browser artifact-cache residency.

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
- The previous statement that production state was OPEN is superseded for commit `fcad119c...`: that commit reached READY production. Subsequent commits in `main` are documentation-only updates and their production deployment state is tracked separately.

## Deployment verification

### Last independently verified production deployment

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

- No deterministic acceptance state exists yet.
- App/build revision is not yet embedded into every browser run record.
- Runtime resource lifecycle has implementation coverage but still needs long-session/device verification.
- Failure taxonomy remains coarse; a structured error-class contract is not yet implemented.

### Product

- No product data schema exists yet.
- Supabase remains intentionally unused by application logic.
- No product-specific persistence requirements have been validated.
- Local prompt/history retention policy is not explicitly documented in the UI.

### Verification infrastructure

- `main` has a reproducible CI path and passed run `36056291780` on commit `3a076a8ec0ea048e121e7b29033d2cc8838a3959`.
- No browser acceptance test suite exists yet.
- `main` has no required status checks/branch protection; CI is not yet an enforced merge gate.
- A build-provenance artifact is produced from source revision, Node version, and package-lock SHA-256.

### PWA

- `main` now targets `registration.waiting` for update activation and reloads on `controllerchange`.
- Navigation responses are cached only when `response.ok` is true.
- Installed-session update behavior remains unverified on a real Android/PWA installation.
- Cache namespace rotation is implemented; long-term deployment churn still needs runtime verification.

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

1. verify PWA update behavior in an installed session;
2. add browser acceptance/failure-state tests;
3. verify long-session resource lifecycle;
4. reconcile Supabase migration replay equivalence.

