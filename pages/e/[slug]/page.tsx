import dynamic from 'next/dynamic'
import Image from "next/image";
import { redirect } from "next/navigation";
import { Tickets } from "@/components/Tickets";
import { SasasasaEvent } from "@/utils/dataStructures";
import { formatDateCustom } from "@/utils/dataFormatters";
import Link from "next/link";
import { motion } from 'framer-motion';

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const isSundayAcousticSession = slug === "sunday-acoustic-soul-sessions";
  
  try {
    const response = await fetch('https://ra.sasasasa.co/api/v1/events');
    const data = await response.json();
    
    // Find event by slug (short_url in the API)
    const event = data.result.results.find(
      (e:{ short_url: string }) => e.short_url === slug
    );

    if (!event) {
      return (
        <div className="text-3xl w-full text-center p-9 box-border">
          The event was not found
        </div>
      );
    }

    // Add performers data for the special event
    const performers = isSundayAcousticSession ? [
      { name: 'M. Rumbi', spotify: 'https://open.spotify.com/artist/6ToQowXRJ5GkBPHDECCEoP' },
      { name: 'Kinoti', spotify: 'https://open.spotify.com/artist/45KLKfGTZLK4BUZAv2l5sm' },
      { name: 'Clark Keeng', spotify: 'https://open.spotify.com/artist/3trMdyvF4qVEceHElT1oAP' },
      { name: 'Matt Ngesa', spotify: 'https://open.spotify.com/artist/38jStfZwiNvdn1PKt9ma35' }
    ] : [];

    return (
      <div className="mx-auto px-4 sm:px-14">
        <div className="full-w overflow-hidden max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-8 bg-zinc-900 text-white max-w-6xl sm:max-w-5xl items-left sm:items-start mx-auto sm:p-8">
            <div className="basis-1/2 relative aspect-square">
              <Image
                src={event.cover_image || ''}
                fill
                alt='event poster'
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="basis-1/2 text-left px-5 pb-4 sm:px-0 sm:pb-0 sm:pt-4">
              <div className="flex flex-col gap-1 text-gray-300">
                <span className="text-lg">
                  {new Date(event.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'Africa/Nairobi'
                  })}
                </span>
                <div className="flex items-center gap-2 text-base">
                  <span>
                    {new Date(event.start_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                      timeZone: 'Africa/Nairobi'
                    })}
                  </span>
                  <span>-</span>
                  <span>
                    {new Date(event.end_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                      timeZone: 'Africa/Nairobi'
                    })}
                  </span>
                  <span className="text-sm">(EAT)</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold my-4 sm:my-6">
                {event.title}
              </h1>
              <h3 className="my-4 sm:my-6 text-gray-200 text-lg leading-relaxed">
                {event.description}
              </h3>

              {/* Add performers section for Sunday Acoustic Session */}
              {isSundayAcousticSession && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold mb-4">Featured Artists:</h4>
                  <div className="flex flex-wrap gap-4">
                    {performers.map((performer) => (
                      <Link
                        key={performer.name}
                        href={performer.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 
                          rounded-full text-lg font-semibold text-white 
                          hover:text-primary transition-all duration-200 
                          flex items-center gap-2 hover:scale-105 
                          active:scale-95 shadow-md hover:shadow-lg"
                      >
                        {performer.name}
                        <svg
                          className="w-5 h-5 inline-block transition-transform 
                            duration-200 group-hover:rotate-12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto text-[14px] sm:text-base px-3 sm:px-0 sm:mt-12">
            <div className="my-8">
              <h2 className="text-xl font-bold mb-3">VENUE</h2>
              <Link 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-helvetica hover:underline text-blue-400 text-lg"
              >
                {event.venue}
              </Link>
            </div>

            {event.team_members && event.team_members.length > 0 && event.organizer_name && (
              <div className="my-8">
                <h2 className="text-xl font-bold mb-3">ORGANIZER</h2>
                <div className="flex flex-col gap-2">
                  {event.team_members.map((member) => (
                    member.role === "EVENT_ORGANIZER" && (
                      <div key={member.id} className="flex flex-col gap-2">
                        <span className="font-bold text-lg">{event.organizer_name}</span>
                        {member.email && (
                          <Link
                            href={`mailto:${member.email}`}
                            className="text-blue-400 hover:underline"
                          >
                            {member.email}
                          </Link>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {event.available_tickets && event.available_tickets.length > 0 && (
              <div className="my-8 sm:my-12">
                <h2 className="text-xl font-bold mb-3">TICKETS</h2>
                {/* @ts-ignore */}
                <Tickets 
                  // @ts-ignore
                  tickets={event.available_tickets} 
                  formatDate={formatDateCustom}
                />
              </div>
            )}
            
            {(event.facebook_url || event.twitter_url || event.instagram_url) && (
              <div className="my-4">
                <h2 className="mt-7">Share this event</h2>
                {/* ... existing social sharing buttons ... */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    return (
      <div className="text-3xl w-full text-center p-9 box-border">
        Error loading event
      </div>
    );
  }
}
