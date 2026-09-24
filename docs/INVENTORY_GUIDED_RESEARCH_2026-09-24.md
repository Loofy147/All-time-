# Inventory-Guided Repository Research — 2026-09-24

## Research position

This round starts from Loofy147/Portfolio-Repository-Inventory, observed at commit b3fe82d69988eae846897efc21b14c61d1e7eb3f.

The inventory is used as a navigation and evidence-triage layer, not as a substitute for source inspection. The current inventory has no direct All-time record, so the selection below is capability-driven rather than a claimed project lineage.

The inventory protocol requires repository + ref + commit and separates observations, experiments, inferences, suggestions, unknowns, contradictions, and relationships.

## All-time gap map

Current All-time evidence already establishes:

- browser-side Transformers.js inference;
- pinned model revisions;
- WebGPU capability detection;
- WASM fallback;
- deterministic generation;
- measurement history;
- local prompt/history storage;
- PWA shell caching;
- one successful browser inference on the owner's tested environment.

Relevant open gaps:

1. formal browser/runtime preflight artifact;
2. claim-scoped evidence per run;
3. deterministic acceptance state derived from evidence;
4. stable regression/failure identity;
5. explicit contradiction/decision history;
6. replay identity for deterministic inputs and transforms;
7. controlled evaluation harness;
8. device-independent evidence.

## A. Loofy147/My_browser

Inventory role: acquisition/evidence kernel, evidence/provenance/replay, D3 review.

Observed ref: main @ 402121c0e6cf9294d8e71feecd5752eade859807.

### Established / experimentally supported mechanisms

The source defines an explicit lifecycle:

Execution -> Observation -> Evidence -> Verification -> Provenance/History

Concrete mechanisms include:

- canonical JSON normalization;
- deterministic SHA-256 identities;
- execution identity bound to source/adapter;
- observation identity bound to execution, step, and artifact hash;
- evidence identity bound to observation and artifact;
- verification identity independent of wall-clock time;
- provenance containing adapter version, code revision, environment digest, request ID and raw-artifact reference;
- raw artifact retention by content hash;
- transform lineage and replay;
- SQLite foreign-key relationships;
- idempotent persistence;
- support/contradiction evidence relations.

### Evidence boundary

The successful CI result cited by the repository is for commit 8b523854db0362d0372231cbf3537401c74b3ee8, while the currently inspected main ref is 402121c0e6cf9294d8e71feecd5752eade859807.

Therefore the CI result is experimentally supported for the tested commit, but current-head equivalence is UNKNOWN. The inventory review records the same limitation.

The repository also explicitly states that jsdom is not a real browser runtime and hashing demonstrates integrity/identity rather than source authenticity.

### Transferability to All-time

INFERENCE / HIGH.

The transferable primitive is the evidence lifecycle, not the acquisition package.

An All-time run could become:

run -> execution -> observation -> evidence -> verification -> provenance

with fields such as model ID, model revision, runtime, dtype, browser/runtime descriptor, WebGPU adapter result, test-case ID, generation configuration, output hash, timings, fallback state, error code, app revision, and evidence status.

### First discriminating test

Create one local evidence fixture from an existing successful All-time inference and test:

1. deterministic serialization;
2. stable identity on repetition;
3. identity change when model revision changes;
4. identity change when runtime/dtype changes;
5. identity change when output changes;
6. independent reload and verification.

Do not import the package wholesale.

## B. Loofy147/Software-res

Inventory role: evidence-validation, resilience/reliability validation, explicit release scope.

Observed ref: main @ 138a6be19fe4e4bcd008df2e7ba33588b31ca863.

### Established mechanism

The core policy is deterministic and non-compensatory.

Critical dimensions include functional, dependency, reproducibility, concurrency, and security.

Policy behavior:

- critical failure, mandatory invariant failure, or non-reproducibility -> REJECT;
- critical warning or unknown -> REVIEW;
- non-low risk -> REVIEW;
- AUTO_MERGE only when all critical dimensions pass and the run is reproducible at low risk.

Tests explicitly protect these invariants. The release record reports 26 pytest tests, 3/3 targeted policy mutants killed, controlled A-E outcomes matching expectations, and a passing wheel build.

### Transferability to All-time

INFERENCE / HIGH.

The transferable idea is fail-closed evidence consumption.

All-time can use states such as:

PASS
REVIEW
INCONCLUSIVE
ENVIRONMENT_NOT_READY
RUNTIME_UNAVAILABLE
MODEL_LOAD_FAILED
GENERATION_FAILED
FALLBACK_USED

Missing critical runtime evidence must not silently become PASS merely because text was generated.

### Mutation-testing implication

Once an evidence harness exists, mutate the acceptance logic by removing adapter verification, accepting missing runtime evidence, removing model-revision binding, or disabling deterministic-decoding checks. The regression suite should detect each mutation.

This tests the strength of the verifier itself.

## C. Loofy147/canonical-capability-core

Inventory role: evidence-governed capability lifecycle, authority/effect/reconciliation verification, explicit qualification boundaries.

Observed default ref: master @ 6396327425e7f5e6c23456579ebc286ca69f771f.

### Established mechanism

The evidence specification binds a claim to:

claim ID, falsifiable claim, artifact ID, test ID, result, scope, source commit, package identity, runtime identity, authority class, evidence source, attempt identity, observation/confirmation times, validity window where needed, decision, and reviewer.

The central relation is:

claim -> evidence -> scope -> authority -> decision

