"use client";

import {
  AlertCircle,
  Check,
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  PlusCircle,
  Search,
  Trophy,
  Twitter,
  Users2,
  Video,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Overview } from "@/components/dashboard/overview";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEvent } from "@/hooks/useEvent";
import { useQuery } from "@tanstack/react-query";

// Sample data for UI development
const sampleReferralCodes = [
  {
    id: "1",
    code: "WELCOME20",
    discount: 20,
    usedCount: 5,
    usageLimit: 100,
    expiryDate: "2024-12-31",
    status: "active",
  },
  {
    id: "2",
    code: "SUMMER50",
    discount: 50,
    usedCount: 100,
    usageLimit: 100,
    expiryDate: "2024-08-31",
    status: "depleted",
  },
  {
    id: "3",
    code: "EARLYBIRD30",
    discount: 30,
    usedCount: 0,
    usageLimit: 50,
    expiryDate: "2024-06-30",
    status: "expired",
  },
];

const shimmerClass =
  "animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent";

const eventCategories = [
  {
    name: "Concerts",
    icon: Music2,
    count: 12,
    color: "bg-pink-500/10 text-pink-500",
    lastUpdate: "2 hours ago",
  },
  {
    name: "Conferences",
    icon: Users2,
    count: 8,
    color: "bg-blue-500/10 text-blue-500",
    lastUpdate: "5 hours ago",
  },
  {
    name: "Sports",
    icon: Trophy,
    count: 6,
    color: "bg-green-500/10 text-green-500",
    lastUpdate: "1 day ago",
  },
  {
    name: "Others",
    icon: Video,
    count: 4,
    color: "bg-purple-500/10 text-purple-500",
    lastUpdate: "3 days ago",
  },
];

const recentAttendees = [
  {
    name: "Sarah Davis",
    email: "sarah@example.com",
    ticketType: "VIP Pass",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
  },
  {
    name: "Michael Chen",
    email: "michael@example.com",
    ticketType: "Regular",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=faces",
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    ticketType: "Early Bird",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
  },
];

const socialLinks = [
  { icon: Twitter, color: "bg-blue-400" },
  { icon: Facebook, color: "bg-blue-600" },
  { icon: Instagram, color: "bg-pink-600" },
  { icon: Linkedin, color: "bg-blue-700" },
];

export default function DashboardPage() {
  // Keep track of selected event
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { useEvents } = useEvent();

  // Fetch events data
  const { data: eventsData, isLoading } = useEvents();

  // Get the currently selected event
  const selectedEvent: Event | undefined = useMemo(() => {
    if (!eventsData?.result?.results || !selectedEventId) {
      // Default to first event if none selected
      return eventsData?.result?.results[0];
    }
    return eventsData.result.results.find(
      (event) => event.id === selectedEventId
    );
  }, [eventsData, selectedEventId]);

  // Calculate ticket statistics for the selected event
  const ticketStats = useMemo(() => {
    if (!selectedEvent) return null;

    const totalTickets =
      selectedEvent.available_tickets?.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
      ) ?? 0;
    const soldTickets =
      selectedEvent.available_tickets?.reduce(
        (sum, ticket) => sum + (ticket.quantity - ticket.remaining_tickets),
        0
      ) ?? 0;

    return {
      totalTickets,
      soldTickets,
      soldPercentage:
        Math.round((soldTickets / totalTickets) * 100 * 100) / 100,
    };
  }, [selectedEvent]);

  // TODO: Replace with actual API call when endpoint is ready
  const { data: referralCodes = sampleReferralCodes } = useQuery({
    queryKey: ["referralCodes", selectedEventId],
    queryFn: () => Promise.resolve(sampleReferralCodes),
    enabled: !!selectedEventId,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in">
        {/* Event Selector Skeleton */}
        <div className="flex justify-between items-center">
          <div className="relative w-96">
            <div className="h-10 bg-muted/10 rounded-md" />
          </div>
          <div className="h-10 w-32 bg-muted/10 rounded-md" />
        </div>

        {/* Ticket Sales Overview Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            className={cn(
              "col-span-2 h-[350px] rounded-xl bg-muted/10",
              shimmerClass
            )}
          />
          <div
            className={cn("h-[350px] rounded-xl bg-muted/10", shimmerClass)}
          />
        </div>

        {/* Event Categories Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={cn("h-[120px] rounded-xl bg-muted/10", shimmerClass)}
              />
            ))}
        </div>

        {/* Recent Attendees and Referral Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={cn("h-[400px] rounded-xl bg-muted/10", shimmerClass)}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events, attendees, or tickets..."
            className="pl-10"
          />
        </div>
        <Link href={ROUTES.DASHBOARD_EVENT_DETAILS("new")}>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Ticket Sales Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ticket Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>

        {/* Total Tickets Card */}
        {ticketStats && (
          <Card>
            <CardHeader>
              <CardTitle>Total Tickets Sold</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {ticketStats.soldPercentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">Sold</div>
                    </div>
                  </div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-muted stroke-2 fill-none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-primary stroke-2 fill-none"
                      strokeDasharray={`${
                        ticketStats.soldPercentage * 3.51
                      } 351`}
                    />
                  </svg>
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  {ticketStats.soldTickets} / {ticketStats.totalTickets} Tickets
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {eventCategories.map((category) => (
          <Card key={category.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {category.name}
              </CardTitle>
              <div className={`${category.color} p-2 rounded-lg`}>
                <category.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.count}</div>
              <p className="text-xs text-muted-foreground">
                Last updated {category.lastUpdate}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Attendees and Referral */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentAttendees.map((attendee) => (
                <div
                  key={attendee.email}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback>
                        {attendee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{attendee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {attendee.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {attendee.ticketType}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Event Referral</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Code
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referral Codes List */}
            <div className="space-y-4">
              {referralCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-medium">{code.code}</span>
                      <span className="text-sm text-muted-foreground">
                        {code.discount}% off
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm">
                        {code.usedCount}/{code.usageLimit} used
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Expires {new Date(code.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(code.code);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={
                          code.status === "active"
                            ? "text-green-500"
                            : code.status === "depleted"
                            ? "text-orange-500"
                            : "text-red-500"
                        }
                      >
                        {code.status === "active" ? (
                          <Check className="h-4 w-4" />
                        ) : code.status === "depleted" ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Share Section */}
            <div>
              <div className="text-sm font-medium mb-2">
                Share on Social Media
              </div>
              <div className="flex gap-2">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    className={`${social.color} text-white hover:opacity-90`}
                  >
                    <social.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
