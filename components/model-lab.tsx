"use client";

import { useEffect, useMemo, useState } from "react";
import { pipeline } from "@huggingface/transformers";
import PwaRuntime from "@/components/pwa-runtime";
import { MODELS, type ModelDefinition, type RuntimeMode } from "@/lib/models";

type DType = "q4" | "q4f16";

type TextGenerator = ((
  input: string | Array<{ role: string; content: string }>,
  options?: Record<string, unknown>,
) => Promise<unknown>) & {
  dispose?: () => Promise<void> | void;
};

type MetricState = {
  loadMs?: number;
  generationMs?: number;
  chars?: number;
  cacheHit?: boolean;
  runtime?: RuntimeMode;
  dtype?: DType;
};

type RunRecord = {
  schemaVersion?: 2;
  id?: number;
  runId?: string;
  status?: "succeeded" | "failed";
  startedAt?: string;
  finishedAt?: string;
  model: string;
  revision: string;
  requestedRuntime?: RuntimeMode;
  runtime?: RuntimeMode;
  dtype?: DType;
  cacheHit?: boolean;
  loadMs?: number;
  generationMs?: number;
  chars?: number;
  promptChars?: number;
  promptDigest?: string;
  generationConfigDigest?: string;
  outputDigest?: string;
  webGpuStatus?: "checking" | "available" | "unavailable";
  onlineAtStart?: boolean;
  fallbackReason?: string;
  error?: string;
};

const HISTORY_KEY = "all-time:measurements:v1";
const PROMPT_KEY = "all-time:prompt:v1";
const MAX_PROMPT_CHARS = 4000;
const MAX_HISTORY = 8;
const GENERATION_CONFIG = {
  max_new_tokens: 96,
  do_sample: false,
  return_full_text: false,
} as const;
const generatorCache = new Map<string, Promise<TextGenerator>>();

function createRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function sha256(value: string): Promise<string | undefined> {
  try {
    if (!("crypto" in globalThis) || !crypto.subtle) return undefined;
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value),
    );
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return undefined;
  }
}

function releaseCachedGeneratorsExcept(keepKey?: string) {
  for (const [key, promise] of generatorCache.entries()) {
    if (key === keepKey) continue;
    generatorCache.delete(key);
    void promise
      .then((generator) => generator.dispose?.())
      .catch(() => undefined);
  }
}

function getCacheKey(
  modelId: string,
  revision: string,
  runtime: RuntimeMode,
  dtype: DType,
) {
  return `${modelId}@${revision}:${runtime}:${dtype}`;
}

