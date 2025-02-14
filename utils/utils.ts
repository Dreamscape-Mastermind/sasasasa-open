import { FlashSale } from "./dataStructures";

export const isFlashSaleValid = (flashSale: FlashSale | null): boolean => {
  if (!flashSale || flashSale.status !== 'ACTIVE') return false;
  
  const now = new Date();
  const startDate = new Date(flashSale.start_date);
  const endDate = new Date(flashSale.end_date);
  
  return now >= startDate && now <= endDate;
};