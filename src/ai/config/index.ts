export const aiConfig = {
  defaultModel: "claude-sonnet-4-6",
  maxTokens: 4096,
  temperature: 0.7,
} as const;

export type AIConfig = typeof aiConfig;
