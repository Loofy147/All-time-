# Cross-Repository Audit — 2026-09-24 Round 2

## Scope

This audit extends the previous inventory-guided review to additional repositories selected for mechanisms relevant to All-time's current gaps:

- `Loofy147/m0-durable-run`
- `Loofy147/recursive-audit`
- `Loofy147/external-staging-authority`
- `Loofy147/algeria-ai-product-fabric`
- `Loofy147/The-adaptive-methodology`
- `Loofy147/outonomos-system`
- `Loofy147/Ai-evaluation-system`
- `Loofy147/trading-validations-principles`
- `Loofy147/Research-framwork`
- `Loofy147/ACE-Agentic-Context-Engineering`

The source repository and inspected paths are treated as the evidence source. Repository README claims are not promoted beyond the strength of the underlying source/tests/runs.

## Current All-time reference

Current `main` head at audit time:

`318f31de54fd3a4295cfbc28c183577dbb079ab5`

The current runtime implementation remains browser-local. The main run record currently stores model/revision/runtime/dtype/cache/load/generation/output-size, but it does not persist:

- app source revision per run;
- test-case identity;
- prompt/input identity;
- generation-configuration identity;
- output content hash;
- explicit fallback-used state;
- environment preflight identity;
- verification result;
- acceptance state;
- stable run identity across retries.

This is an observation from the current source, not a design suggestion.

---

## Finding 1 — Stable execution identity is currently missing

### Source evidence

`Loofy147/m0-durable-run/core.py` defines:

- append-only envelope writes;
- deterministic `run_<run_id>` record addressing;
- lookup-before-execute idempotency;
- explicit rejection of duplicate record IDs rather than silent overwrite.

Its `test_m0.py` checks that a retry with the same `run_id` does not call the executor a second time, and that separate process execution is verified separately by `restart_demo.py`.

### Epistemic state

**EXPERIMENTALLY_SUPPORTED / REPOSITORY-REPORTED**

The mechanism is concrete and covered by repository tests. It was not independently executed during this audit.

### Transfer to All-time

**INFERENCE / HIGH relevance**

The current browser history key is based on `Date.now()`. That is an event timestamp, not a stable logical run identity.

Candidate principle:

`logical_run_id` must be assigned before execution and reused for retry/replay of the same logical test case.

Do not import the M0 storage design wholesale. The useful primitive is identity + idempotent re-entry.

---

## Finding 2 — Separate semantic evidence from trace/provenance data

### Source evidence

`Loofy147/trading-validations-principles` contains a temporal replay comparator and a documented correction:

- timestamps and provenance are allowed to change when the temporal representation changes;
- trace-derived digests are reported for observability;
- trace-derived digests are excluded from the value-derived invariance projection;
- acceptance remains dependent on the value-derived projection.

This distinction is recorded in:

- `reports/CURRENT_STATE.md`
- `reports/M1_1_REAL_DATA_GATE.md`
- `tools/compare_temporal_replays.py`

### Epistemic state

**ESTABLISHED at repository-source level; replay gate outcome is partly USER-REPORTED**

### Transfer to All-time

**INFERENCE / HIGH relevance**

All-time evidence should distinguish at least:

1. **material binding identity** — model/revision/runtime/dtype/test/config;
2. **semantic observation** — generated output and verification-relevant fields;
3. **trace/provenance** — wall-clock timing, browser metadata, export time, diagnostic details.

A single hash over all fields would create false mismatches on repeated execution merely because timing or export metadata changed.

The first experiment should therefore produce two projections rather than one monolithic identity.

---

## Finding 3 — Environment readiness must be explicit, not inferred from successful output

### Source evidence

`Loofy147/Ai-evaluation-system/.github/workflows/real-gil.yml` contains a dedicated environment verification step before acceptance:

- checks CPython implementation;
- checks `Py_GIL_DISABLED == 1`;
- checks `sys._is_gil_enabled() is False`;
- only then runs the acceptance batch;
- the final gate requires exact metric values of 1.0 and an accepted summary;
- raw JSON evidence is uploaded regardless of success.

