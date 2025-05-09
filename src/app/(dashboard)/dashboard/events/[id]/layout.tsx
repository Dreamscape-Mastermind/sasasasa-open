'use client'
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, Users, Ticket, CreditCard, Megaphone } from 'lucide-react';

let events = [
  {
    id: 1,
    title: 'Tech Conference 2025',
    start_date: 'March 15, 2025',
    location: 'San Francisco, CA',
    description: 'Join us for the biggest tech conference of the year.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'Music Festival',
    start_date: 'April 20, 2025',
    location: 'Austin, TX',
    description: 'A three-day music festival featuring top artists.',
    cover_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'Food & Wine Expo',
    start_date: 'May 10, 2025',
    location: 'New York, NY',
    description: 'Experience the finest cuisine and wines from around the world.',
    cover_image: 'https://images.unsplash.com/photo-1510924199351-4e9d94df18a6?w=800&h=400&fit=crop',
  },
];

export default function EventLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const eventId = Number(params.id);

  const event = events.find(e => e.id === eventId);

  if (!event) {
    return <div className="text-center mt-10 text-lg text-muted-foreground">Event not found.</div>;
  }

  return (
    <>
{/* flow rift start */}

<div className="bg-white pb-6 sm:pb-8 lg:pb-12">
  <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
    
    <section className="flex flex-col justify-between gap-6 sm:gap-10 md:gap-16 lg:flex-row lg:items-center">
      
      <div className="flex flex-col justify-center sm:text-center lg:text-left xl:w-5/12">
        <p className="mb-4 font-semibold text-[#CC322D]  md:mb-6 md:text-lg xl:text-xl">{event.start_date}</p>

        <h1 className="mb-8 text-4xl font-bold text-black sm:text-5xl md:mb-12 md:text-6xl">{event.title}</h1>

        <p className="mb-8 leading-relaxed text-gray-500 md:mb-12 lg:w-4/5 xl:text-lg">{event.description}</p>
        {/* bg-[#CC322D] dark:text-white text-primary2-foreground hover:bg-[#CC322D]/90 rounded-[4rem] */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center lg:justify-start">
          <a href="#" className="inline-block rounded-lg bg-[#CC322D] px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-[#CC322D]/90  focus-visible:ring active:bg-[#CC322D]/90  md:text-base">Edit</a>

          <a href="#" className="inline-block rounded-lg bg-gray-200 px-8 py-3 text-center text-sm font-semibold text-gray-500 outline-none ring-indigo-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base">Take tour</a>
        </div>
      </div>
      
      <div className="relative w-full xl:w-5/12">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-lg">
          <img src={event.cover_image} loading="lazy" alt={event.title} className="h-full w-full object-cover object-center" />
        </div>
      </div>
    </section>
    {/* <header className="mb-8 flex items-center justify-between py-4 md:mb-12 md:py-8 xl:mb-16"> */}
     
      {/* <a href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl" aria-label="logo">
        <svg width="95" height="94" viewBox="0 0 95 94" className="h-auto w-6 text-indigo-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M96 0V47L48 94H0V47L48 0H96Z" />
        </svg>

        Flowrift
      </a> */}
     
      {/* <nav className="hidden gap-12 lg:flex">
        <a href="#" className="text-lg font-semibold text-indigo-500">Home</a>
        <a href="#" className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700">Features</a>
        <a href="#" className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700">Pricing</a>
        <a href="#" className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700">About</a>
      </nav>
   
      <a href="#" className="hidden rounded-lg bg-gray-200 px-8 py-3 text-center text-sm font-semibold text-gray-500 outline-none ring-indigo-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base lg:inline-block">Contact Sales</a>

      <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-2.5 py-2 text-sm font-semibold text-gray-500 ring-indigo-300 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>

        Menu
      </button> 

    </header> */}
    <nav className="mt-8 bg-gray-50 border rounded-lg">
        <div className="flex justify-between px-6 py-3">
          <Link href={`/dashboard/events/${eventId}/analytics`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <BarChart2 className="h-5 w-5 mb-1" />
            Analytics
          </Link>
          <Link href={`/dashboard/events/${eventId}/attendees`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <Users className="h-5 w-5 mb-1" />
            Attendees
          </Link>
          <Link href={`/dashboard/events/${eventId}/tickets`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <Ticket className="h-5 w-5 mb-1" />
            Tickets
          </Link>
          <Link href={`/dashboard/events/${eventId}/payments`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <CreditCard className="h-5 w-5 mb-1" />
            Payments
          </Link>
          <Link href={`/dashboard/events/${eventId}/promotions`} className="flex flex-col items-center text-sm text-muted-foreground hover:text-primary">
            <Megaphone className="h-5 w-5 mb-1" />
            Promotions
          </Link>
        </div>
      </nav>
  </div>
</div>

    {/* Old */}
    
    
    {/* <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <img
        src={event.cover_image}
        alt={event.title}
        className="w-full h-64 object-cover rounded" />
      <h1 className="text-3xl font-bold mt-6 mb-2">{event.title}</h1>
      <p className="text-muted-foreground text-lg">{event.description}</p>
    </div> */}

    <div className="mt-8">
        {children}
      </div></>
  );
}
