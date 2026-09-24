# Direct / Infrastructure / Indirect Gap Audit — 2026-09-24

## Audit scope

This round deliberately differs from the repository-mechanism reviews.

It inspects the current All-time runtime, deployment, PWA layer, dependency boundary, database state, and operational semantics, then separates findings into:

1. direct product/runtime gaps;
2. infrastructure/source-of-truth gaps;
3. indirect gaps that can emerge only under real browser use, updates, failure, or expansion.

Repository source was inspected at:

`Loofy147/All-time-`
`main @ fcad119c5de292faf5a06879ffbe7791786f2eb0`

Live infrastructure evidence at audit time:

- Vercel production deployment for the same commit: READY
- production alias: `all-time-ashen.vercel.app`
- root response: HTTP 200
- Vercel grouped runtime errors: none observed in the selected 7-day window
- Supabase project: ACTIVE_HEALTHY
- Supabase public tables: none
- Supabase Edge Functions: none
- Supabase security advisor: 0 lints
- Supabase performance advisor: 0 lints

Important boundary:

**Absence of Vercel runtime errors is not evidence that browser-side inference is healthy.** The model execution path is client-side.

---

# A. Direct gaps

## D1 — Evidence/acceptance contract is still missing

**State: ESTABLISHED FROM SOURCE**

The current run history records model, revision, runtime, dtype, cache flag, load time, generation time, and output size.

It still does not bind a successful run to:

- logical run ID;
- test-case ID;
- prompt/input identity;
- generation-configuration identity;
- output digest;
- application revision;
- runtime preflight result;
- fallback reason;
- verification result;
- acceptance state.

This remains the central direct gap identified by previous rounds.

---

## D2 — `cacheHit` does not mean model-cache warm/cold state

**State: ESTABLISHED FROM SOURCE / SEMANTIC GAP**

The implementation sets `cacheHit` by checking whether an in-memory generator promise already exists in `generatorCache`.

That is not equivalent to:

- model artifact already present in browser Cache API;
- model weights already resident in memory;
- pipeline already initialized;
- GPU resources already allocated.

Therefore the UI statement "warm/cold" currently collapses several distinct cache layers into one boolean.

This can produce misleading measurements.

**Required distinction later:**

`generatorPromiseHit`
vs
`browserArtifactCacheState`
vs
`pipelineResidentState`

Only the first is directly observed by current code.

---

## D3 — WebGPU fallback loses the original failure as evidence

**State: ESTABLISHED FROM SOURCE**

On WebGPU failure the code:

1. catches the first exception;
2. switches to WASM;
3. retries;
4. if successful, records only the successful runtime.

The original WebGPU failure is not retained in the run record.

Therefore a record can report a successful WASM execution without a durable statement that WebGPU was requested and failed.

This is exactly the kind of material distinction required by the proposed evidence contract.

---

## D4 — No input-size guard or explicit context-budget policy

**State: ESTABLISHED FROM SOURCE**

The prompt textarea accepts arbitrary text length. Generation is capped at `max_new_tokens: 96`, but there is no explicit input-size limit, tokenizer-budget check, truncation policy, or refusal state for oversized input.

On constrained mobile devices, excessively large prompts can become a resource and reliability problem.

A future evidence contract should record:

- input character/byte count;
- effective token count when available;
- truncation/refusal policy.

---

## D5 — No cancellation / interrupted-run state

**State: ESTABLISHED FROM SOURCE**

Inference has no cancellation control.

A long model load or generation can be interrupted by navigation, tab suspension, memory pressure, or browser lifecycle events without an explicit durable outcome such as:

`CANCELLED`
`INTERRUPTED`
`BROWSER_SUSPENDED`
`UNKNOWN`

For a measurement-oriented application, silently losing the run is an evidence gap.

---

## D6 — No real test harness for the browser runtime

**State: ESTABLISHED FROM SOURCE**

The repository currently exposes only:

- dev;
- build;
- start;
- typecheck