The specification explicitly rejects evidence overreach and stale evidence.

### Caveat

This repository is not a production authority. Its own staging documents leave target-runtime and distributed-idempotency work open, and its CI history includes failed qualification work.

Therefore:

- evidence/qualification mechanisms: ESTABLISHED;
- production qualification: NOT ESTABLISHED;
- wholesale integration: REJECTED.

### Transferability to All-time

INFERENCE / HIGH for the claim contract, low for the full runtime.

The immediate useful subset is:

claim_id + evidence_id + test_id + scope + source_revision + runtime_identity + result

This prevents vague records such as "WebGPU works" from losing the browser/runtime/model/test scope.

## D. Loofy147/SIE

Inventory role: ingest -> execute -> vetting -> registry, with an MCP adapter.

Observed ref: main @ a2090a7e805e8f9a1f2734dbc47313df6c14cc0a.

### Established mechanism

Concrete pipeline:

Ingest -> Execute -> Vetting Gate -> Registry

Stored lesson states include unvetted, vetted, and rejected, with vetting timestamp and note.

Tests cover artifact validation, execution success, timeout, vetting pass/rejection, and registry persistence.

### Limitation

The function named execute_sandboxed uses subprocess execution with cwd trapping, output capture, and timeout. The source does not establish hardened OS-level isolation equivalent to a container or VM.

So:

- timeout-bounded execution: ESTABLISHED;
- security sandbox isolation: UNKNOWN.

The current GitHub run endpoint returned zero workflow runs for SIE.

### Transferability

INFERENCE / MEDIUM.

The reusable concept is the promotion gate:

observed run -> gate -> registered reusable result

This may later support benchmark-case promotion, but it should not be represented as browser sandbox security.

## E. Loofy147/ledger-system-source-of-truth

Inventory role: deterministic decision/context ledger, contradiction handling, MCP adapter.

Observed ref: main @ e63a92171f6c5b3a4958157be979347857f6a809.

### Established mechanisms

The ledger:

- uses stable exact keys;
- preserves ordered history;
- detects contradictions deterministically;
- supports explicit supersession;
- centralizes entry construction and contradiction logic;
- reuses the same core through MCP.

The repository also contains a real MCP ClientSession test over SDK InMemoryTransport covering initialize, tools/list, tools/call, conflict creation/resolution, invalid input, unknown-key lookup, and MCP schema validation.

### Limitations

The inventory's D3 review records that this is not an immutable event store, authorization system, or proven multi-client concurrency layer. Comparator changes are also retroactive and unversioned.

### Transferability

INFERENCE / MEDIUM.

This is useful as a future decision/diagnostic sidecar, not as All-time's primary evidence store.

## Cross-repository synthesis

The inventory-guided pass converges on a smaller architecture:

Runtime
-> Observation
-> Evidence
-> Verification
-> Acceptance
-> History

with an optional Decision/Contradiction sidecar.

Source contributions:

- My_browser: evidence identity, provenance, raw artifact, replay.
- Software-res: deterministic fail-closed policy and mutation testing.
- canonical-capability-core: claim/scope/authority/temporal binding.
- SIE: explicit promotion/vetting lifecycle.
- ledger-system-source-of-truth: deterministic contradiction/history.

## What this changes in All-time

The next missing layer is not another model or backend. It is a small browser-native evidence contract.

A run should produce a machine-checkable record containing:

Claim
Test case
Model identity
Runtime identity
Environment preflight
Execution observation
Output identity
Verification result
Acceptance state

This can remain entirely local and does not require Supabase.

## Proposed first integration boundary

One-run evidence contract:

- app code revision;
- model ID;
- model revision;
- runtime;
- dtype;
- browser/runtime descriptor;
- WebGPU availability and adapter result;
- prompt/test-case ID;
- generation configuration;
- load time;
- generation time;
- output length;
- output hash;
- fallback used;
- error/status;
- evidence schema version.

Acceptance checks:

1. serialization is deterministic;
2. repeated execution with the same binding fields reproduces the same evidence identity;
3. changing one material binding field changes identity;
4. missing critical evidence cannot become ACCEPTED;
5. a test case can be replayed from retained input.

No backend is needed for this first experiment.

## Epistemic result

ESTABLISHED:
The inventory successfully identified several concrete mechanisms directly relevant to current All-time verification gaps.

EXPERIMENTALLY_SUPPORTED:
My_browser has tested evidence/replay behavior, but its strongest cited CI result is tied to an older commit than the currently inspected main head.
Software-res has current-ref policy tests and recorded mutation results protecting fail-closed behavior.

INFERENCE:
A small synthesis of these mechanisms can strengthen All-time verification without adding another model, database, or orchestration framework.

UNKNOWN / OPEN:
- measurable downstream value of the evidence contract inside the actual All-time browser runtime;
- stable and non-misleading environment identifiers available from the browser;
- value/cost of retaining raw outputs;
- whether a contradiction ledger is needed after the evidence contract exists.

REJECTED FOR NOW:
- wholesale import of My_browser;
- wholesale import of canonical-capability-core;
- SIE-style sandbox claims for the browser;
- backend ledger/database integration;
- Supabase persistence;
- new model families;
- broad orchestration expansion.

## Stopping rule

The research evidence is sufficient to justify one isolated verification experiment inside All-time.

It is not sufficient to justify broader architecture changes.

Next action: implement and test the isolated evidence-contract experiment, then run build/typecheck/local verification before considering production integration.
