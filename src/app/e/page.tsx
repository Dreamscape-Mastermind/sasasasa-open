"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, Calendar, MapPin, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const events = [
  {
    id: 1,
    title: "Tech Conference 2025",
    date: "March 15, 2025",
    location: "San Francisco, CA",
    description:
      "Join us for the biggest tech conference of the year. Network with industry leaders, attend workshops, and learn about the latest technologies.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    category: "Technology",
    price: 299,
    tags: ["Conference", "Technology", "Networking"],
    slug: "sunday-acoustic-soul-sessions",
  },
  {
    id: 2,
    title: "Music Festival",
    date: "April 20, 2025",
    location: "Austin, TX",
    description:
      "A three-day music festival featuring top artists from around the world. Experience live performances, food vendors, and art installations.",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
    category: "Music",
    price: 199,
    tags: ["Festival", "Music", "Entertainment"],
    slug: "sunday-acoustic-soul-sessions",
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    date: "May 10, 2025",
    location: "New York, NY",
    description:
      "Experience the finest cuisine and wines from around the world. Meet celebrity chefs, attend cooking demonstrations, and enjoy wine tastings.",
    image:
      "https://images.unsplash.com/photo-1510924199351-4e9d94df18a6?w=800&h=400&fit=crop",
    category: "Food & Drink",
    price: 149,
    tags: ["Food", "Wine", "Culinary"],
    slug: "sunday-acoustic-soul-sessions",
  },
];

const categories = [
  "All Categories",
  "Technology",
  "Music",
  "Food & Drink",
  "Business",
  "Sports",
  "Arts",
];

const locations = [
  "All Locations",
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Los Angeles, CA",
  "Chicago, IL",
  "Miami, FL",
];

const tags = [
  "Conference",
  "Festival",
  "Workshop",
  "Networking",
  "Entertainment",
  "Technology",
  "Music",
  "Food",
  "Sports",
  "Art",
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date");

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      event.category === selectedCategory;
    const matchesLocation =
      selectedLocation === "All Locations" ||
      event.location === selectedLocation;
    const matchesPrice =
      event.price >= priceRange[0] && event.price <= priceRange[1];
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => event.tags.includes(tag));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesPrice &&
      matchesTags
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Discover Events</h1>
            <p className="text-muted-foreground">
              Find and book tickets for upcoming events in your area
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    <AccordionItem value="category">
                      <AccordionTrigger>Category</AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="location">
                      <AccordionTrigger>Location</AccordionTrigger>
                      <AccordionContent>
                        <Select
                          value={selectedLocation}
                          onValueChange={setSelectedLocation}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="price">
                      <AccordionTrigger>Price Range</AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={1000}
                            step={10}
                          />
                          <div className="flex justify-between text-sm">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="tags">
                      <AccordionTrigger>Tags</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {tags.map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={tag}
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTags([...selectedTags, tag]);
                                  } else {
                                    setSelectedTags(
                                      selectedTags.filter((t) => t !== tag)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={tag}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {tag}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Events Grid */}
            <div className="md:col-span-3 space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    type="search"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {sortedEvents.map((event) => (
                  <Link href={`/e/${event.slug}`} key={event.id}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="aspect-video relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2 bg-background/90 px-3 py-1 rounded-full">
                          <span className="font-semibold">${event.price}</span>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          <span className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button className="w-full">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {sortedEvents.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">
                    No events found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find more events
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
