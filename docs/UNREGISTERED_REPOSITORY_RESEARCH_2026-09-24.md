# Unregistered Repository Research — 2026-09-24

## Census result

The Portfolio-Repository-Inventory snapshot dated 2026-09-22 records 339 repositories.
A fresh GitHub search for user:Loofy147 on 2026-09-24 returned pages 100, 100, 100, 42, 0 = 342 unique identities.
The three identities not present in the 2026-09-22 inventory snapshot are:
1. Loofy147/All-time-
2. Loofy147/Conversational
3. Loofy147/Open-System-One

The inventory now has a separate current delta record instead of rewriting the historical 2026-09-22 snapshot.

## Conversational

Main: f65be73b9f6b8ac0d91f8e80f0b4e3da44d2a0cd
Main CI run 36031821264: success.
Active hardening branch: hardening/frontier-v0.3.1 at b52622af86c0aa6ad32edfc0e7cc0e717e44b18b; latest observed verification workflow: failure. The hardening branch is not treated as main.

Verified mechanisms:
- immutable frontier revisions;
- append-only frontier events;
- deterministic event digests;
- deterministic state reduction;
- canonical semantic projection;
- stable canonicalization rules;
- manifest-based content identity;
- explicit restore states;
- deterministic projection policy;
- explicit separation of integrity from authenticity;
- explicit separation of restored context from action authorization;
- conflict blocking when expected parent revision does not match.

Revision-4 restore artifact reports revision chain PASS, event-log reduction PASS, semantic projection PASS, object-reference closure PASS, schema resolution PASS, policy resolution PASS, source binding resolution PASS_WITH_HISTORICAL_SOURCES, discovery PASS_WITH_REPO_HEAD, and external boundary NOT_RUN. Continuation permission is CONTEXT_ONLY and action authorization is SEPARATE_GATE_REQUIRED.

Relevance to All-time: INFERENCE / MEDIUM-HIGH.
The transferable pattern is immutable input/state events -> deterministic reduction -> derived projection -> independent verification -> explicit authorization boundary.

## Open-System-One

Main: 4c5f24f9d34f9f0fd751047ac8d0a6011855715b
Research frontier: recovery/v0.3-frontier at 24ee6b4a80995767954d0aedb2bae42e603154bb
Research-frontier CI run 36051706221: success. Main currently has no observed Actions runs.

Verified mechanisms on the research frontier:
- typed decision contract;
- deterministic decision composition;
- replaceable model/runtime backends;
- research/evidence layer;
- explicit WebGPU-preferred browser ONNX/WASM execution policy;
- runtime metadata reporting;
- explicit rule that model confidence does not become execution authority;
- finite probability validation;
- non-finite output rejection;
- calibration;
- split conformal set prediction;
- abstention metrics;
- candidate scoring and shortlist/rerank experiments;
- failure ledger preserving failed paths and their dispositions.

The browser runtime documentation describes an all-MiniLM-L6-v2-ONNX browser lab. Browser receipt JSON files are explicitly USER_REPORTED and CONVERSATION-ONLY, so they are not independent browser execution evidence in this review.

Relevance to All-time: INFERENCE / HIGH for evaluation architecture.
The strongest transferable pattern is separation of model/runtime execution from decision/evaluation policy. This supports a future All-time layer in which the generator produces output while an independent evaluator returns PASS, REVIEW, INCONCLUSIVE, or FAIL. Model confidence or UI status must not become authority.

The failure ledger is also directly relevant: environment failure must remain distinct from model failure.

## All-time

All-time is the current target implementation under the separate research track.
Current main research HEAD: 5f48aa1cc9c3b08679d743407e76d0a9b0bab32d.

## Cross-repository synthesis

The additional unregistered repositories strengthen the emerging architecture:
Execution -> Observation -> Evidence -> Verification -> Acceptance -> Immutable History -> Derived Projection

Authorization remains outside the inference/evidence layer.

## Current decisions for All-time

ESTABLISHED:
- the previous inventory snapshot was incomplete relative to the current GitHub search surface;
- exactly three repository identities were outside that snapshot on 2026-09-24;
- Conversational and Open-System-One contain concrete mechanisms relevant to the existing All-time verification gap.

EXPERIMENTALLY_SUPPORTED:
- Conversational main CI succeeded at its current main HEAD;
- Open-System-One recovery/v0.3-frontier CI succeeded at its recorded frontier HEAD;
- Open-System-One browser receipts exist but are explicitly user-reported, not independently verified.

INFERENCE:
- Conversational immutable reduction is a strong reference for future All-time measurement/state history;
- Open-System-One separation of runtime, evaluation, and authority is a strong reference for a future All-time evaluation layer.

OPEN:
- measurable value inside All-time;
- whether immutable event history is needed or deterministic evidence records suffice;
- whether a dedicated evaluation model is necessary.

REJECTED FOR NOW:
- importing the full Conversational protocol;
- importing Open-System-One decision machinery into the runtime;
- treating user-pasted browser receipts as independent evidence;
- expanding All-time into a general decision system.

## Next research boundary

The current repository-discovery gap is addressed for the connected GitHub search surface.
The next meaningful question is whether the strongest verified mechanisms from My_browser, Software-res, canonical-capability-core, Conversational, and Open-System-One can be reduced to one small browser-native evidence/verification layer for All-time without importing unrelated architecture.
This requires a bounded experiment.