The repository's recent workflow history also contains failures. Therefore the mechanism is useful as a gate design, but this project is not evidence that the gate is currently operationally green.

### Epistemic state

**EXPERIMENTALLY_SUPPORTED as a mechanism; current operational success NOT ESTABLISHED**

### Transfer to All-time

**INFERENCE / HIGH relevance**

A successful generation must not imply that the requested runtime was successfully exercised.

For example:

- requested WebGPU + actual WASM fallback;
- WebGPU API present but adapter unavailable;
- browser execution succeeded but model revision binding is missing.

These should remain distinct evidence states.

Proposed field:

`runtime_resolution: {requested, detected, actual, fallback_used, preflight_status}`

Acceptance can then explicitly state whether the observation qualifies for a WebGPU-specific claim or only for generic browser inference.

---

## Finding 4 — Evidence should preserve source scope and temporal validity

### Source evidence

`Loofy147/external-staging-authority` uses durable effect identity, command identity, idempotency key, attempt, authority classification, observation time, validity time, and evidence reference.

Its API rejects idempotency-key reuse when command identity differs and rejects evidence-reference mismatch during reconciliation.

### Epistemic state

**ESTABLISHED at source level; production authority explicitly not established**

### Transfer to All-time

**INFERENCE / MEDIUM-HIGH relevance**

All-time does not need an external authority service. The transferable subset is:

- bind an observation to its exact execution attempt;
- record validity/scope where appropriate;
- reject mismatched evidence rather than reinterpret it.

For browser evidence, this is especially relevant to model revisions and test-case definitions.

---

## Finding 5 — Derived conclusions need revalidation when upstream evidence changes

### Source evidence

`Loofy147/recursive-audit` implements a claim graph, evidence auditing, retraction propagation, conflict branches, and outcome gating. Its tests include retraction propagation and branch-conflict isolation.

The repository also uses a hard outcome gate: HARD findings produce non-zero failure behavior, while SOFT findings remain distinguishable.

### Epistemic state

**EXPERIMENTALLY_SUPPORTED / REPOSITORY-REPORTED**

### Transfer to All-time

**INFERENCE / MEDIUM relevance**

The useful concept is not the full graph engine.

The relevant rule is:

> A derived acceptance/verification result must not remain authoritative when a material upstream input is later invalidated.

For All-time this can start very small:

- model revision changes;
- evidence schema changes;
- test-case definition changes;
- verification rule version changes.

Older runs remain historical; they are not rewritten. New verification should produce a new result referencing the old evidence.

---

## Finding 6 — Evidence-first architecture is independently reinforced

### Source evidence

`Loofy147/algeria-ai-product-fabric` explicitly makes evidence a first-class object, assigns deterministic critical calculations/policy checks to code, and separates extraction from evaluation. Its repository structure includes evaluation fixtures and mutation testing.

### Epistemic state

**ESTABLISHED at repository-design level**

### Transfer to All-time

**INFERENCE / HIGH relevance**

This reinforces the current direction:

LLM/runtime output -> structured evidence -> deterministic verifier -> acceptance state.

The generator should not write its own final acceptance label.

---

## Finding 7 — Some gating patterns are useful as negative evidence, not as mechanisms to import

### Source evidence

`Loofy147/The-adaptive-methodology` implements automated gates, but at least one value-justification gate accepts content based on keyword presence such as `reduce`, `measure`, `increase`, etc.

### Epistemic state

**ESTABLISHED from repository source**

### Transfer decision

**REJECTED as a verification primitive**

Keyword presence is not sufficient evidence for a factual or runtime claim.

For All-time, acceptance should consume typed evidence fields and deterministic checks, not natural-language keyword heuristics.

This is a useful counterexample because it marks a boundary between workflow gating and evidence verification.

---

## Finding 8 — Broad orchestration remains unnecessary at this stage

### Source evidence

