# Verification Ledger

Date: 2026-09-24

## Epistemic status

### Established

- Repository: `Loofy147/All-time-`
- Default branch: `main`
- Vercel project: `all-time-`
- Supabase project: `All-time-`
- Supabase status: `ACTIVE_HEALTHY`
- Supabase application tables: none
- Supabase security advisor: 0 findings
- Supabase performance advisor: 0 findings
- Hugging Face SmolLM2 ONNX revision exists and its q4/q4f16 artifacts were verified
- Hugging Face Qwen2.5 0.5B ONNX revision exists and its q4/q4f16 artifacts were verified
- Browser-side inference has succeeded once on the owner's device/session
- A Vercel deployment containing the PWA/static-icon architecture reached READY at commit `c3fbff3a0f88c385df04d29cba511ccb529e933a`

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

Decoding for benchmark runs is deterministic with `do_sample=false`.

### Corrected

- Vercel commit `ed09df6…` failed with `lint_or_type_error`; later code restored READY deployments.
- TypeScript path aliases were configured.
- Model pipeline typing was simplified.
- Failed model initialization is removed from the in-memory cache.
- WebGPU and WASM use separate dtype selections.
- WebGPU is now checked through `requestAdapter()`, not merely by checking for `navigator.gpu`.
- PWA icon routes using dynamic `ImageResponse` generation were removed after Vercel reported a `nextjs_docs` build error in that path.
- PWA icons are now static SVG files.
- Service worker cache is limited to the application shell and does not intentionally cache model artifacts.

## Deployment verification

### Last known READY deployment

Commit:

`c3fbff3a0f88c385df04d29cba511ccb529e933a`

State:

`READY`

This deployment contains the PWA manifest, static 192/512 SVG icons, and mobile workspace architecture.

### Current HEAD

Current source includes subsequent cleanup commits after the last READY deployment.

Therefore:

**Current HEAD production state: OPEN**

The correct claim is not "current HEAD is deployed and verified".

## Open claims

### Runtime

- Android-specific WebGPU behavior is not yet controlled or benchmarked.
- Automated browser benchmark through cloud browser automation was inconclusive.
- No device-independent performance claim has been established.

### Model capability

- No controlled quality comparison between SmolLM2 135M and Qwen2.5 0.5B has been established.
- Arabic/English capability has not been evaluated with a fixed test set.

### Product

- No product data schema exists yet.
- Supabase remains intentionally unused by application logic.
- No product-specific persistence requirements have been validated.

### Verification infrastructure

- A GitHub Actions build workflow produced no observable workflow runs.
- It was removed during cleanup rather than being presented as functioning CI.

## Evidence boundaries

- Vercel build success is evidence for build correctness only.
- HTTP 200 is evidence that the deployed route responds; it is not evidence of client-side inference.
- One successful browser generation is evidence for that tested environment; it is not a population-level performance claim.
- Search/research results do not become project facts until they are checked against the relevant repository or experiment.

## Pause condition

This repository is now in a deliberate research pause. No new implementation work should be added until the owner's repository research pass identifies specific transferable mechanisms or contradictions worth testing.