scripts.

There are no committed unit/integration/browser acceptance tests for:

- WebGPU preflight;
- WASM fallback;
- model identity;
- deterministic configuration;
- evidence generation;
- PWA update;
- offline behavior.

---

# B. Infrastructure gaps

## I1 — Active Next.js security patch gap

**State: ESTABLISHED / HIGH-IMPACT**

Current source pins:

`next: 16.3.5`

The official Next.js security update published September 22, 2026 instructs 16.3.x users to upgrade to **16.3.6** for a critical out-of-band issue. Next.js 16.x is the Active LTS release line. citeturn399523search0turn399523search5

Therefore the currently deployed production build is based on a Next.js patch release that is behind the current critical security fix.

**Disposition: BLOCKER before treating the current dependency baseline as production-hardened.**

The appropriate remediation is a controlled dependency update + reproducible install + build verification, not an ad-hoc package edit.

---

## I2 — No package lockfile

**State: ESTABLISHED FROM SOURCE**

The complete repository tree contains no:

- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`

Several dev dependencies are range-based (`^...`), while transitive dependencies are therefore not source-pinned.

Consequences:

- non-reproducible installs;
- dependency drift between builds;
- security remediation cannot be precisely reconstructed;
- historical deployment may not be reproducible byte-for-byte.

This is independent of the Next.js security issue and remains a separate infrastructure gap.

---

## I3 — No current CI acceptance gate

**State: ESTABLISHED FROM SOURCE**

The current repository tree contains no `.github/workflows` at all.

Vercel production deployments are working, including the current HEAD, but there is no repository-level gate enforcing:

- typecheck;
- build;
- dependency integrity;
- evidence-contract tests;
- PWA tests.

This means deployment success is currently the strongest automated gate, but it does not cover browser behavior or repository-level regression policy.

---

## I4 — Supabase migration source-of-truth drift

**State: ESTABLISHED**

Repository contains:

- `20260924183220_lock_down_rls_auto_enable.sql`
- `20260924190000_remove_public_execute_rls_auto_enable.sql`

Live Supabase migration history contains:

- `20260924183220 / lock_down_rls_auto_enable`
- `20260924183236 / remove_public_execute_rls_auto_enable`

Therefore the version/name of the second live migration does not match the repository filename.

The live database also currently has:

- no public tables;
- no `public.rls_auto_enable()` routine visible through information_schema;
- no Edge Functions.

This makes the database currently quiet, but the migration history is not a clean replay-equivalent of repository Git state.

### Additional source-level concern

Both repository migrations assume `public.rls_auto_enable()` exists. The current database has no such routine.

Therefore the migrations should be treated as **non-self-contained history artifacts**, not yet as a clean reproducible database bootstrap.

This is an infrastructure/source-of-truth issue, not a reason to activate Supabase now.

---

## I5 — Current production state and repository ledger had drift

**State: RESOLVED BY NEW EVIDENCE, DOCUMENTATION STALE**

The earlier `docs/VERIFICATION.md` stated that current HEAD production state was OPEN.

Current Vercel evidence now shows:

- current HEAD `fcad119c...`;
- production deployment for exactly that commit;
- deployment state READY;
- root HTTP 200;
- current aliases active.

So the old verification statement became stale as soon as this deployment completed.

This is not a runtime failure; it is a documentation synchronization failure.

---

## I6 — PWA update path contains a source-level activation bug

**State: ESTABLISHED FROM SOURCE / HIGH RELEVANCE**

The PWA runtime stores the registration result only inside the effect and later calls:

`navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" })`

when the Update button is clicked.

The `SKIP_WAITING` message is therefore sent to the active controller, not the waiting worker detected through `registration.waiting`.

The intended activation path should target the waiting registration.

This means the visible Update button is not reliably wired to the worker that is actually waiting to activate.

---

## I7 — Service-worker navigation cache can cache non-success responses

**State: ESTABLISHED FROM SOURCE / MEDIUM**

