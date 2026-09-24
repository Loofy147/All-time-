"use client";

import { useMemo, useState } from "react";
import { pipeline } from "@huggingface/transformers";
import { MODELS, type RuntimeMode } from "@/lib/models";

type TextGenerator = (text: string, options?: Record<string, unknown>) => Promise<unknown>;

type MetricState = {
  loadMs?: number;
  generationMs?: number;
  chars?: number;
};

const generatorCache = new Map<string, Promise<TextGenerator>>();

function getGenerator(
  modelId: string,
  revision: string,
  runtime: RuntimeMode,
  dtype: "q4" | "q4f16",
  onProgress: (status: string) => void,
) {
  const cacheKey = `${modelId}@${revision}:${runtime}:${dtype}`;
  const cached = generatorCache.get(cacheKey);
  if (cached) return cached;

  const promise = pipeline("text-generation", modelId, {
    revision,
    device: runtime,
    dtype,
    progress_callback: (event: { status?: string; progress?: number }) => {
      if (event.status === "progress_total" && typeof event.progress === "number") {
        onProgress(`Loading model… ${Math.round(event.progress)}%`);
      } else if (event.status) {
        onProgress(event.status);
      }
    },
  } as never);

  const typedPromise = promise as Promise<TextGenerator>;
  generatorCache.set(cacheKey, typedPromise);
  void typedPromise.catch(() => generatorCache.delete(cacheKey));
  return typedPromise;
}

export default function ModelLab() {
  const model = MODELS[0];
  const [runtime, setRuntime] = useState<RuntimeMode>("webgpu");
  const [prompt, setPrompt] = useState(
    "Explain what you can do in one short paragraph.",
  );
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricState>({});

  const webGpuSupported = useMemo(
    () => typeof navigator !== "undefined" && "gpu" in navigator,
    [],
  );

  async function run() {
    if (loading) return;

    setLoading(true);
    setOutput("");
    setMetrics({});
    setStatus("Preparing model…");

    const started = performance.now();

    try {
      const dtype = model.dtype[runtime];
      const generator = await getGenerator(
        model.id,
        model.revision,
        runtime,
        dtype,
        setStatus,
      );

      const loadedMs = performance.now() - started;
      setStatus("Generating…");

      const generationStarted = performance.now();
      const result = await generator(prompt, {
        max_new_tokens: 96,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false,
      } as never);

      const generationMs = performance.now() - generationStarted;
      const text =
        Array.isArray(result) && result[0] && typeof result[0] === "object"
          ? String(
              (result[0] as { generated_text?: unknown }).generated_text ?? "",
            )
          : String(result ?? "");

      setOutput(text.trim());
      setMetrics({
        loadMs: loadedMs,
        generationMs,
        chars: text.trim().length,
      });
      setStatus("Complete");
    } catch (error) {
      console.error(error);
      setStatus("Failed");
      setOutput(
        error instanceof Error ? error.message : "Unknown runtime error.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <div className="eyebrow">All-time / model lab</div>
      <h1>AI that can start tiny.</h1>
      <p className="lead">
        Browser-first inference with a model/runtime boundary we can benchmark
        and replace independently.
      </p>

      <section className="panel">
        <div className="row">
          <span className="badge">{model.label}</span>
          <span className="badge">{model.parameters} parameters</span>
          <span className="badge">{model.dtype[runtime]}</span>
          <span className="badge">
            ~{model.artifactMb[model.dtype[runtime]]} MB model artifact
          </span>
          <span className="badge">
            WebGPU {webGpuSupported ? "available" : "not detected"}
          </span>
          <span className="badge">{runtime}</span>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button
            className={runtime === "webgpu" ? "primary" : ""}
            onClick={() => setRuntime("webgpu")}
            disabled={!webGpuSupported || loading}
          >
            WebGPU
          </button>
          <button
            className={runtime === "wasm" ? "primary" : ""}
            onClick={() => setRuntime("wasm")}
            disabled={loading}
          >
            WASM / CPU
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={loading}
          aria-label="Prompt"
        />

        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="primary"
            onClick={run}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Running…" : "Run locally"}
          </button>
          <span className="small">{status}</span>
        </div>

        <div className="output">
          {output || "Model output will appear here."}
        </div>

        <div className="meta">
          <div className="metric">
            <span className="small">Model/runtime load</span>
            <strong>
              {metrics.loadMs ? `${Math.round(metrics.loadMs)} ms` : "—"}
            </strong>
          </div>
          <div className="metric">
            <span className="small">Generation</span>
            <strong>
              {metrics.generationMs
                ? `${Math.round(metrics.generationMs)} ms`
                : "—"}
            </strong>
          </div>
          <div className="metric">
            <span className="small">Output</span>
            <strong>{metrics.chars ?? "—"} chars</strong>
          </div>
        </div>

        <p className="small" style={{ marginTop: 16 }}>
          Model revision: {model.revision}. WebGPU uses q4f16; WASM uses q4.
          The model is loaded client-side.
        </p>
      </section>
    </main>
  );
}
