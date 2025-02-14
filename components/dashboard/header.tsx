"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThemeSwitch from "../ThemeSwitch";
import { useState } from "react";

const notifications = [
  {
    title: "New Ticket Sale",
    description: "Sarah Davis purchased a VIP ticket",
    time: "2 minutes ago",
    read: false,
  },
  {
    title: "Event Reminder",
    description: "Tech Conference starts in 2 hours",
    time: "1 hour ago",
    read: false,
  },
  {
    title: "Payment Processed",
    description: "Monthly subscription payment received",
    time: "3 hours ago",
    read: true,
  },
  {
    title: "New Review",
    description: "Your event received a 5-star rating",
    time: "5 hours ago",
    read: true,
  },
];

export function Header() {
  const [unreadCount, setUnreadCount] = useState(
    notifications.filter((n) => !n.read).length
  );

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-semibold">Notifications</h4>
                <Button
                  variant="ghost"
                  className="text-xs"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4 py-4">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 px-2 py-2 rounded-lg ${
                        !notification.read ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}
