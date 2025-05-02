import { ClassValue, clsx } from "clsx";
import { FlashSale, TicketTypeWithFlashSale } from "@/types";

import { twMerge } from "tailwind-merge";

export const isFlashSaleValid = (
  flashSale: FlashSale | TicketTypeWithFlashSale | null
): boolean => {
  if (!flashSale) return false;

  // Check if it's a FlashSale or TicketTypeWithFlashSale
  const status = flashSale.status;
  if (status !== "ACTIVE") return false;

  const now = new Date();
  const startDate = new Date(flashSale.start_date);
  const endDate = new Date(flashSale.end_date);

  return now >= startDate && now <= endDate;
};

export const featureEvents = async () => {
  return ["634a2b96-c537-4839-b8d1-5d06906ef244"];
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
