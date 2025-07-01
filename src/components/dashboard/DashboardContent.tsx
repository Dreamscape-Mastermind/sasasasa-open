"use client";

import {
  AlertCircle,
  BarChart3,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  Plus,
  Search,
  Share2,
  TrendingUp,
  Trophy,
  Twitter,
  UserCheck,
  Users,
  Users2,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo, useState } from "react";

import { Event, EventStatus } from "@/types/event";
import { TicketStatus } from "@/types/ticket";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEvent } from "@/hooks/useEvent";
import { useTicket } from "@/hooks/useTicket";
import { usePayment } from "@/hooks/usePayment";
import { useCheckin } from "@/hooks/useCheckin";
import { useDiscount } from "@/hooks/useDiscount";
import { DiscountStatus } from "@/types/discount";

// Sample data for referral codes (would need actual discount service integration)
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

// Event category mapping for UI display
const getEventCategoryIcon = (eventTitle: string) => {
  const title = eventTitle.toLowerCase();
  if (title.includes('concert') || title.includes('music') || title.includes('festival')) {
    return { icon: Music2, color: "bg-primary/10 text-primary" };
  }
  if (title.includes('conference') || title.includes('meetup') || title.includes('workshop')) {
    return { icon: Users2, color: "bg-primary/20 text-primary" };
  }
  if (title.includes('sport') || title.includes('game') || title.includes('tournament')) {
    return { icon: Trophy, color: "bg-secondary/20 text-secondary-foreground" };
  }
  return { icon: Video, color: "bg-muted text-muted-foreground" };
};

// Sample recent attendees (would come from actual ticket/user data)
const sampleRecentAttendees = [
  {
    name: "Sarah Davis",
    email: "sarah@example.com",
    ticketType: "VIP Pass",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
    checkedIn: true,
  },
  {
    name: "Michael Chen",
    email: "michael@example.com",
    ticketType: "Regular",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=faces",
    checkedIn: false,
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    ticketType: "Early Bird",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    checkedIn: true,
  },
];

const socialLinks = [
  { icon: Twitter, color: "hover:bg-blue-400", label: "Twitter" },
  { icon: Facebook, color: "hover:bg-blue-600", label: "Facebook" },
  { icon: Instagram, color: "hover:bg-pink-600", label: "Instagram" },
  { icon: Linkedin, color: "hover:bg-blue-700", label: "LinkedIn" },
];

