export type RuntimeMode = "webgpu" | "wasm";

export type ModelDefinition = {
  id: string;
  revision: string;
  label: string;
  parameters: string;
  note: string;
  dtype: Record<RuntimeMode, "q4" | "q4f16">;
  artifactMb: Record<"q4" | "q4f16", number>;
};

export const MODELS: ModelDefinition[] = [
  {
    id: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA",
    revision: "5b6682c",
    label: "SmolLM2 135M Instruct",
    parameters: "135M",
    note: "ONNX + Transformers.js browser candidate.",
    dtype: {
      webgpu: "q4f16",
      wasm: "q4",
    },
    artifactMb: {
      q4: 182,
      q4f16: 118,
    },
  },
];
