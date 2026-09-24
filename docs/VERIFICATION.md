# Verification Ledger

Date: 2026-09-24

## Established

- GitHub repository: `Loofy147/All-time-`
- Default branch: `main`
- Vercel project: `all-time-`
- Latest production commit: `69d7e072b3068d81ab021289090e534130bf2ef5`
- Latest production deployment: READY
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

## Open

### Browser inference

The production UI is rendered and HTTP-accessible, but end-to-end model execution has not yet been independently reproduced by an automated browser run. One automated interaction attempt timed out during model loading; subsequent interaction attempts were blocked by the browser-session concurrency limit.

This is not evidence that inference is broken. It is also not evidence that inference works. Status remains OPEN.

### Performance

No latency, throughput, memory, or first-load measurements have been established on a controlled device.

### Capability

No comparative quality evaluation has been established between SmolLM2 135M and Qwen2.5 0.5B.

## Evidence policy

Build success is evidence for build correctness only. It is not evidence for browser inference correctness or model quality.