import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale === 'hi' ? 'hi-IN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
