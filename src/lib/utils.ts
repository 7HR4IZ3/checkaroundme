import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the expiry date based on a start date and a plan interval.
 * @param startDate - The date the subscription starts.
 * @param interval - The plan interval (e.g., 'monthly', 'annually').
 * @returns The calculated expiry date.
 */
export function calculateExpiryDate(
  startDate: Date,
  interval: "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually"
): Date {
  const expiryDate = new Date(startDate);

  switch (interval) {
    case "hourly":
      expiryDate.setHours(expiryDate.getHours() + 1);
      break;
    case "daily":
      expiryDate.setDate(expiryDate.getDate() + 1);
      break;
    case "weekly":
      expiryDate.setDate(expiryDate.getDate() + 7);
      break;
    case "monthly":
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      break;
    case "quarterly":
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      break;
    case "biannually": // Every 6 months
      expiryDate.setMonth(expiryDate.getMonth() + 6);
      break;
    case "annually":
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      break;
    default:
      // Default to monthly if interval is unknown, or throw an error
      console.warn(`Unknown subscription interval: ${interval}. Defaulting to monthly.`);
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      break;
  }

  return expiryDate;
}
