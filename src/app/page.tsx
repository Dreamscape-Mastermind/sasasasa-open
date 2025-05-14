import { Calendar, DollarSign, Play, Ticket, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import Image from "next/image";
import Link from "next/link";
import { SasasasaEvent } from "@/utils/dataStructures";
import dynamic from "next/dynamic";

// import Calendar from "react-datepicker/dist/calendar";

// Lazy load below-the-fold components
const Main = dynamic(() => import("./Main"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-800 rounded-lg mb-4"></div>
    </div>
  ),
});

const FeaturedEventBanner = dynamic(
  () => import("../../components/FeaturedEventBanner"),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-800 rounded-lg"></div>
      </div>
    ),
  }
);

async function getFeaturedEvent(): Promise<SasasasaEvent | undefined> {
  try {
    const response = await fetch("https://ra.sasasasa.co/api/v1/events");
    const data = await response.json();

    // Find event by slug (short_url in the API)
    const event = data.result.results.find(
      (e: { short_url: string }) =>
        e.short_url === "sunday-acoustic-soul-sessions"
    );

    return event;
  } catch (error) {
    console.error("Error fetching featured event:", error);
    return undefined;
  }
}
const featuredEvents = [
  {
    id: 1,
    title: "Tech Conference 2025",
    date: "March 15, 2025",
    location: "San Francisco, CA",
    price: 299,
    discount: 20,
    video: "https://example.com/tech-conf-preview.mp4",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Music Festival",
    date: "April 20, 2025",
    location: "Austin, TX",
    price: 199,
    discount: 15,
    video: "https://example.com/music-fest-preview.mp4",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    date: "May 10, 2025",
    location: "New York, NY",
    price: 149,
    discount: 0,
    video: "https://example.com/food-expo-preview.mp4",
    image:
      "https://images.unsplash.com/photo-1510924199351-4e9d94df18a6?w=800&h=400&fit=crop",
  },
];
// async function getFeaturedEvents(): Promise<SasasasaEvent[]> {
//   try {
//     const response = await fetch("https://ra.sasasasa.co/api/v1/events");
//     const data = await response.json();

//     return data.result.results;
//   } catch (error) {
//     console.error("Error fetching featured events:", error);
//     return [];
//   }
// }

export default async function Home() {
  const featuredEvent = await getFeaturedEvent();
  // const featuredEvents = await getFeaturedEvents();
  return (
    <main className="container mx-auto px-4">
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-0" />
          <div className="container mx-auto px-4 py-24 relative z-10">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold tracking-tight">
              Commerce for your community on demand.
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover, create, and manage experiences and custom products with $0 investment. From intimate circles to global audiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Get Started
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/e">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    Browse Sasasasa
                    <Ticket className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <FeaturedEventBanner event={featuredEvent} />
        {/* Featured Events Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Featured Experiences</h2>
              <Link href="/e">
                <Button variant="ghost">View All Experiences</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Link href={`/e/${event.id}`} key={event.id} className="group">
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="aspect-video relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white"
                        >
                          <Play className="h-8 w-8" />
                        </Button>
                      </div>
                      {event.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {event.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-card">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          {event.location}
                        </div>
                        <div className="font-semibold">
                          ${event.price - (event.price * event.discount) / 100}
                          {event.discount > 0 && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ${event.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="container mx-auto px-4 py-24 bg-muted/50">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Sasasasa?</h2>
            <p className="text-muted-foreground">
              Everything you need to create and manage and print out your experiences.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Get Started Quick and Easy</h3>
              <p className="text-muted-foreground">
                Create and customize your experiences in minutes with our intuitive
                tools and templates.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Ticketing</h3>
              <p className="text-muted-foreground">
                Flexible ticketing options with QR codes, multiple tiers, and
                real-time analytics.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="text-muted-foreground">
                Process payments securely with instant transfers and detailed
                financial reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Promoted Events */}
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Specials</h2>
            <div className="grid gap-4 sm:gap-6">
              {featuredEvents
                .filter((event) => event.discount > 0)
                .map((event) => (
                  <Link
                    href={`/e/${event.id}`}
                    key={event.id}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-card">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/3">
                          <div className="aspect-video sm:aspect-square relative">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                              <h3 className="font-semibold text-lg sm:text-xl line-clamp-2">
                                {event.title}
                              </h3>
                              <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap self-start">
                                {event.discount}% OFF
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{event.date}</span>
                            </div>
                            <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground line-clamp-2">
                              Don't miss this special offer!
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-3 sm:mt-4">
                            <div className="text-sm text-muted-foreground truncate max-w-[40%]">
                              {event.location}
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-base sm:text-lg">
                                ${(event.price - (event.price * event.discount) / 100).toFixed(2)}
                              </span>
                              <span className="text-xs sm:text-sm text-muted-foreground line-through ml-2">
                                ${event.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Your Event?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers who trust Sasasasa to create
              memorable experiences for their attendees.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Start Creating
                <Calendar className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <Hero />
      </div>
    </main>
  );
}
