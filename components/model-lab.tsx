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
  cacheHit?: boolean;
};

type RunRecord = {
  id: number;
  model: string;
  runtime: RuntimeMode;
  dtype: "q4" | "q4f16";
  cacheHit: boolean;
  loadMs: number;
  generationMs: number;
  chars: number;
};

const generatorCache = new Map<string, Promise<TextGenerator>>();

function getCacheKey(
  modelId: string,
  revision: string,
  runtime: RuntimeMode,
  dtype: "q4" | "q4f16",
) {
  return `${modelId}@${revision}:${runtime}:${dtype}`;
}

function getGenerator(
  modelId: string,
  revision: string,
  runtime: RuntimeMode,
  dtype: "q4" | "q4f16",
  onProgress: (status: string) => void,
) {
  const cacheKey = getCacheKey(modelId, revision, runtime, dtype);
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
    const last = generated[generated.length - 1] as
      | { content?: unknown }
      | string
      | undefined;

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
  const [history, setHistory] = useState<RunRecord[]>([]);

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

    const dtype = model.dtype[runtime];
    const cacheKey = getCacheKey(model.id, model.revision, runtime, dtype);
    const cacheHit = generatorCache.has(cacheKey);
    const started = performance.now();

    try {
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
          do_sample: false,
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
        cacheHit,
      });
      setHistory((current) => [
        {
          id: Date.now(),
          model: model.label,
          runtime,
          dtype,
          cacheHit,
          loadMs: loadedMs,
          generationMs,
          chars: text.length,
        },
        ...current,
      ].slice(0, 8));
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
          <button
            onClick={() => setHistory([])}
            disabled={loading || history.length === 0}
          >
            Clear measurements
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
              {metrics.loadMs !== undefined
                ? `${Math.round(metrics.loadMs)} ms`
                : "—"}
            </strong>
          </div>
          <div className="metric">
            <span className="small">Cache</span>
            <strong>
              {metrics.cacheHit === undefined
                ? "—"
                : metrics.cacheHit
                  ? "warm"
                  : "cold"}
            </strong>
          </div>
          <div className="metric">
            <span className="small">Generation</span>
            <strong>
              {metrics.generationMs !== undefined
                ? `${Math.round(metrics.generationMs)} ms`
                : "—"}
            </strong>
          </div>
          <div className="metric">
            <span className="small">Output</span>
            <strong>{metrics.chars ?? "—"} chars</strong>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="small">Session measurements (latest 8)</div>
          {history.length === 0 ? (
            <div className="small" style={{ marginTop: 8 }}>
              Run the same model/runtime twice to compare cold vs warm load.
            </div>
          ) : (
            <div className="meta" style={{ marginTop: 8 }}>
              {history.map((item) => (
                <div className="metric" key={item.id}>
                  <span className="small">
                    {item.model} · {item.runtime} · {item.dtype}
                  </span>
                  <strong>{item.cacheHit ? "warm" : "cold"}</strong>
                  <span className="small">
                    load {Math.round(item.loadMs)} ms · gen{" "}
                    {Math.round(item.generationMs)} ms · {item.chars} chars
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="small" style={{ marginTop: 16 }}>
          Revision: {model.revision}. WebGPU uses q4f16; WASM uses q4.
          Benchmark runs use deterministic decoding (do_sample=false).
          The model executes on the client.
        </p>
      </section>
    </main>
  );
}
