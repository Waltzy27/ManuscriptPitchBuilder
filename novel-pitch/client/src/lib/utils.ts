import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function importanceLabel(n: number): string {
  return ["", "Background Only", "Minor Detail", "Notable", "Important", "Critical"][n] || "Notable";
}

export function importanceColor(n: number): string {
  return `imp-badge-${Math.max(1, Math.min(5, n))}`;
}

export function impDot(n: number): string {
  return `imp-dot-${Math.max(1, Math.min(5, n))}`;
}

export function formatWordCount(n: number | null | undefined): string {
  if (!n) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k words`;
  return `${n} words`;
}

export function parseJsonArray(str: string | null | undefined): string[] {
  if (!str) return [];
  try { return JSON.parse(str); } catch { return []; }
}

export function stringifyJsonArray(arr: string[]): string {
  return JSON.stringify(arr);
}
