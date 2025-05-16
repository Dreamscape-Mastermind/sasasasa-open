import { ClassValue, clsx } from "clsx";
import { FlashSale, TicketTypeWithFlashSale, UserRole } from "@/types";

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

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Check if user has admin role
export function isAdmin(role?: UserRole | null) {
  return role === UserRole.ADMIN;
}

// Check if user is event organizer
export function isEventOrganizer(role?: UserRole | null) {
  return role === UserRole.EVENT_ORGANIZER;
}

// Check if object is empty
export function isEmptyObject(obj: Record<string, any>) {
  return Object.keys(obj).length === 0;
}

// Get role name display
export function getRoleName(role: UserRole) {
  const roleMap: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "Super Admin",
    [UserRole.ADMIN]: "Administrator",
    [UserRole.EVENT_ORGANIZER]: "Event Organizer",
    [UserRole.EVENT_TEAM]: "Event Team",
    [UserRole.CUSTOMER]: "Customer",
  };

  return roleMap[role] || "Unknown Role";
}

// Calculate days remaining until event
export function daysUntilEvent(eventDate: string | Date) {
  const today = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Generate random avatar URL
export function getAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random`;
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
};
