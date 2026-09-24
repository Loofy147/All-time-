export type ModelDefinition = {
  id: string;
  label: string;
  parameters: string;
  note: string;
  dtype: "q4" | "q4f16";
};

export const MODELS: ModelDefinition[] = [
  {
    id: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA",
    label: "SmolLM2 135M Instruct",
    parameters: "135M",
    note: "Verified ONNX + Transformers.js model; browser-first candidate.",
    dtype: "q4f16",
  },
];