function getGenerator(
  modelId: string,
  revision: string,
  runtime: RuntimeMode,
  dtype: DType,
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
      if (
        event.status === "progress_total" &&
        typeof event.progress === "number"
      ) {
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

function formatMs(value?: number) {
  return value === undefined ? "—" : `${Math.round(value)} ms`;
}

export default function ModelLab() {
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [runtime, setRuntime] = useState<RuntimeMode>("webgpu");
  const [prompt, setPrompt] = useState(
    "Explain what you can do in one short paragraph.",
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricState>({});
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [webGpuStatus, setWebGpuStatus] = useState<
    "checking" | "available" | "unavailable"
  >("checking");
  const [online, setOnline] = useState(true);
  const [historyReady, setHistoryReady] = useState(false);

  const model = useMemo<ModelDefinition>(
    () => MODELS.find((item) => item.id === modelId) ?? MODELS[0],
    [modelId],
  );

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem(HISTORY_KEY) ?? "[]",
      ) as RunRecord[];
      const savedPrompt = localStorage.getItem(PROMPT_KEY);
      setHistory(Array.isArray(savedHistory) ? savedHistory.slice(0, 8) : []);
      if (savedPrompt) setPrompt(savedPrompt);
    } catch {
      setHistory([]);
    } finally {
      setHistoryReady(true);
    }
  }, []);

  useEffect(() => {
    if (historyReady) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
    }
  }, [history, historyReady]);

  useEffect(() => {
    localStorage.setItem(PROMPT_KEY, prompt);
  }, [prompt]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function detectWebGpu() {
      if (typeof navigator === "undefined" || !("gpu" in navigator)) {
        if (!cancelled) {
          setWebGpuStatus("unavailable");
          setRuntime("wasm");
        }
        return;
      }

      try {
        const gpu = (
          navigator as Navigator & {
            gpu?: { requestAdapter: () => Promise<unknown | null> };
          }
        ).gpu;
        const adapter = await gpu?.requestAdapter();

        if (!cancelled) {
          const available = Boolean(adapter);
          setWebGpuStatus(available ? "available" : "unavailable");
          if (!available) setRuntime("wasm");
        }
      } catch {
        if (!cancelled) {
          setWebGpuStatus("unavailable");
          setRuntime("wasm");
        }
      }
    }

    void detectWebGpu();
    return () => {
      cancelled = true;
    };
  }, []);

  const webGpuSupported = webGpuStatus === "available";

  async function run() {
    if (loading || !prompt.trim()) return;

    if (prompt.length > MAX_PROMPT_CHARS) {
      setOutput("");
      setError(`Prompt exceeds the local safety limit of ${MAX_PROMPT_CHARS} characters.`);
      setStatus("Rejected");
      return;
    }

    const runId = createRunId();
    const startedAt = new Date().toISOString();
    const promptDigestPromise = sha256(prompt);
    const generationConfigDigestPromise = sha256(JSON.stringify(GENERATION_CONFIG));

    setLoading(true);
    setOutput("");
    setError("");
    setMetrics({});
    setStatus("Preparing model…");

    const requestedRuntime = runtime;
    let actualRuntime = requestedRuntime;
    let actualDtype = model.dtype[requestedRuntime];
    let cacheHit = generatorCache.has(
      getCacheKey(model.id, model.revision, requestedRuntime, actualDtype),
    );
    const started = performance.now();

    try {
      let generator: TextGenerator;

      try {
        generator = await getGenerator(
          model.id,
          model.revision,
          requestedRuntime,
          actualDtype,
          setStatus,
        );
      } catch (firstError) {
        if (requestedRuntime !== "webgpu") throw firstError;

        actualRuntime = "wasm";
        actualDtype = model.dtype.wasm;
        fallbackReason =
          firstError instanceof Error ? firstError.message : String(firstError);
        cacheHit = generatorCache.has(
          getCacheKey(model.id, model.revision, actualRuntime, actualDtype),
        );
        setRuntime("wasm");
        setStatus("WebGPU failed; retrying with WASM…");
        generator = await getGenerator(
          model.id,
          model.revision,
          actualRuntime,
          actualDtype,
          setStatus,
        );
      }

      loadedMs = performance.now() - started;
      setStatus("Generating…");

      const generationStarted = performance.now();
      const result = await generator(
        [{ role: "user", content: prompt }],
        GENERATION_CONFIG,
      );

      generationMs = performance.now() - generationStarted;
      const text = extractGeneratedText(result).trim();

      if (!text) {
        throw new Error("The model completed without returning text.");
      }

      const [promptDigest, generationConfigDigest, outputDigest] =
        await Promise.all([
          promptDigestPromise,
          generationConfigDigestPromise,
          sha256(text),
        ]);
      const finishedAt = new Date().toISOString();
      const runRecord: RunRecord = {
        schemaVersion: 2,
        id: Date.now(),
        runId,
        status: "succeeded",
        startedAt,
        finishedAt,
        model: model.label,
        revision: model.revision,
        requestedRuntime,
        runtime: actualRuntime,
        dtype: actualDtype,
        cacheHit,
        loadMs,
        generationMs,
        chars: text.length,
        promptChars: prompt.length,
        promptDigest,
        generationConfigDigest,
        outputDigest,
        webGpuStatus,
        onlineAtStart: online,
        fallbackReason,
      };

      setOutput(text);
      setMetrics({
        loadMs,
        generationMs,
        chars: text.length,
        cacheHit,
        runtime: actualRuntime,
        dtype: actualDtype,
      });

      setHistory((current) => [runRecord, ...current].slice(0, MAX_HISTORY));
      releaseCachedGeneratorsExcept(
        getCacheKey(model.id, model.revision, actualRuntime, actualDtype),
      );

      setStatus("Complete");
    } catch (runError) {
      console.error(runError);
      const message =
        runError instanceof Error
          ? runError.message
          : "Unknown runtime error.";
      const [promptDigest, generationConfigDigest] = await Promise.all([
        promptDigestPromise,
        generationConfigDigestPromise,
      ]);
      const runRecord: RunRecord = {
        schemaVersion: 2,
        id: Date.now(),
        runId,
        status: "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        model: model.label,
        revision: model.revision,
        requestedRuntime,
        runtime: actualRuntime,
        dtype: actualDtype,
        cacheHit,
        loadMs,
        generationMs,
        promptChars: prompt.length,
        promptDigest,
        generationConfigDigest,
        webGpuStatus,
        onlineAtStart: online,
        fallbackReason,
        error: message,
      };

      setError(message);
      setStatus("Failed");
      setHistory((current) => [runRecord, ...current].slice(0, MAX_HISTORY));
      releaseCachedGeneratorsExcept();
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  function exportMeasurements() {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "All-time",
      model: model.label,
      revision: model.revision,
      currentRuntime: runtime,
      currentDtype: model.dtype[runtime],
      webGpuStatus,
      online,
      measurements: history,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "all-time-measurements.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">All-time</div>
            <div className="brand-subtitle">Local AI workspace</div>
          </div>
        </div>
        <div className="topbar-actions">
          <span className={online ? "status-pill status-ok" : "status-pill status-warn"}>
            {online ? "Online" : "Offline"}
          </span>
          <PwaRuntime />
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">Browser-first inference</div>
        <h1>Run compact AI locally.</h1>
        <p className="lead">
          One interface for local model inference, runtime diagnostics, and
          reproducible measurements. The model runs in your browser.
        </p>
      </section>

      <section className="panel workspace">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Workspace</span>
            <h2>Model runner</h2>
          </div>
          <span className="status-pill">
            {webGpuStatus === "checking"
              ? "Checking GPU…"
              : webGpuSupported
                ? "WebGPU ready"
                : "WASM fallback"}
          </span>
        </div>

        <div className="control-grid">
          <label className="field">
            <span>Model</span>
            <select
              value={modelId}
              onChange={(event) => {
                setModelId(event.target.value);
                releaseCachedGeneratorsExcept();
                setOutput("");
                setError("");
                setMetrics({});
                setStatus("Ready");
              }}
              disabled={loading}
            >
              {MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>Runtime</span>
            <div className="segmented">
              <button
                className={runtime === "webgpu" ? "segment active" : "segment"}
                onClick={() => {
                  releaseCachedGeneratorsExcept();
                  setRuntime("webgpu");
                }}
                disabled={!webGpuSupported || loading}
              >
                WebGPU
              </button>
              <button
                className={runtime === "wasm" ? "segment active" : "segment"}
                onClick={() => {
                  releaseCachedGeneratorsExcept();
                  setRuntime("wasm");
                }}
                disabled={loading}
              >
                WASM
              </button>
            </div>
          </div>
        </div>

        <div className="model-summary">
          <span>{model.parameters}</span>
          <span>q4f16 WebGPU / q4 WASM</span>
          <span>~{model.artifactMb[model.dtype[runtime]]} MB active artifact</span>
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={loading}
          maxLength={MAX_PROMPT_CHARS}
          aria-label="Prompt"
          placeholder="Ask the local model something…"
        />
        <div className="small">{prompt.length}/{MAX_PROMPT_CHARS} prompt characters</div>

        <div className="action-row">
          <button
            className="primary action-button"
            onClick={run}
            disabled={loading || !prompt.trim()}
          >
            {loading ? status : "Run locally"}
          </button>
          <span className="small">
            {loading ? "Inference is running on this device." : model.note}
          </span>
        </div>

        {error ? (
          <div className="error-box">
            <strong>Runtime error</strong>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="output">
          {output || "Model output will appear here."}
        </div>

        <div className="meta">
          <div className="metric">
            <span className="small">Load</span>
            <strong>{formatMs(metrics.loadMs)}</strong>
          </div>
          <div className="metric">
            <span className="small">Generation</span>
            <strong>{formatMs(metrics.generationMs)}</strong>
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
            <span className="small">Output</span>
            <strong>{metrics.chars ?? "—"} chars</strong>
          </div>
        </div>

        <div className="diagnostic-strip">
          <span>WebGPU: {webGpuStatus}</span>
          <span>Runtime: {metrics.runtime ?? runtime}</span>
          <span>dtype: {metrics.dtype ?? model.dtype[runtime]}</span>
          <span>Network: {online ? "available" : "offline"}</span>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Evidence</span>
            <h2>Session measurements</h2>
          </div>
          <div className="action-row compact">
            <button
              className="compact-button"
              onClick={exportMeasurements}
              disabled={history.length === 0}
            >
              Export JSON
            </button>
            <button
              className="compact-button"
              onClick={clearHistory}
              disabled={history.length === 0}
            >
              Clear
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            Your first successful run will appear here. Run the same model twice
            to make cold/warm behavior observable.
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <article className="history-item" key={item.id}>
                <div>
                  <strong>{item.model}</strong>
                  <div className="small">
                    {item.status ?? "legacy"} · {item.runtime ?? "—"} · {item.dtype ?? "—"} · {item.cacheHit ? "warm" : "cold"}
                  </div>
                </div>
                <div className="history-metrics">
                  <span>{item.loadMs === undefined ? "—" : `${Math.round(item.loadMs)} ms load`}</span>
                  <span>{item.generationMs === undefined ? "—" : `${Math.round(item.generationMs)} ms gen`}</span>
                  <span>{item.chars === undefined ? "—" : `${item.chars} chars`}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="small footer-note">
          Revision: {model.revision}. Run records now include run identity,
          input/output digests when SHA-256 is available, requested/actual runtime,
          fallback cause, and failure state. Transformers.js uses the browser Cache
          API for model files when available; the app shell itself is handled by the
          lightweight service worker.
        </p>
      </section>
    </main>
  );
}
