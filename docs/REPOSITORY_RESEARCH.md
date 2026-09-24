# Repository Research Ledger

Date: 2026-09-24

## Scope

This research pass compares the current `Loofy147/All-time-` implementation against selected repositories owned by the same GitHub account.

Target project:

- Repository: `Loofy147/All-time-`
- Branch: `main`
- Research target: mechanisms that can materially improve browser-local inference, measurement, verification, reliability, and future persistence.
- Product feature work remains paused. This document records research evidence only.

The comparison is mechanism-first, not project-first. A repository is not treated as authoritative merely because its README claims a capability.

## Epistemic states used in this ledger

- ESTABLISHED: directly verified in repository source.
- EXPERIMENTALLY_SUPPORTED: verified by an actual run or artifact.
- USER_REPORTED: not used for repository claims in this document.
- INFERENCE: reasoned transferability from verified source behavior.
- HYPOTHESIS: proposed mechanism requiring an experiment.
- CONTRADICTED: repository source contains evidence against a stated implementation claim.
- UNKNOWN/OPEN: insufficient evidence.

## Target baseline: All-time

Verified source files:

- `package.json`
- `lib/models.ts`
- `components/model-lab.tsx`
- `components/pwa-runtime.tsx`
- `public/sw.js`
- `docs/VERIFICATION.md`

Current established mechanisms:

1. Transformers.js 4.3.0 in the browser.
2. Two pinned Hugging Face model revisions.
3. Explicit WebGPU/WASM runtime modes.
4. WebGPU capability check through `navigator.gpu.requestAdapter()`.
5. WebGPU -> WASM fallback after an initialization failure.
6. Promise-based generator cache keyed by model, revision, runtime, and dtype.
7. Failed initialization promises are removed from the cache.
8. Deterministic decoding with `do_sample=false`.
9. Successful-run measurements: load time, generation time, output size, runtime, dtype, and cold/warm cache state.
10. Local session persistence of prompt and a bounded measurement history.
11. JSON export of measurements.
12. PWA shell caching deliberately excludes model artifacts.

The current project does not yet have:

- a formal preflight/acceptance gate;
- a structured benchmark/test-set definition;
- per-run evidence snapshots for browser/runtime/model context;
- a persistent regression/finding ledger;
- controlled Arabic/English quality evaluation;
- device-independent performance evidence;
- product schema or validated persistence requirements.

## Repository findings

### 1. Ai-evaluation-system

Repository: `Loofy147/Ai-evaluation-system`  
Verified commit: `2621952e3cc0aa2838ee66985e5ff7afbae7ee67`

Relevant source:

- `experiments/real_gil/run_real_gil_experiment.py`
- `experiments/real_gil/run_phase_a_batch.py`
- `.github/workflows/real-gil.yml`

### ESTABLISHED mechanism

The experiment explicitly captures:

- runtime preflight and postflight snapshots;
- implementation/version/platform;
- whether free-threading is actually enabled;
- module identity and path;
- module SHA-256 where available;
- ordered events with monotonic timestamps;
- captured stdout/stderr;
- explicit status and failure codes;
- causal attribution;
- evidence-chain completeness;
- deterministic batch acceptance criteria.

The environment gate is fail-closed for an unavailable required runtime:

`ENVIRONMENT_NOT_READY` + `FREE_THREADED_RUNTIME_UNAVAILABLE`

The batch then evaluates control and treatment conditions and records acceptance.

### Transferability to All-time

INFERENCE / HIGH VALUE.

The important mechanism is not the GIL experiment itself. It is the structure:

`preflight -> run -> postflight -> deterministic acceptance -> artifact`

For All-time this maps naturally to:

`browser/runtime preflight -> model run -> postflight -> acceptance -> evidence record`

A proposed All-time preflight record should include at minimum:

- browser user-agent/version;
- WebGPU API presence;
- adapter acquisition success/failure;
- selected runtime and dtype;
- model ID and pinned revision;
- network state;
- storage availability estimate when supported;
- timestamp and test case ID.

### CONTRADICTED implementation detail

The current workflow validates `data['metrics'].*`, while `run_phase_a_batch.py` writes those metrics at the top level of the summary object.

Therefore the repository demonstrates a strong experimental pattern but also contains a schema mismatch between producer and validator.

Conclusion:

- Mechanism: INFERENCE / transferable.
- Exact repository implementation quality: CONTRADICTED in this path.
- Do not copy the workflow verbatim.

---

### 2. Global-redteam

Repository: `Loofy147/Global-redteam`  
Verified commit: `9cca0b01e1440f749451a682ea9aa9433ba69f37`

Relevant source:

- `src/redteam/core/finding.py`
- `src/redteam/storage/database.py`
- `src/redteam/reporters/reporting.py`
- `src/redteam/core/orchestrator.py`

### ESTABLISHED mechanism

Findings have a deterministic identity hash based on finding content/location.

The database stores:

