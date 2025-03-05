export * from './scoreCalculations.js';
export * from './validation.js';
export * from './formatting.js';

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
