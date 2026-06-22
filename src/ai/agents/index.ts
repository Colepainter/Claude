import { aiConfig } from "../config";
import { systemPrompt } from "../prompts/system";

export interface Agent {
  name: string;
  model: string;
  systemPrompt: string;
}

export const defaultAgent: Agent = {
  name: "default",
  model: aiConfig.defaultModel,
  systemPrompt,
};
