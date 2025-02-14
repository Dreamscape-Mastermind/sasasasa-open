'use server'

import { FlashSale } from "./dataStructures";

export async function formatDateCustom(dateString: string): Promise<string> {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  const ordinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th'; // covers 11th to 19th
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${month} ${day}${ordinalSuffix(day)}, ${year}`;
} 