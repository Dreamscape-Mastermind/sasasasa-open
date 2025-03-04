import { AuthTokens, FlashSale, StorageKey } from "./dataStructures";

export const isFlashSaleValid = (flashSale: FlashSale | null): boolean => {
  if (!flashSale || flashSale.status !== 'ACTIVE') return false;
  
  const now = new Date();
  const startDate = new Date(flashSale.start_date);
  const endDate = new Date(flashSale.end_date);
  
  return now >= startDate && now <= endDate;
};

export const getToken = (): AuthTokens | null => {
  const storedUser = localStorage.getItem(StorageKey.USER);
  const tokens = localStorage.getItem(StorageKey.TOKENS);
  
  if (storedUser && tokens) {
    const parsedTokens: AuthTokens = JSON.parse(tokens);
    return parsedTokens;
  }
  return null;
}