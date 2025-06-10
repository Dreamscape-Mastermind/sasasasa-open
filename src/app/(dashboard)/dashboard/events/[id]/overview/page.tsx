'use client'
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, Users, Ticket, CreditCard, Megaphone } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useEvent, usePublishEvent } from '@/hooks/useEvent';
import TeamMembersForm from '@/components/forms/team-members-form';

export default function OverviewLayout() {

  const params = useParams();
  const pathname = usePathname();
  const eventId = params.id as string;
  const publishEvent = usePublishEvent(eventId); // Use the publish hook
  const { useEvent: useSingleEvent } = useEvent();

  const { data: event, isLoading, error } = useSingleEvent(eventId);

  console.log({ event });

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

  if (!event?.result) {
    return <div className="text-center mt-10 text-lg text-muted-foreground">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        
        {/* Main Event Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            
            {/* Content Column */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <p className="text-lg font-semibold text-primary tracking-wide">
                  {formatDateTime(event.result.start_date)}
                </p>
                
                <h1 className="text-5xl font-bold text-foreground leading-tight sm:text-6xl lg:text-7xl">
                  {event.result.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  {event.result.description}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <button 
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
                  onClick={handlePublish}
                >
                  Publish Event
                </button>
                
                <button className="inline-flex items-center justify-center rounded-2xl bg-secondary px-8 py-4 text-base font-semibold text-secondary-foreground shadow-lg transition-all duration-200 hover:bg-secondary/80 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:scale-[0.98]">
                  Edit Details
                </button>
              </div>
            </div>
            
            {/* Image Column */}
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-3xl bg-muted shadow-2xl ring-1 ring-black/5">
                {event.result.cover_image ? (
                  <img 
                    src={event.result.cover_image} 
                    loading="lazy" 
                    alt={event.result.title} 
                    className="h-full w-full object-cover object-center" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Team Management Section */}
        <section className="rounded-3xl bg-card p-8 shadow-lg ring-1 ring-border/50 sm:p-12">
          <TeamMembersForm />
        </section>
      </div>
    </div>
  );
}