- `Research-framwork` provides controlled multi-variant experiment orchestration and reporting.
- `Unified-ai` describes a large hierarchical agent platform with memory, orchestration, and resource management.
- `ACE-Agentic-Context-Engineering` adds persistent playbooks, semantic deduplication, and self-healing.
- `outonomos-system` provides autonomous contribution governance with automated checks and human escalation.

These mechanisms are broader than the current All-time evidence gap.

### Epistemic state

**ESTABLISHED as repository capabilities; value for All-time remains UNTESTED**

### Transfer decision

**DEFERRED**

No model zoo, agent swarm, playbook system, contribution gateway, or general orchestrator should be added merely because the repositories contain them.

---

## Consolidated gap update

The cross-repository evidence now reduces the next verification problem to four concrete primitives:

### P1 — Logical run identity

Stable across retry/replay.

### P2 — Two-level evidence identity

Separate material/semantic identity from trace/provenance noise.

### P3 — Explicit runtime preflight and resolution

Requested runtime must be distinguishable from actual runtime.

### P4 — Deterministic acceptance state

`PASS | REVIEW | INCONCLUSIVE | ENVIRONMENT_NOT_READY | RUNTIME_UNAVAILABLE | GENERATION_FAILED`

with missing critical evidence unable to become `PASS`.

These four primitives are sufficient for the next experiment. Nothing in this audit justifies adding Supabase, another model family, or a general orchestration layer.

---

## Current source-level contradictions / cautions

1. **All-time historical CI is not current verification.**
   The repository had a GitHub Actions build workflow with a failed run on commit `0a5630592645d2a1ca4170c7a6808cfdaec6122a`; the workflow was subsequently removed. Therefore current source validation must not be inferred from historical workflow presence.

2. **Repository claims vary in strength.**
   Several reviewed repositories have strong source-level mechanisms but stale, failed, user-reported, or absent CI evidence. Mechanism existence and current operational correctness are separate claims.

3. **Browser evidence has a population boundary.**
   The existing successful browser run remains evidence for the tested environment only.

4. **LocalStorage is not a canonical event store.**
   The current implementation persists session measurements by replacing a JSON array. This is sufficient for a local UI history, but not evidence of append-only durability, cross-tab concurrency safety, or crash-consistent canonical history.

---

## Result of this audit

**ESTABLISHED**

- Several repositories contain concrete mechanisms directly matching current All-time gaps.
- The strongest common structure is evidence binding + explicit verification + deterministic acceptance, not larger orchestration.
- Current All-time source has a real gap between observed run metrics and claim-grade evidence.

**EXPERIMENTALLY_SUPPORTED / REPOSITORY-REPORTED**

- M0 idempotent run identity and restart recovery tests.
- REAS hard/soft audit gates and retraction propagation tests.
- Ai-evaluation-system environment preflight and fail-closed acceptance workflow design.
- Trading-validation temporal/value-derived comparison structure.

**INFERENCE**

The four primitives P1-P4 are a coherent, narrow next experiment for All-time.

**UNKNOWN / OPEN**

- whether the evidence record adds measurable value without harming browser UX;
- whether a stable environment descriptor can be produced without privacy-sensitive identifiers;
- how much raw output should be retained;
- whether a contradiction/retraction sidecar is needed after P1-P4 are tested.

**REJECTED / DEFERRED**

- wholesale import of any reviewed repository;
- Supabase activation;
- broad agent orchestration;
- semantic playbook/self-healing;
- keyword-based acceptance;
- browser sandbox/security claims.

## Next admissible experiment

Implement only P1-P4 as a local browser evidence fixture around the existing run path.

Required acceptance tests:

1. same logical test replay -> same material identity;
2. changed model revision -> different identity;
3. changed runtime/dtype -> different identity;
4. changed generation config -> different identity;
5. changed output -> different semantic identity;
6. changed timing/export metadata only -> semantic identity unchanged;
7. missing runtime preflight -> not PASS;
8. WebGPU request fulfilled by WASM fallback -> explicitly marked as fallback;
9. independent reload of exported evidence -> verification result reproducible;
10. retry with same logical run ID -> no silent duplicate logical run.

No backend is required for this experiment.
