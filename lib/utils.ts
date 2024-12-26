import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseSpellDescription(description: string): string {
  return description
    .replace(/\[dmg\]/g, '<span class="text-red-400">')
    .replace(/\[\/dmg\]/g, '</span>')
    .replace(/\[buff\]/g, '<span class="text-green-400">')
    .replace(/\[\/buff\]/g, '</span>')
    .replace(/\[other\]/g, '<span class="text-blue-400">')
    .replace(/\[\/other\]/g, '</span>')
}
