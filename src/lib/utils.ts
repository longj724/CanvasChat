import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const modelToProvider = (modelName: string) => {
  switch (modelName) {
    case 'gpt-4-0125-preview':
    case 'gpt-4-turbo':
    case 'gpt-4o':
    default:
      return 'openai';
  }
};
