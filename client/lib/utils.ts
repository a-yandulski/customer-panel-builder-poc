import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the base path for the application from Vite's BASE_URL
 */
export function getBasePath(): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
}

/**
 * Create a complete URL with the proper base path
 * @param path - The path to append to the base path (should start with /)
 * @returns Full URL with base path included
 */
export function createUrlWithBasePath(path: string): string {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