export default function DashboardContent() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Hooks for real data
  const { useEvents } = useEvent();
  const { useTickets } = useTicket();
  const { usePayments } = usePayment();
  const { useCheckInStats } = useCheckin();
  const { useDiscounts } = useDiscount();

  // Fetch real data
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments();

  // Get the currently selected event or first event
  const selectedEvent: Event | undefined = useMemo(() => {
    if (!eventsData?.result?.results || !selectedEventId) {
      return eventsData?.result?.results[0];
    }
    return eventsData.result.results.find(
      (event) => event.id === selectedEventId
    );
  }, [eventsData, selectedEventId]);

  // Fetch tickets for selected event
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets(
    selectedEvent?.id || "", 
    undefined
  );

  const { data: discountsData, isLoading: discountsLoading } = useDiscounts(selectedEvent?.id || "");
  console.log({discountsData})
  // Fetch check-in stats for selected event
  const { data: checkinStatsData, isLoading: checkinLoading } = useCheckInStats(
    selectedEvent?.id
  );

  // Calculate dashboard statistics from real data
  const dashboardStats = useMemo(() => {
    if (!eventsData?.result?.results) {
      return {
        totalEvents: 0,
        activeEvents: 0,
        upcomingEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        attendanceRate: 0,
        checkedInToday: 0,
        pendingRefunds: 0,
      };
    }

    const events = eventsData.result.results;
    const now = new Date();

    // Basic event stats
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === EventStatus.PUBLISHED).length;
    const upcomingEvents = events.filter(e => {
      const startDate = new Date(e.start_date);
      return startDate > now && e.status === EventStatus.PUBLISHED;
    }).length;

    // Calculate ticket stats across all events
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    events.forEach(event => {
      if (event.available_tickets) {
        event.available_tickets.forEach(ticketType => {
          const sold = ticketType.quantity - ticketType.remaining_tickets;
          totalTicketsSold += sold;
          totalRevenue += sold * ticketType.price;
        });
      }
    });

    // Check-in stats (using selected event or default)
    const checkedInToday = checkinStatsData?.result?.checked_in || 0;
    const totalTicketsForEvent = selectedEvent?.available_tickets?.reduce(
      (sum, ticket) => sum + ticket.quantity, 0
    ) || 1;
    const attendanceRate = totalTicketsForEvent > 0 
      ? Math.round((checkedInToday / totalTicketsForEvent) * 100) 
      : 0;

    // Placeholder for refunds (would need actual refund data)
    const pendingRefunds = 3; // TODO: Calculate from actual refunds

    return {
      totalEvents,
      activeEvents,
      upcomingEvents,
      totalTicketsSold,
      totalRevenue,
      attendanceRate,
      checkedInToday,
      pendingRefunds,
    };
  }, [eventsData, selectedEvent, checkinStatsData]);

  // Event categories stats
  const eventCategories = useMemo(() => {
    if (!eventsData?.result?.results) return [];

    const categoryMap = new Map();
    
    eventsData.result.results.forEach(event => {
      const { icon, color } = getEventCategoryIcon(event.title);
      const category = event.title.toLowerCase().includes('concert') ? 'Concerts' :
                     event.title.toLowerCase().includes('conference') ? 'Conferences' :
                     event.title.toLowerCase().includes('sport') ? 'Sports' : 'Others';
      
      if (categoryMap.has(category)) {
        categoryMap.set(category, {
          ...categoryMap.get(category),
          count: categoryMap.get(category).count + 1
        });
      } else {
        categoryMap.set(category, {
          name: category,
          icon,
          color,
          count: 1,
          lastUpdate: "Recent"
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [eventsData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isLoading = eventsLoading || paymentsLoading || ticketsLoading || checkinLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="h-12 bg-muted/20 rounded-xl w-full sm:w-96 animate-pulse" />
          <div className="h-12 bg-muted/20 rounded-xl w-full sm:w-32 animate-pulse" />
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-32 bg-muted/20 rounded-xl animate-pulse",
                  i === 0 ? "sm:col-span-2" : "",
                  i === 3 ? "sm:col-span-2" : ""
                )}
              />
            ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="h-96 bg-muted/20 rounded-xl animate-pulse" />
          <div className="h-96 bg-muted/20 rounded-xl animate-pulse" />
          <div className="h-96 bg-muted/20 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 sm:space-y-8 animate-in p-4 sm:p-6">
        {/* Header with Search and Create Event */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events, attendees..."
              className="pl-10 h-12 sm:h-10 text-base sm:text-sm rounded-xl border-2 border-muted/40 focus:border-primary/60 transition-colors"
            />
          </div>
          <Link href={ROUTES.DASHBOARD_EVENT_CREATE()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="gap-2 h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all">
                  <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                  Create Event
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new event</p>
              </TooltipContent>
            </Tooltip>
          </Link>
        </div>

        {/* Bento Grid Stats - Real Data */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue - Large Card */}
          <Card className="sm:col-span-2 bg-primary/5 border-primary/20 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
            <CardHeader className="pb-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl font-bold">
                  Total Revenue
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold mb-2">
                {formatCurrency(dashboardStats.totalRevenue)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>From {dashboardStats.totalTicketsSold} tickets sold</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Events */}
          <Card className="hover:shadow-md transition-all rounded-xl border-2 border-muted/60 hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold">Events</CardTitle>
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {dashboardStats.totalEvents}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                {dashboardStats.activeEvents} active
              </p>
            </CardContent>
          </Card>

          {/* Tickets Sold */}
          <Card className="hover:shadow-md transition-all rounded-xl border-2 border-muted/60 hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold">Tickets</CardTitle>
                <div className="p-2 bg-secondary/20 rounded-xl border border-secondary/30">
                  <BarChart3 className="h-4 w-4 text-secondary-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {dashboardStats.totalTicketsSold.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                Total sold
              </p>
            </CardContent>
          </Card>

          {/* Attendance Rate - Large Card */}
          <Card className="sm:col-span-2 bg-secondary/10 border-secondary/30 rounded-xl shadow-sm hover:shadow-md hover:border-secondary/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl font-bold">
                  Attendance Rate
                </CardTitle>
                <div className="p-2 bg-secondary/20 rounded-xl border border-secondary/30">
                  <UserCheck className="h-5 w-5 text-secondary-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      className="stroke-muted stroke-2 fill-none sm:hidden"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-muted stroke-2 fill-none hidden sm:block"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      className="stroke-primary stroke-3 fill-none sm:hidden"
                      strokeDasharray={`${dashboardStats.attendanceRate * 2.26} 226`}
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-primary stroke-3 fill-none hidden sm:block"
                      strokeDasharray={`${dashboardStats.attendanceRate * 2.51} 251`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold">
                      {dashboardStats.attendanceRate}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {dashboardStats.checkedInToday}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Checked in today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="hover:shadow-md transition-all rounded-xl border-2 border-muted/60 hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold">Upcoming</CardTitle>
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {dashboardStats.upcomingEvents}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                Next 30 days
              </p>
            </CardContent>
          </Card>

          {/* Pending Refunds */}
          <Card className="hover:shadow-md transition-all rounded-xl border-2 border-muted/60 hover:border-destructive/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold">Refunds</CardTitle>
                <div className="p-2 bg-destructive/10 rounded-xl border border-destructive/20">
                  <CreditCard className="h-4 w-4 text-destructive" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {dashboardStats.pendingRefunds}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                Pending review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Event Categories, Attendees, Referrals */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Event Categories - Real Data */}
          <Card className="rounded-xl border-2 border-muted/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
            <CardHeader className="pb-4 border-b border-muted/40">
              <CardTitle className="text-lg sm:text-xl font-bold">Event Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {eventCategories.length > 0 ? (
                  eventCategories.map((category) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${category.color} p-2 rounded-xl border border-current/20`}>
                          <category.icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="rounded-xl font-bold border border-secondary/30">
                        {category.count}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted/40 rounded-xl">
                    <p className="font-medium">No events found</p>
                    <p className="text-sm mt-1">Create your first event to see categories</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendees */}
          <Card className="rounded-xl border-2 border-muted/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
            <CardHeader className="pb-4 border-b border-muted/40">
              <CardTitle className="text-lg sm:text-xl font-bold">Recent Attendees</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {ticketsData?.result?.results?.map((attendee) => (
                  <div
                    key={attendee.owner_details.email}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0 rounded-xl border-2 border-muted/40">
                        <AvatarImage src={attendee.owner_details.avatar} />
                        <AvatarFallback className="text-xs rounded-xl font-bold">
                          {attendee.owner_details.first_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">
                          {attendee.owner_details.first_name} {attendee.owner_details.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {attendee.ticket_type_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {attendee.checked_in_at !== null ? (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-medium border border-primary/30">
                          <UserCheck className="h-3 w-3 mr-1" />
                          In
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-xl font-medium border border-secondary/30">
                          <Users className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Referral - Better Spacing */}
          <Card className="rounded-xl border-2 border-muted/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-muted/40">
              <CardTitle className="text-lg sm:text-xl font-bold">Discount Codes</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl border-2 hover:border-primary/50">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Create</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new discount code</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Referral Codes List */}
              <div className="space-y-3">
                {discountsData?.result?.results?.map((code) => (
                  <div
                    key={code.id}
                    className="p-4 border-2 border-muted/50 rounded-xl bg-background hover:bg-muted/20 hover:border-muted/70 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-sm">
                          {code.code}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">
                          {code.amount}% off
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-xl border-2 hover:border-primary/50"
                              onClick={() => {
                                navigator.clipboard.writeText(code.code);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy code</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-8 w-8 rounded-xl border-2",
                            code.status === DiscountStatus.ACTIVE
                              ? "text-primary border-primary/30 hover:border-primary/50"
                              : code.status === DiscountStatus.EXPIRED
                              ? "text-muted-foreground border-muted/50"
                              : "text-destructive border-destructive/30 hover:border-destructive/50"
                          )}
                        >
                          {code.status === DiscountStatus.ACTIVE ? (
                            <Check className="h-3 w-3" />
                          ) : code.status === DiscountStatus.EXPIRED ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">
                        {code.current_uses}/{code.max_uses} used
                      </span>
                      <span className="font-medium">
                        Expires {new Date(code.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Share Section */}
              <div className="pt-4 border-t-2 border-muted/40">
                <div className="text-sm font-bold mb-3 text-muted-foreground">Share Event</div>
                <div className="flex gap-2">
                  {socialLinks.map((social, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 transition-all rounded-xl border-2 border-muted/50 hover:border-primary/50 hover:bg-primary/5"
                        >
                          <social.icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on {social.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2 border-muted/50 hover:border-primary/50 hover:bg-primary/5">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>More sharing options</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
