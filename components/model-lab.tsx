"use client";

import { useMemo, useState } from "react";
import { pipeline } from "@huggingface/transformers";
import { MODELS, type ModelDefinition, type RuntimeMode } from "@/lib/models";

type TextGenerator = (
  input: string | Array<{ role: string; content: string }>,
  options?: Record<string, unknown>,
) => Promise<unknown>;

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
  } as never) as Promise<TextGenerator>;

  generatorCache.set(cacheKey, promise);
  void promise.catch(() => generatorCache.delete(cacheKey));
  return promise;
}

function extractGeneratedText(result: unknown): string {
  if (!Array.isArray(result) || result.length === 0) {
    return String(result ?? "");
  }

  const first = result[0] as { generated_text?: unknown };
  const generated = first?.generated_text;

  if (typeof generated === "string") return generated;

  if (Array.isArray(generated)) {
    const last = generated[generated.length - 1] as { content?: unknown } | string | undefined;
    if (typeof last === "string") return last;
    if (last && typeof last === "object" && "content" in last) {
      return String(last.content ?? "");
    }
  }

  return String(generated ?? "");
}

export default function ModelLab() {
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [runtime, setRuntime] = useState<RuntimeMode>("webgpu");
  const [prompt, setPrompt] = useState(
    "Explain what you can do in one short paragraph.",
  );
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricState>({});

  const model = useMemo<ModelDefinition>(
    () => MODELS.find((item) => item.id === modelId) ?? MODELS[0],
    [modelId],
  );

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
      const result = await generator(
        [{ role: "user", content: prompt }],
        {
          max_new_tokens: 96,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
        },
      );

      const generationMs = performance.now() - generationStarted;
      const text = extractGeneratedText(result).trim();

      setOutput(text);
      setMetrics({
        loadMs: loadedMs,
        generationMs,
        chars: text.length,
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
        Browser-first inference with a fixed model revision and a swappable
        runtime, so we can measure capability before committing to a product model.
      </p>

      <section className="panel">
        <div className="row">
          <label className="badge">
            Model{" "}
            <select
              value={modelId}
              onChange={(event) => {
                setModelId(event.target.value);
                setOutput("");
                setMetrics({});
                setStatus("Ready");
              }}
              disabled={loading}
              style={{
                marginLeft: 8,
                background: "transparent",
                color: "inherit",
                border: 0,
              }}
            >
              {MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <span className="badge">{model.parameters} parameters</span>
          <span className="badge">{model.dtype[runtime]}</span>
          <span className="badge">
            ~{model.artifactMb[model.dtype[runtime]]} MB artifact
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
          Revision: {model.revision}. WebGPU uses q4f16; WASM uses q4.
          The model executes on the client.
        </p>
      </section>
    </main>
  );
}
