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
    note: "Smallest baseline; 118 MB q4f16 WebGPU artifact.",
    dtype: {
      webgpu: "q4f16",
      wasm: "q4",
    },
    artifactMb: {
      q4: 182,
      q4f16: 118,
    },
  },
  {
    id: "onnx-community/Qwen2.5-0.5B-Instruct",
    revision: "516c8d0",
    label: "Qwen2.5 0.5B Instruct",
    parameters: "0.5B",
    note: "Larger multilingual comparison model.",
    dtype: {
      webgpu: "q4f16",
      wasm: "q4",
    },
    artifactMb: {
      q4: 786,
      q4f16: 483,
    },
  },
];
