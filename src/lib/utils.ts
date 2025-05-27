"use client";

import { ClassValue, clsx } from "clsx";
import { FlashSale, UserRole, type TicketTypeWithFlashSale } from "@/types";

import { twMerge } from "tailwind-merge";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isFlashSaleValid = (
  flashSale: FlashSale | TicketTypeWithFlashSale | null
): boolean => {
  if (!flashSale || flashSale.status !== "ACTIVE") return false;

  const now = new Date();
  const startDate = new Date(flashSale.start_date);
  const endDate = new Date(flashSale.end_date);

  return now >= startDate && now <= endDate;
};

// Create a query string for the URL
export const useCreateQueryString = () => {
  const searchParams = useSearchParams();

  return useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );
};

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
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

// Format date
export function formatDate(date: string | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format date time
export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");
};
