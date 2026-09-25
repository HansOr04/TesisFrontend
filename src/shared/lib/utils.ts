import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDecimal = (
  value: number | string | null | undefined,
  decimals = 2
): string => {
  if (value === null || value === undefined) return "-";
  const number = typeof value === "string" ? parseFloat(value) : value;
  return Number.isNaN(number) ? "-" : number.toFixed(decimals);
};
