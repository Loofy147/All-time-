# Diverse Repository Review — 2026-09-24

## Purpose

This round intentionally examines repository families not centered on the previous evidence-ledger/orchestrator cluster.

Target capability domains:

- CI/CD and build provenance
- operational reliability and resource budgets
- security self-testing
- static-vs-live capability separation
- privacy/telemetry boundary
- resilience state
- deterministic state machines
- negative evidence from incomplete repositories

Reviewed repositories:

1. `Loofy147/Workflows--ci-cd`
2. `Loofy147/CloudCostGuard`
3. `Loofy147/meta-secure-framework`
4. `Loofy147/Discovery-engine-`
5. `Loofy147/device-activity-tracker`
6. `Loofy147/Leak-detecteur`
7. `Loofy147/TML-Virtual-Machine`
8. `Loofy147/Residual-Opportunity-Scanner`

The review uses repository source first, then observed workflow history where available. Mechanism existence and current operational correctness are kept separate.

---

## 1. Workflows--ci-cd

### Observed mechanisms

The repository contains concrete GitHub Actions examples for:

- complexity analysis;
- MLOps inference;
- MLOps training;
- SLSA build provenance.

The complexity checker turns Lizard/Radon output into an explicit pass/fail gate.

The SLSA workflow builds a release artifact and generates provenance metadata.

The repository has 13 observed GitHub Actions runs. One inspected run succeeded, but it was a Dependabot graph-update workflow on a 2025 commit; this does not independently establish successful execution of the current SLSA or complexity workflows.

### Epistemic status

- workflow source: **ESTABLISHED**
- current SLSA workflow operational success: **UNKNOWN**
- historical GitHub Actions activity: **EXPERIMENTALLY_SUPPORTED for the inspected historical run**

### Transfer to All-time

**INFERENCE / HIGH**

Two mechanisms are relevant:

1. **Build provenance**
   Bind a production artifact to the repository revision and build event.

2. **Objective quality gates**
   Make thresholds executable and machine-checked rather than documentary.

For All-time, this suggests a future build evidence record:

`source_revision + dependency_lock_hash + build_environment + deployment_id`

This is different from browser inference evidence and should remain a separate layer.

---

## 2. CloudCostGuard

### Observed mechanisms

CloudCostGuard has a much broader operational surface than All-time and documents:

- unit tests;
- real PostgreSQL integration tests;
- end-to-end tests with a composed stack;
- load tests;
- liveness/readiness endpoints;
- structured request IDs/logging;
- resource requests/limits;
- incident response;
- disaster recovery;
- operational runbook;
- explicit limitations and known blind spots.

The `LIMITATIONS.md` document is particularly useful: the repository explicitly records what its estimator does not know and prevents those omissions from becoming invisible claims.

The repository has a substantial GitHub Actions history; an observed run on September 18, 2026 succeeded, but that run was a Dependabot update workflow and therefore is not evidence that every current application test gate passed.

### Important contradiction

`ccg_audit.txt` presents authentication/rate limiting and several operational issues as already resolved.

`SECURITY.md` simultaneously states that the backend API is designed for a trusted private network and does not implement authentication or rate limiting.

This is a source-level documentation contradiction. It must not be resolved by choosing the more favorable document.

### Epistemic status

- multi-layer test design: **ESTABLISHED**
- runbook/health/resource patterns: **ESTABLISHED**
- current production behavior of those mechanisms: **UNKNOWN**
- internal auth-status documentation: **CONTRADICTED**

### Transfer to All-time

**INFERENCE / HIGH**

All-time needs a small version of the same separation:

`Smoke`
→ `Browser acceptance`
→ `Fallback acceptance`
→ `Stress/resource acceptance`
→ `Deployment acceptance`

and a maintained limitations ledger.

A specific improvement is to make known unknowns first-class rather than placing them only in prose.

---

## 3. meta-secure-framework

### Observed mechanisms

SACEF has a self-attack path intended to test the security framework itself.

