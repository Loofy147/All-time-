# All-time-

Browser-first experiments with compact open models.

## Baseline

The first implementation is intentionally narrow:

- Next.js 16.3
- Transformers.js 4.x
- Hugging Face ONNX Community
- Client-side WebGPU when available
- WASM/CPU fallback
- No inference API required for the baseline

The initial verified model is:

- `onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`

Its Hugging Face model card documents direct Transformers.js usage and the ONNX repository contains quantized artifacts, including `q4f16`.

## Local development

Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Verification order

1. Confirm the page builds.
2. Confirm WebGPU capability detection.
3. Load the 135M model in WebGPU.
4. Repeat in WASM/CPU.
5. Capture load and generation latency.
6. Add the next model only after the baseline is reproducible.

## Architecture rule

The application must keep model selection behind the `ModelDefinition` registry. Product logic must not depend directly on one model.

## Sources

- Transformers.js v4 announcement: https://huggingface.co/blog/transformersjs-v4
- WebGPU guide: https://huggingface.co/docs/transformers.js/guides/webgpu
- SmolLM2 ONNX model: https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA
- Next.js: https://nextjs.org/docs