For navigation requests, the service worker stores the response unconditionally after `fetch(request)` succeeds at the promise level.

Unlike the static-asset path, this branch does not check `response.ok` before putting the response into cache.

A transient server-side 4xx/5xx HTML response can therefore become the cached navigation response and later be served offline.

The cache policy should distinguish:

- successful application HTML;
- offline fallback;
- error pages.

---

## I8 — Service-worker cache lifecycle is not fully bounded

**State: ESTABLISHED FROM SOURCE / MEDIUM**

The cache name remains:

`all-time-shell-v1`

New Next.js deployments create new immutable chunk URLs, so old static assets can accumulate in the same cache across many deployments.

This is not an immediate correctness failure, but it creates an unbounded client-cache retention path unless the cache namespace is periodically versioned or old entries are explicitly garbage-collected.

---

# C. Indirect gaps

## N1 — Pipeline resources are cached without disposal

**State: ESTABLISHED FROM SOURCE + CURRENT LIBRARY DOCS**

All created generators are retained in the module-level `generatorCache`.

There is no disposal or eviction when the user:

- switches models;
- switches runtime;
- experiments repeatedly;
- leaves the page.

Current Transformers.js documentation exposes pipeline `dispose()` and explicitly documents disposal for releasing GPU/CPU resources; its pipeline API describes the returned object as disposable. citeturn955131search3turn955131search5

Therefore a long exploratory session can retain multiple initialized pipelines and their runtime resources.

This matters more on the phone-first target than on a desktop.

---

## N2 — "Deterministic generation" is only a configuration claim

**State: ESTABLISHED / SCOPE CORRECTION**

`do_sample: false` is deterministic decoding configuration.

It does not by itself establish cross-browser, cross-device, cross-backend byte-identical output.

Therefore project documentation should say:

**deterministic decoding configuration**

rather than implying:

**globally deterministic model outputs**

until controlled multi-environment replay has been demonstrated.

---

## N3 — LocalStorage contains user prompts and outputs indirectly

**State: ESTABLISHED FROM SOURCE**

The prompt is persisted continuously under:

`all-time:prompt:v1`

and successful measurements are persisted under:

`all-time:measurements:v1`

The exported JSON also contains measurements.

This is appropriate for a local-first application only if the user understands that prompts and measurement metadata persist locally. There is currently no retention control for the saved prompt itself and no explicit sensitivity warning.

This becomes more important if the workspace is used for private documents or credentials pasted accidentally into prompts.

---

## N4 — Browser observability is currently split from platform observability

**State: ESTABLISHED**

Vercel currently reports zero grouped runtime errors for the last seven days.

That evidence covers Vercel/server runtime activity, not:

- browser JavaScript exceptions;
- WebGPU failures;
- WASM failures;
- model download failures;
- browser memory pressure;
- GPU device loss;
- localStorage failures.

Thus "no production runtime errors" and "browser inference is healthy" are different claims.

---

## N5 — Model artifacts are revision-pinned but not represented by artifact digests

**State: ESTABLISHED FROM SOURCE / INFERENCE**

The model IDs and revisions are pinned to explicit revisions, which is good supply-chain practice. Hugging Face's security guidance also recommends specifying a revision to protect against repository updates. citeturn355151search7

However, the All-time evidence record currently does not store per-artifact content hashes.

The future evidence layer could therefore distinguish:

`model repository revision`
from
`actual downloaded artifact digest(s)`

without changing the runtime architecture.

---

## N6 — Resource failure states are under-specified

**State: INFERENCE / HIGH RELEVANCE**

The current error path collapses most runtime failures into a human-readable message.

The evidence system should eventually distinguish:

- model-download failure;
- quota/storage failure;
- WebGPU initialization failure;
- WebGPU device-loss;
- WASM initialization failure;
- invalid model artifact;
- input-too-large;
- browser interruption;
- unknown runtime failure.

Without that separation, repeated failures cannot be compared reliably.

