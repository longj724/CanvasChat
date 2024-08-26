import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOllama } from 'ollama-ai-provider';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const modelNameToProvider = (modelName: string) => {
  switch (modelName) {
    case 'gpt-4-0125-preview':
    case 'gpt-4-turbo':
    case 'gpt-4o':
    case 'gpt-4o-mini':
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return openai(modelName);
    case 'llama-3.1-8b-instant':
    case 'mixtral-8x7b-32768':
      const groq = createOpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
      });
      return groq(modelName);
    case 'claude-3-5-sonnet-20240620':
    case 'claude-3-opus-20240229':
    case 'claude-3-haiku-20240307':
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(modelName);
    default:
      const ollama = createOllama();
      return ollama(modelName);
  }
};

export const ACCEPTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/json',
  'text/markdown',
  'application/pdf',
  'text/plain',
].join(',');
