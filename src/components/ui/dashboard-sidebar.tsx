"use client";

import * as React from "react";

import { Home, Settings, ShoppingCart, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type SidebarNavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dash",
    icon: Home,
  },
  {
    title: "Orders",
    href: "/dash/orders",
    icon: ShoppingCart,
  },
  {
    title: "Profile",
    href: "/dash/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dash/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
