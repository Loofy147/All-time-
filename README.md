# All-time-

Browser-first experiments with compact open models.

## Current baseline

- Next.js `16.3.5`
- React `19.2.0`
- Transformers.js `4.3.0`
- Hugging Face ONNX Community models
- Browser-side inference
- WebGPU when supported
- WASM/CPU fallback
- No server-side inference API in the baseline

The current model registry contains two reproducible candidates:

| Model | HF revision | WebGPU | WASM |
|---|---|---|---|
| SmolLM2 135M Instruct | `5b6682c7c9df18f004bfb7e635cba3f3d98537d8` | q4f16 / ~118 MB | q4 / ~182 MB |
| Qwen2.5 0.5B Instruct | `516c8d04add8a80c5228f32102b57953b8d421a9` | q4f16 / ~483 MB | q4 / ~786 MB |

The revisions and artifact sizes are taken from the corresponding Hugging Face ONNX repositories.

## Deployment

GitHub repository: `Loofy147/All-time-`

Vercel project: `all-time-`

Current verified production deployment:

- commit: `69d7e072b3068d81ab021289090e534130bf2ef5`
- state: READY
- alias: `https://all-time-ashen.vercel.app`

The production page has been fetched successfully with HTTP 200.

## Database

Supabase project: `All-time-`

- status: ACTIVE_HEALTHY
- region: eu-west-1
- PostgreSQL 17
- application tables: none yet
- security advisor: 0 findings
- performance advisor: 0 findings

The database is intentionally not modeled until the product behavior is defined.

## Important deployment history

Deployment `dpl_626118GcQPGrndTQCxU5obSZMQ4F` failed at the Vercel build step with:

`lint_or_type_error`

The failing commit was `ed09df679dadcb10c492c9a477690d4b0b9e4990`.

Subsequent fixes restored successful production deployment. The current production deployment is `69d7e072…`.

## Verification state

Established:

1. GitHub source exists and is writable.
2. Vercel Git integration works.
3. The latest production build reaches READY.
4. The deployed page returns HTTP 200.
5. Model repository revisions exist on Hugging Face.
6. Required ONNX quantized artifacts exist.
7. Supabase is healthy and has no current security/performance advisor findings.

Open:

- Actual browser-side model loading and generation has not yet been independently verified in an automated browser session. This remains OPEN rather than inferred from build success.
- Performance and quality measurements for the two models are not yet established.

## Local development

Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

## Architecture rule

Keep product logic independent of any single model. Model choice, model revision, runtime, and dtype stay behind the model registry.

## Sources

- Transformers.js v4: https://huggingface.co/blog/transformersjs-v4
- Pipeline API: https://huggingface.co/docs/transformers.js/pipelines
- Quantized dtypes: https://huggingface.co/docs/transformers.js/guides/dtypes
- WebGPU: https://huggingface.co/docs/transformers.js/guides/webgpu
- SmolLM2 ONNX: https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA
- Qwen2.5 0.5B ONNX: https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct
- Next.js: https://nextjs.org/docs