The test `test_self_attack.py` injects a mocked failure into the symbolic explorer and checks that the framework detects it as a meta-vulnerability.

The reporter emits structured counts including:

- number of analyzed functions;
- number of vulnerabilities;
- total duration;
- detailed results.

### Epistemic status

- self-test mechanism exists: **ESTABLISHED**
- demonstrated test behavior: **EXPERIMENTALLY_SUPPORTED / repository test**
- real-world self-hardening effectiveness: **UNKNOWN**
- current workflow recency: limited; observed workflow history is old relative to the current date

### Transfer to All-time

**INFERENCE / MEDIUM-HIGH**

After the evidence verifier exists, test the verifier itself.

Examples of verifier mutations to kill:

- accept missing runtime evidence;
- ignore model revision;
- ignore fallback state;
- accept non-deterministic configuration;
- drop output identity;
- convert `UNKNOWN` to `PASS`.

This is stronger than merely adding more ordinary tests because it measures whether the acceptance logic can be weakened without detection.

---

## 4. Discovery-engine-

### Observed mechanism

The repository distinguishes a fixed machine substrate from online execution and explicitly moves expensive discovery work into offline precomputation.

The model separates:

- static transition/materialized relation data;
- online runtime lookup;
- cost model;
- reverse-index access.

### Epistemic status

**ESTABLISHED at source/design level**

The mathematical performance claims in the README are not independently benchmarked here.

### Transfer to All-time

**INFERENCE / HIGH**

This maps cleanly onto an overlooked boundary:

### Static capability contract

Known before execution:

- model ID;
- revision;
- supported runtime/dtype;
- artifact estimate;
- generation configuration constraints.

### Live runtime observation

Known only at execution:

- adapter availability;
- actual runtime;
- fallback;
- browser conditions;
- load result;
- resource outcome.

This prevents the static model registry from being mistaken for proof that a runtime capability was actually exercised.

---

## 5. device-activity-tracker

### Observed security lesson

The repository is a security research PoC showing that timing/RTT measurements can expose information about device state and user activity.

This is not an All-time implementation candidate. It is a privacy-boundary reference.

### Epistemic status

- timing-based side-channel concept: **ESTABLISHED as documented security research**
- current exploitability across present app versions: **not independently established here**

### Transfer to All-time

**INFERENCE / MEDIUM**

Performance telemetry is not always neutral metadata.

All-time currently records and exports:

- load time;
- generation time;
- cache state;
- runtime;
- output size.

Because the app is local-first, the immediate risk is limited, but exported evidence should avoid unnecessary device fingerprinting and should distinguish:

- technical diagnostic fields;
- user content;
- potentially identifying environment fields.

This reinforces the need for an explicit evidence privacy policy.

---

## 6. Leak-detecteur

### Observed mechanisms

The repository provides:

- request validation middleware;
- rate limiting;
- persistent circuit breaker state;
- error handling/fallback modules.

### Source-level caution

The persistent circuit breaker performs read-then-update state transitions through Supabase without an obvious compare-and-swap/version check in the inspected file.

This creates a **possible lost-update/concurrency weakness** under concurrent callers.

No concurrency experiment was run, so this remains:

**HYPOTHESIS / OPEN**

The rate limiter also derives an identifier from request headers including `x-forwarded-for`; such headers are only trustworthy when the network boundary is configured to establish them.

### Transfer to All-time

**INFERENCE / MEDIUM**

Do not import the circuit breaker.

The useful lesson is that resilience state must have an explicit concurrency contract.

For future backend use:

- atomic state transition;
- version/attempt field;
- trusted proxy boundary;
- explicit failure categories.

For current browser-only inference, this can remain local and does not justify backend persistence.

---

## 7. TML-Virtual-Machine

### Observed mechanisms

Despite minimal repository documentation, the test suite contains explicit deterministic invariants:

- repeated basis-vector generation for the same input is checked for exact equality;
- state transitions are checked against expected traces;
- invalid transitions are rejected;
- trace length and values are asserted;
- import/export of deterministic seed state is tested.

