"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
// import Main from "./Main";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Search, TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import poster from "../../../public/images/poster.jpeg";
import poster1 from "../../../public/images/poster_1.jpeg";
import poster2 from "../../../public/images/poster_2.jpeg";
import { Events } from "@/components/events/Events";
import { useEvents } from "../../../services/events/queries";

const featuredEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "July 15-17, 2024",
    image: poster,
    category: "Music",
    slug: "summer-music-festival-2024",
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    date: "August 5-7, 2024",
    image: poster1,
    category: "Technology",
    slug: "tech-conference-2024",
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    date: "September 10-12, 2024",
    image: poster2,
    category: "Food",
    slug: "food-wine-expo-2024",
  },
  {
    id: 5,
    title: "Tech Conference 2024",
    date: "August 5-7, 2024",
    image: poster1,
    category: "Technology",
    slug: "tech-conference-2024-2",
  },
  {
    id: 6,
    title: "Food & Wine Expo",
    date: "September 10-12, 2024",
    image: poster2,
    category: "Food",
    slug: "food-wine-expo-2024-2",
  },
  {
    id: 4,
    title: "Summer Music Festival",
    date: "July 15-17, 2024",
    image: poster,
    category: "Music",
    slug: "summer-music-festival-2024-2",
  },
];
export default function Home() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const autoplay = Autoplay();

  const { data: events, isLoading, isError } = useEvents();
  // const createEvent = useCreateEvent();
  // createEvent.mutate({ha: 'ha'})
  // console.log(createEvent)
  // console.log({events: events.data}, events.fetchStatus, events.status)

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);
  return (
    <div className="mx-auto relative">
      {/* //Carousel Start */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Featured Events</h2>
        <Carousel
          setApi={setApi}
          plugins={[autoplay]}
          className="w-full"
          onMouseEnter={() => autoplay.stop()}
          onMouseLeave={() => autoplay.play()}
        >
          <CarouselContent>
            {featuredEvents.map((event, index) => (
              <CarouselItem key={event.id}>
                <div className="relative">
                  <div className="flex sm:flex-row flex-col">
                    <div className="basis-[50%] text-center sm:text-left relative order-2 sm:order-1">
                      <div
                        className="p-6 sm:p-10 bg-white dark:bg-zinc-900"
                        data-testid={"home.header"}
                      >
                        <h2 className="text-1xl sm:text-[100px] leading-none animate-fade-in">
                          {event.title}
                        </h2>
                        <h3 className="text-base sm:text-2xl py-6">
                          {event.date}
                        </h3>
                        <div className="flex text-gray-700 gap-4 justify-center dark:text-gray-300 sm:justify-start">
                          {/* SVGs */}
                          {event.category}
                        </div>
                        <Button
                          className="mt-4 bg-[#CC322D] hover:bg-[#BB5F6A] text-white font-semibold px-8 py-3 rounded-full transition-colors duration-200"
                          size="lg"
                        >
                          <TicketIcon className="w-5 h-5 mr-2" />
                          BUY TICKET
                        </Button>
                      </div>
                      <div className="bg-zinc-900 h-[75px]"></div>
                    </div>
                    <div className="basis-[50%] order-1 sm:order-2">
                      <Image
                        src={event.image}
                        alt="event image"
                        className="w-full"
                        width={1000}
                        height={800}
                      />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex justify-center mt-4">
          {featuredEvents.map((_, index) => (
            <Button
              key={index}
              variant={index === activeIndex ? "default" : "outline"}
              size="sm"
              className="mx-1 w-3 h-3 p-0 rounded-full"
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
      <div className="w-full bg-white dark:bg-zinc-900 p-4 shadow-sm mt-2 mb-6">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-zinc-900 dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-zinc-900 dark:text-gray-200 appearance-none w-[200px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Music">Music</option>
            <option value="Technology">Technology</option>
            <option value="Food">Food</option>
          </select>

          {/* Date Filter */}
          <select
            className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-zinc-900 dark:text-gray-200 appearance-none w-[200px]"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Filter Button */}
          <Button className="bg-[#CC322D] hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition-colors duration-200">
            Apply Filters
          </Button>
        </div>
      </div>
      <Events
        events={
          events?.data && events?.data.result.results
            ? events.data.result.results
            : []
        }
      />
    </div>
  );
}
