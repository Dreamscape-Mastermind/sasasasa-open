'use client'
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, Users, Ticket, CreditCard, Megaphone } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useEvent, usePublishEvent } from '@/lib/hooks/useEvents';
import TeamMembersForm from '@/components/forms/team-members-form';

export default function OverviewLayout() {

  const params = useParams();
  const pathname = usePathname();
  const eventId = params.id as string;
  const publishEvent = usePublishEvent(eventId); // Use the publish hook

  const { data: event, isLoading, error } = useEvent(eventId);

  const handlePublish = async () => {
    try {
      // Call the publish function (you may need to pass eventId or other data)
      // if (eventId) await publishEvent.mutateAsync(); // Adjust as necessary
      // Optionally, handle success (e.g., show a success message)
      console.log("Event published successfully!@");
    } catch (error) {
      // Handle error (e.g., show an error message)
      console.error("Error publishing event:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-10 text-lg text-muted-foreground">Loading event details...</div>;
  }

  if (!event) {
    return <div className="text-center mt-10 text-lg text-muted-foreground">Event not found.</div>;
  }

  return (
    <>
      <div className="bg-white pb-6 sm:pb-8 lg:pb-12">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">

            <section className="flex flex-col justify-between gap-6 sm:gap-10 md:gap-16 lg:flex-row lg:items-center">

              <div className="flex flex-col justify-center sm:text-center lg:text-left xl:w-5/12">
                <p className="mb-4 font-semibold text-[#CC322D]  md:mb-6 md:text-lg xl:text-xl">{formatDateTime(event.start_date)}</p>

                <h1 className="mb-8 text-4xl font-bold text-black sm:text-5xl md:mb-12 md:text-6xl">{event.title}</h1>

                <p className="mb-8 leading-relaxed text-gray-500 md:mb-12 lg:w-4/5 xl:text-lg">{event.description}</p>
                {/* bg-[#CC322D] dark:text-white text-primary2-foreground hover:bg-[#CC322D]/90 rounded-[4rem] */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center lg:justify-start">
                  <button className="inline-block rounded-lg bg-[#CC322D] px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-[#CC322D]/90  focus-visible:ring active:bg-[#CC322D]/90  md:text-base"
                    onClick={handlePublish}>Publish</button>

                  <a href="#" className="inline-block rounded-lg bg-gray-200 px-8 py-3 text-center text-sm font-semibold text-gray-500 outline-none ring-indigo-300 transition duration-100 hover:bg-gray-300 focus-visible:ring active:text-gray-700 md:text-base">Edit</a>
                </div>
              </div>

              <div className="relative w-full xl:w-5/12">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-lg">
                  <img src={event.cover_image} loading="lazy" alt={event.title} className="h-full w-full object-cover object-center" />
                </div>
              </div>
            </section>

        </div>
        <TeamMembersForm />
      </div>

    </>
  );
}