### Epistemic status

- deterministic fixture patterns: **ESTABLISHED at source/test level**
- current CI/operational status: **UNKNOWN**; no observed GitHub Actions runs

### Transfer to All-time

**INFERENCE / MEDIUM**

The same-test replay requirement should be stronger than "generated text exists".

For one fixed evidence fixture:

`same binding + same input + same deterministic config`

should yield a reproducible material/semantic evidence projection.

This supports P1/P2 without requiring the model outputs themselves to be globally byte-identical across every device.

---

## 8. Residual-Opportunity-Scanner

The repository currently contains only a minimal README with no substantive implementation evidence.

### Epistemic status

**UNKNOWN / NO MATERIAL EVIDENCE FOUND IN CURRENT DEFAULT-BRANCH SURFACE**

### Transfer decision

**NO TRANSFER**

This is intentionally recorded as a non-finding rather than inferred into a capability.

---

# Cross-round synthesis

This diverse pass adds four new architectural concepts to the existing evidence contract.

## New mechanism M5 — Build provenance

Separate:

`source/build/deploy identity`

from:

`browser execution identity`

A production deployment can be structurally valid without proving browser inference correctness.

## New mechanism M6 — Explicit limitations registry

Unknowns and blind spots should be structured and durable.

They must not disappear into prose.

## New mechanism M7 — Verifier adversarial testing

Test whether the acceptance mechanism itself survives deliberate weakening.

## New mechanism M8 — Static capability vs live capability

The registry says what a model/runtime configuration is supposed to support.

The live run records what the browser actually exercised.

These must remain separate evidence layers.

---

# Updated All-time evidence model

The combined repository research now supports this layered model:

`SOURCE`
→ `BUILD PROVENANCE`
→ `STATIC CAPABILITY CONTRACT`
→ `RUNTIME PREFLIGHT`
→ `EXECUTION`
→ `OBSERVATION`
→ `EVIDENCE`
→ `VERIFICATION`
→ `ACCEPTANCE`
→ `HISTORY`

Optional sidecars:

- `LIMITATIONS / OPEN CLAIMS`
- `CONTRADICTIONS`
- `RESOURCE TELEMETRY`
- `PRIVACY CLASSIFICATION`

Authorization remains outside this chain.

---

# New gaps revealed by this pass

### G9 — Build provenance is missing

Current All-time can identify source revision and Vercel deployment, but there is no repository-owned provenance artifact tying:

source revision → dependency state → build → deployment

into one machine-readable record.

### G10 — No explicit limitations registry

Current open claims live in Markdown sections.

They are durable, but not machine-addressable or lifecycle-managed.

### G11 — No adversarial acceptance tests

There is no current test suite that deliberately weakens the verifier and expects detection.

### G12 — Static capability and live capability are conceptually mixed

`lib/models.ts` contains static capability metadata, while `model-lab.tsx` discovers actual runtime capability.

The current UI keeps them adjacent but does not produce a formal binding between them.

### G13 — Privacy classification for evidence is missing

The system does not distinguish diagnostics from user content or potentially identifying environment information in exported evidence.

### G14 — Concurrency contract is not defined

Current browser state is single-user/local, but future persistence would require an explicit concurrency/attempt model. Importing a backend state machine without such a contract would be unsafe.

---

# Rejected transfers

- generic SLSA pipeline import into browser runtime;
- CloudCostGuard-style backend operational stack;
- security self-attack engine as a runtime feature;
- persistent circuit breaker;
- device-activity tracking logic;
- TML virtual-machine architecture;
- new database activation.

The useful parts are contracts and test patterns, not whole systems.

# Next admissible research/implementation boundary

Before feature expansion:

1. dependency/security baseline;
2. build provenance fixture;
3. static-vs-live capability contract;
4. browser evidence contract P1-P4;
5. explicit limitations/OPEN claim registry;
6. adversarial verifier tests;
7. resource/privacy evidence policy.

No backend is required for 1–6.

