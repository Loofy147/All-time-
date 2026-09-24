# All-time-

Browser-first local AI workspace for compact open models.

## Status

The repository is in a verification-and-research pause. The current implementation is intentionally small:

- Next.js + React
- Transformers.js browser inference
- WebGPU with runtime adapter detection
- WASM/CPU fallback
- pinned Hugging Face ONNX revisions
- installable PWA shell
- Supabase provisioned but not yet modeled for product data

## Architecture

See [docs/PROJECT_STATE.md](./docs/PROJECT_STATE.md) for the current source-of-truth architecture and boundaries.

## Verification

See [docs/VERIFICATION.md](./docs/VERIFICATION.md) for established evidence, experiments, corrections, and open claims.

The latest known READY Vercel deployment containing the PWA/static-icon architecture is commit `c3fbff3a0f88c385df04d29cba511ccb529e933a`.

The current `main` branch contains additional cleanup after that deployment, so final production verification of current HEAD remains open.

## Models

| Model | HF revision | WebGPU | WASM |
|---|---|---|---|
| SmolLM2 135M Instruct | `5b6682c7c9df18f004bfb7e635cba3f3d98537d8` | q4f16 / ~118 MB | q4 / ~182 MB |
| Qwen2.5 0.5B Instruct | `516c8d04add8a80c5228f32102b57953b8d421a9` | q4f16 / ~483 MB | q4 / ~786 MB |

## Local development

Requires Node.js compatible with the pinned project toolchain.

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Pause condition

No new product features, database schema, or model expansion should be added until the planned repository research pass is completed and converted into evidence-backed changes.

## References

- Transformers.js: https://huggingface.co/docs/transformers.js
- WebGPU guide: https://huggingface.co/docs/transformers.js/guides/webgpu
- Pipelines: https://huggingface.co/docs/transformers.js/pipelines
- Next.js: https://nextjs.org/docs
