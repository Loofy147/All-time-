# Verification Ledger

Date: 2026-09-24

## Established

- GitHub repository: `Loofy147/All-time-`
- Default branch: `main`
- Vercel project: `all-time-`
- Latest production commit before this measurement-harness change: `d11e29949f4055d9c8855d116444d76859adcd82`
- Latest verified production deployment at that point: READY
- Production alias: `https://all-time-ashen.vercel.app`
- Production HTTP fetch: 200 OK
- Supabase project: `All-time-`
- Supabase status: ACTIVE_HEALTHY
- Supabase security advisor: 0 findings
- Supabase performance advisor: 0 findings
- SmolLM2 ONNX revision: verified on Hugging Face
- Qwen2.5 0.5B ONNX revision: verified on Hugging Face
- SmolLM2 q4/q4f16 artifacts exist
- Qwen2.5 q4/q4f16 artifacts exist

## Corrected

- Vercel build failure on commit `ed09df6…` was reported as `lint_or_type_error`; later code changes produced READY deployments.
- Next.js path alias was added to TypeScript configuration.
- Model pipeline typing was simplified after the failed build.
- Failed model initialization is removed from the in-memory pipeline cache.
- WebGPU and WASM dtypes are selected separately.

## Experimentally supported

### Browser inference

A user-run browser test successfully loaded and generated with the production app:

- Model/runtime load: `128333 ms`
- Generation: `11288 ms`
- Output: `265 chars`

Interpretation: this establishes at least one successful end-to-end browser inference run on the user's device/session. It does not establish general performance, because hardware, browser version, cache state, prompt, and runtime conditions are not yet controlled.

### Measurement harness

The model lab now records, per successful run:

- model and fixed revision
- runtime and dtype
- cold vs warm cache state
- model/runtime load time
- generation time
- output character count

Benchmark decoding is deterministic (`do_sample=false`) to reduce avoidable output variation across repeated runs.

## Open

### Performance

We still need controlled measurements for:

1. cold load vs warm load
2. WebGPU vs WASM on the same device
3. SmolLM2 135M vs Qwen2.5 0.5B
4. repeated generation latency

No general performance threshold is assumed yet.

### Capability

No comparative quality evaluation has been established between SmolLM2 135M and Qwen2.5 0.5B.

### Product behavior

No product-specific data model has been established. Supabase remains intentionally unused by the application until product behavior is defined.

## Evidence policy

Build success is evidence for build correctness only. A successful browser inference is evidence for runtime execution on that tested environment; it is not evidence for general browser compatibility, performance, or model quality.