- finding hash;
- evidence;
- remediation;
- status;
- first seen;
- last seen;
- regression flag.

Repeated observation can therefore distinguish:

- new;
- ongoing/open;
- regression after closure.

The database also supports historical trend queries and evidence records.

### Transferability to All-time

INFERENCE / HIGH VALUE.

All-time can later treat runtime observations as typed findings, for example:

- WebGPU unavailable;
- WebGPU initialization failure;
- model artifact load failure;
- generation failure;
- abnormal latency;
- unexpected fallback;
- cache inconsistency.

A stable finding identity should be based on invariant dimensions, not a timestamp. Example conceptual identity:

`model_revision + runtime + dtype + failure_code + environment_class`

Then observations can accumulate over time without losing history.

### Important limitation

The repository contains version/integration inconsistencies between the minimal `Finding` dataclass inspected and fields expected by the reporting code.

Conclusion:

- Historical finding/identity pattern: ESTABLISHED.
- Whole reporting architecture: not suitable for direct copying.
- Transfer only the small deterministic identity + first/last-seen + evidence pattern.

---

### 3. ACE-Agentic-Context-Engineering

Repository: `Loofy147/ACE-Agentic-Context-Engineering`  
Verified commit: `8f836bb0d34bab7d663f8f2fa117b404ce9c2ce2`

Relevant source:

- `ace/core/models.py`
- `ace/core/curator.py`
- `ace/core/reflector.py`
- `ace/similarity.py`
- `ace/self_healing.py`

### ESTABLISHED mechanism

The Curator performs two checks before adding a new insight:

1. exact content existence;
2. semantic similarity using embeddings and a configurable cosine threshold.

It also serializes curation with an async lock.

This is a concrete anti-duplication mechanism.

### Transferability

INFERENCE / MEDIUM VALUE, future-facing.

It could later prevent duplicate capability/finding/evidence entries when the same underlying event is observed through different paths.

It is not currently required by All-time because the product does not yet have a semantic memory or knowledge store.

### CONTRADICTED / rejected mechanism

The SelfHealing component permits an LLM to rewrite stored playbook entries based on its own review, without an independent evidence requirement.

That does not meet the current All-time verification contract. A language model must not silently upgrade, correct, or rewrite a factual record solely because another generation says it is wrong.

Therefore:

- semantic deduplication: candidate.
- autonomous LLM truth rewriting: rejected for the current verification model.

---

### 4. Unified-ai

Repository: `Loofy147/Unified-ai`  
Verified commit: `4e31310b6e105ba3f1e80d3fcd39171060c54e1a`

Relevant source:

- `intelligence/memory/memory_store.py`
- `core/knowledge_graph/kg_system.py`
- `core/resources/resource_manager.py`
- `tests/test_adversarial.py`

### ESTABLISHED mechanisms

The repository contains concrete implementations for:

- bounded short-term memory;
- long-term consolidation;
- episodic memory;
- semantic memory;
- access counters;
- outcome/performance history;
- knowledge-graph entities and relationships;
- resource allocation with locking;
- resource monitoring and allocation history;
- adversarial testing against the larger system.

### Limitations visible in source

Several mechanisms are heuristic or incomplete.

Examples:

- memory importance uses a fixed scoring rule and explicitly leaves novelty unimplemented;
- the ResourceManager hardcodes GPU capacity to one device;
- several systems remain local/in-process rather than durable;
- the README claims more integration than some source paths demonstrate.

### Transferability

INFERENCE / LOW-to-MEDIUM now, potentially HIGH later.

The useful lesson for All-time is decomposition:

`observation -> outcome -> history -> derived statistics`

not wholesale adoption of the current architecture.

For the browser app, the immediate analogue is:

`run -> measurement -> evidence record -> aggregate statistics`

The knowledge graph should not be added merely because the repository has one.

---

### 5. Guardian-Ai

Repository: `Loofy147/Guardian-Ai`  
Verified commit: `08e17e67c02bc4051bb4511fb187bb0187dba6f1`

Relevant source:

- `main.py`

### ESTABLISHED mechanism

A prediction is persisted with:

- predicted value;
- uncertainty;
- trust level;

and a later outcome is recorded against the decision. The system can then calculate historical performance metrics.

This establishes a useful provenance pattern:

`prediction -> decision -> actual outcome -> performance`

### Transferability

INFERENCE / MEDIUM VALUE.

For All-time, the analogous structure is:

`runtime claim -> execution -> observed result -> measured outcome`

For example, "WebGPU path was selected" should be tied to actual adapter acquisition and actual successful inference, not to a UI label alone.

The domain-specific worst-case guarantee is not transferable to arbitrary text generation.

---

### 6. Personal-ai-system

Repository: `Loofy147/Personal-ai-system`  
Verified commit: `3bf15ec0e6843489439c4dce8a378740abdd1131`

Relevant source:

- `ai_system/learning/history_manager.py`
- `tests/test_history_manager.py`

### ESTABLISHED mechanism