---

## N7 — Online/offline indicator is not model-service reachability

**State: ESTABLISHED FROM SOURCE**

The UI derives the Network state from `navigator.onLine`.

That is a coarse browser connectivity signal. It does not establish reachability of the Hugging Face model artifact host, successful model downloads, or successful WebGPU/WASM execution.

The current label should therefore be interpreted as:

**browser network state**

not:

**model service availability**.

---

## N8 — Browser resource constraints are not part of acceptance

**State: INFERENCE / HIGH RELEVANCE**

The project targets phone-first local inference.

Yet acceptance currently does not include:

- peak memory;
- storage quota;
- GPU memory pressure;
- long-session stability;
- model-switch stress;
- repeated-run degradation.

For this project, those are infrastructure-level product constraints rather than optional optimization metrics.

---

# D. What is already healthy

The audit should also preserve positive evidence:

### Production/deployment

- current HEAD is deployed to Vercel and READY;
- root route responds HTTP 200;
- HSTS is present in observed responses;
- no grouped Vercel runtime errors were observed over the selected 7-day window.

### Database

- Supabase is ACTIVE_HEALTHY;
- there are no application tables yet;
- no Edge Functions are deployed;
- security and performance advisor results are clean.

### Dependency/model baseline

- Transformers.js 4.3.0 is the current upstream release observed in the official release feed on September 16, 2026. citeturn955131search9
- Model revisions are explicitly pinned.
- The WebGPU/WASM fallback path exists.

These are evidence of present state, not blanket production-readiness.

---

# E. Consolidated action boundary

The audit does **not** justify adding a database or orchestrator.

The next implementation boundary is narrower:

### Blockers

1. Next.js security patch baseline.
2. Reproducible dependency installation via lockfile.
3. Migration source-of-truth cleanup before future Supabase use.

### Direct runtime correction set

4. Fix PWA update activation.
5. Prevent caching non-success navigation responses.
6. Add logical run/evidence identity.
7. Preserve WebGPU failure + fallback evidence.
8. Correct cache-hit semantics.
9. Add input-size/resource policy.
10. Add explicit runtime failure states.

### Reliability hardening

11. Pipeline disposal/LRU resource policy.
12. Browser inference error/measurement telemetry that does not require a backend.
13. Controlled browser acceptance tests.
14. Stress tests for model switching and long sessions.
15. Privacy-aware local retention policy.

The four evidence primitives from the previous round remain valid, but this round adds two prerequisites that should precede them:

`Dependency/Deployment Integrity`
and
`Runtime Resource Lifecycle`

---

# Final epistemic state

**ESTABLISHED**

- Current production HEAD is READY.
- The repository currently lacks a lockfile and CI workflow.
- Current source contains the PWA update-message bug and cache-policy weakness.
- Current Supabase migration history diverges from repository migration filenames.
- Current runtime retains initialized generator promises without disposal.
- Current browser evidence is not visible to Vercel server observability.
- Current Next.js version is behind the official September 22, 2026 security patch baseline. citeturn399523search0

**EXPERIMENTALLY_SUPPORTED**

- Current production route responds successfully.
- No Vercel grouped runtime errors were observed in the selected seven-day window.
- Supabase advisors report no current security/performance lints.

**INFERENCE**

- Large prompt inputs and retained pipelines can become mobile resource-pressure failure modes.
- The evidence contract should precede any database-backed history.
- Migration/source-of-truth drift will become materially more important once Supabase is activated.

**UNKNOWN / OPEN**

- Actual peak memory on the owner's Android device.
- Whether the PWA update path fails in a real installed session; source-level analysis indicates it is not correctly targeting the waiting worker.
- Exact browser model-cache behavior across the tested devices.
- Cross-device output reproducibility.

**NOT JUSTIFIED**

- Activating Supabase for product persistence.
- Adding an orchestration framework.
- Adding additional model families.
- Treating Vercel's zero server errors as proof of browser inference health.
