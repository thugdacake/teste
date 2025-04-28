import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')                 // separa caracteres acentuados em base + diacrítico
    .replace(/[\u0300-\u036f]/g, '')  // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')             // substitui espaços por hífens
    .replace(/[^\w-]+/g, '')          // remove caracteres não alfanuméricos
    .replace(/--+/g, '-');            // substitui múltiplos hífens por um único
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