The repository has a dedicated history manager with bounded conversation history and tests for the manager.

### Transferability

INFERENCE / LOW VALUE at present.

All-time already has local prompt persistence and bounded measurement history. A Redis-backed conversation store is unnecessary until a product requirement establishes multi-session or multi-device continuity.

---

### 7. Leak-detecteur

Repository: `Loofy147/Leak-detecteur`  
Verified commit: `325e02f47ea317b2e38937696e5c384748b395d7`

README describes circuit breakers, rate limiting, and validation. However, the production checklist inspected marks those controls as not yet verified.

### Epistemic result

UNKNOWN/OPEN or CONTRADICTED for implementation claims.

The repository cannot be used as strong evidence that these mechanisms are production-verified.

### Transferability

Do not import from this repository based on the README alone. Re-inspect concrete implementation and tests only if a later All-time requirement needs the mechanism.

---

### 8. ai-meta-orchestrator

Repository: `Loofy147/ai-meta-orchestrator`

The inspected README is primarily a generic Flask/Docker scaffold and does not provide enough evidence for a materially new All-time mechanism.

### Epistemic result

UNKNOWN/OPEN for meaningful transferable capability.

No implementation should be justified from this repository in the current pass.

## Cross-repository synthesis

The strongest transferable pattern is not a single feature. It is a verification loop:

`PRECONDITION -> OBSERVATION -> OUTCOME -> DECISION -> RECORD -> REPEAT`

The repositories independently reinforce several parts of this loop:

- Ai-evaluation-system: explicit preconditions + fail-closed environment gate + deterministic acceptance.
- Global-redteam: stable finding identity + first/last-seen history + regression detection.
- Guardian-Ai: prediction/outcome provenance.
- ACE: duplicate control through semantic identity.
- Unified-ai: bounded history + performance observation.

The weak pattern across several repositories is equally important:

- large architectural claims are often ahead of the concrete implementation;
- heuristic mechanisms are described as more general than their code supports;
- self-healing can become uncontrolled self-editing;
- cross-file schemas can drift.

Therefore repository quality must be assessed independently from mechanism quality.

## What should be tested next in All-time

No product feature is justified yet.

The next research/verification artifact should be a small deterministic browser evaluation harness with four layers:

### Layer A — Preflight

Record:

- browser/runtime identity;
- WebGPU availability and adapter acquisition;
- selected runtime/dtype;
- model ID/revision;
- network state;
- storage estimate when available.

### Layer B — Controlled run

Use a fixed prompt suite and fixed generation settings.

At minimum:

- same prompt;
- same model revision;
- same runtime/dtype;
- deterministic decoding;
- repeated runs for cold/warm comparison.

### Layer C — Postflight

Record:

- load time;
- generation time;
- output length;
- successful/failed state;
- actual runtime after fallback;
- error code;
- cache state;
- evidence completeness.

### Layer D — Acceptance

Produce deterministic states such as:

- PASS;
- ENVIRONMENT_NOT_READY;
- RUNTIME_UNAVAILABLE;
- MODEL_LOAD_FAILED;
- GENERATION_FAILED;
- FALLBACK_USED;
- ACCEPTED_BENCHMARK;
- INCONCLUSIVE.

The acceptance result must be derived from recorded evidence, not from a human-readable UI label.

## Current research decision

ESTABLISHED:

- There are several concrete mechanisms in the owned repositories worth reusing as design patterns.

INFERENCE:

- The highest-value immediate addition to All-time is verification/evidence infrastructure, not more models, memory systems, or backend architecture.

REJECTED FOR NOW:

- autonomous LLM self-healing of factual records;
- importing a full knowledge graph;
- adding Redis/Supabase persistence without a validated requirement;
- copying large orchestrator architectures from repositories whose implementation claims exceed their verified source.

HYPOTHESIS:

A small browser-native evidence ledger plus deterministic acceptance harness can close a larger fraction of the current verification gap than adding another model or another orchestration layer.

## External corroboration

Transformers.js 4.3.0 currently documents browser storage/cache behavior and improved WebGPU/storage support. Browser model caching uses the Cache API by default, and the environment API exposes cache controls including WASM caching. WebGPU remains capability-dependent, so runtime detection and fallback remain appropriate.

Primary current references:

- Hugging Face Transformers.js v4.3.0 release: https://github.com/huggingface/transformers.js/releases
- Hugging Face Transformers.js environment API: https://huggingface.co/docs/transformers.js/api/env
- Hugging Face WebGPU guide: https://huggingface.co/docs/transformers.js/guides/webgpu

These references corroborate the direction of the current All-time architecture; they do not prove All-time compatibility or performance across devices.

## Pause boundary

The research pass is sufficient to justify a verification-harness experiment.

It is not sufficient to justify:

- new persistent application schema;
- new model families;
- semantic memory;
- autonomous self-healing;
- broad orchestration expansion.

Those remain OPEN until an explicit experiment produces evidence.
