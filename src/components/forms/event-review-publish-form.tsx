"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";

import { ApiError } from "@/services/api.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventStatus } from "@/types/event";
import { Label } from "@/components/ui/label";
import NextImage from "next/image";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useState } from "react";

interface EventReviewPublishFormProps {
  onFormSubmitSuccess: () => void;
  eventId?: string;
  onStepComplete: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
}

export default function EventReviewPublishForm({
  onFormSubmitSuccess,
  eventId,
  onStepComplete,
  onPrevious,
  canGoPrevious,
}: EventReviewPublishFormProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const { useEvent: useEventQuery } = useEvent();
  const {
    data: eventData,
    error: eventError,
    isLoading,
    refetch: refetchEvent,
  } = useEventQuery(eventId || "");

  const { usePublishEvent } = useEvent();
  const publishEventMutation = usePublishEvent();

  const handlePublish = async () => {
    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    setIsPublishing(true);
    setTopError(null);
    try {
      await publishEventMutation.mutateAsync(eventId);
      toast.success("Event published successfully!");
      // Refetch event data to get updated status
      await refetchEvent();
      onStepComplete();
      onFormSubmitSuccess();
    } catch (error) {
      let fallbackMessage = "Failed to publish event";
      if (error instanceof ApiError) {
        const apiMessage = error.data?.message || error.message;
        const detail = error.data?.result?.errors?.error_details?.detail;
        setTopError(detail || apiMessage || fallbackMessage);
      } else {
        setTopError(fallbackMessage);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  if (eventError) {
    return (
      <div className="text-red-500">
        Error loading event data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!eventData?.result) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p>No event data available</p>
      </div>
    );
  }

  const event = eventData.result;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review Your Event
          </CardTitle>
          <CardDescription>
            Review all the information you've entered before publishing your
            event.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {topError && (
            <Alert variant="destructive">
              <AlertTitle>Could not publish</AlertTitle>
              <AlertDescription>{topError}</AlertDescription>
            </Alert>
          )}
          {/* Event Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {event.status === EventStatus.PUBLISHED ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-medium text-gray-900">Current Status:</span>
            </div>
            <Badge
              variant={
                event.status === EventStatus.PUBLISHED ? "default" : "secondary"
              }
            >
              {event.status}
            </Badge>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Event Title
                </Label>
                <p className="text-lg font-semibold text-foreground">
                  {event.title || "No title provided"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Venue
                </Label>
                <p className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {event.venue || "No venue specified"}
                </p>
                {event.location && (
                  <div className="ml-6 text-sm text-muted-foreground space-y-1">
                    {event.location.address && <p>{event.location.address}</p>}
                    {event.location.city && event.location.country && (
                      <p>
                        {event.location.city}, {event.location.country}
                      </p>
                    )}
                    {event.location.phone && (
                      <p>Phone: {event.location.phone}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Start Date & Time
                </Label>
                <p className="text-foreground">
                  {event.start_date
                    ? new Date(event.start_date).toLocaleString()
                    : "Not set"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  End Date & Time
                </Label>
                <p className="text-foreground">
                  {event.end_date
                    ? new Date(event.end_date).toLocaleString()
                    : "Not set"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Capacity
                </Label>
                <p className="text-foreground">
                  {event.capacity
                    ? `${event.capacity} attendees`
                    : "No limit set"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Base Price
                </Label>
                <p className="text-foreground">
                  {event.price ? `$${event.price}` : "Free"}
                </p>
              </div>
            </div>

            {event.description && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Event Characteristics */}
          {(event.is_recurring ||
            event.is_series ||
            event.series_name ||
            event.virtual_meeting_url ||
            event.virtual_platform ||
            event.age_restriction ||
            event.minimum_age ||
            event.maximum_age) && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Characteristics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Series Information */}
                  {(event.is_series || event.series_name) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Series Information
                      </Label>
                      <div className="space-y-1">
                        {event.series_name && (
                          <p className="text-foreground font-medium">
                            {event.series_name}
                          </p>
                        )}
                        {event.series_number && (
                          <p className="text-sm text-muted-foreground">
                            Episode {event.series_number}
                          </p>
                        )}
                        {event.is_recurring && (
                          <Badge variant="secondary" className="text-xs">
                            Recurring Event
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Virtual Event Information */}
                  {(event.virtual_meeting_url || event.virtual_platform) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Virtual Event Details
                      </Label>
                      <div className="space-y-1">
                        {event.virtual_platform && (
                          <p className="text-foreground">
                            Platform: {event.virtual_platform}
                          </p>
                        )}
                        {event.virtual_meeting_url && (
                          <a
                            href={event.virtual_meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Join Virtual Event
                          </a>
                        )}
                        {event.virtual_capacity && (
                          <p className="text-sm text-muted-foreground">
                            Virtual Capacity: {event.virtual_capacity}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Age Restrictions */}
                  {(event.age_restriction ||
                    event.minimum_age ||
                    event.maximum_age) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Age Restrictions
                      </Label>
                      <div className="space-y-1">
                        {event.age_restriction && (
                          <p className="text-foreground">
                            {event.age_restriction}
                          </p>
                        )}
                        {(event.minimum_age || event.maximum_age) && (
                          <p className="text-sm text-muted-foreground">
                            {event.minimum_age && `Min: ${event.minimum_age}`}
                            {event.minimum_age && event.maximum_age && " • "}
                            {event.maximum_age && `Max: ${event.maximum_age}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content Rating */}
                  {event.content_rating && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Content Rating
                      </Label>
                      <Badge variant="outline">{event.content_rating}</Badge>
                    </div>
                  )}
                </div>

                {/* Virtual Instructions */}
                {event.virtual_instructions && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Virtual Event Instructions
                    </Label>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-foreground whitespace-pre-wrap">
                        {event.virtual_instructions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Cover Image */}
          {event.cover_image && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Cover Image
                </Label>
                <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border">
                  <NextImage
                    src={event.cover_image || "/images/placeholder-event.jpg"}
                    alt="Event cover"
                    width={400}
                    height={192}
                    className="object-cover"
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Categorization */}
          {(event.category ||
            event.event_type ||
            event.format ||
            (event.tags_data?.length || 0) > 0) && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categorization
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {event.category && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Category
                      </Label>
                      <p className="text-foreground">{event.category.name}</p>
                    </div>
                  )}

                  {event.event_type && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Event Type
                      </Label>
                      <p className="text-foreground">{event.event_type.name}</p>
                    </div>
                  )}

                  {event.format && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Format
                      </Label>
                      <p className="text-foreground">{event.format.name}</p>
                    </div>
                  )}
                </div>

                {(event.tags_data?.length || 0) > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {(event.tags_data || []).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Team & Performers */}
          {((event.team_members?.length || 0) > 0 ||
            (event.performers?.length || 0) > 0) && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team & Performers
                </h3>

                {(event.team_members?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Team Members
                    </Label>
                    <div className="space-y-2">
                      {(event.team_members || []).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <span className="text-foreground font-medium">
                            {member.email}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {member.role.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(event.performers?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Performers
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(event.performers || []).map((performer) => (
                        <div
                          key={performer.id}
                          className="p-4 border rounded-lg bg-muted/30"
                        >
                          <h4 className="font-medium text-foreground">
                            {performer.name}
                          </h4>
                          {performer.bio && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {performer.bio}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tickets */}
          {(event.available_tickets?.length || 0) > 0 && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Tickets
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(event.available_tickets || []).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {ticket.name}
                            </h4>
                            {ticket.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-foreground">
                              ${ticket.price}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            Availability
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {ticket.remaining_tickets} / {ticket.quantity}{" "}
                            available
                          </span>
                        </div>

                        {ticket.sale_start_date && ticket.sale_end_date && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>
                              Sale:{" "}
                              {new Date(
                                ticket.sale_start_date
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                ticket.sale_end_date
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Rich Content */}
          {((event.faq?.length || 0) > 0 ||
            (event.agenda?.length || 0) > 0 ||
            (event.speakers?.length || 0) > 0 ||
            (event.sponsors?.length || 0) > 0) && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Content
                </h3>

                {(event.faq?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Frequently Asked Questions
                    </Label>
                    <div className="space-y-3">
                      {(event.faq || []).map((faq, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">
                            {faq.question}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(event.agenda?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Event Agenda
                    </Label>
                    <div className="space-y-2">
                      {(event.agenda || []).map((item, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-foreground">
                                {item.title}
                              </h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {item.time && (
                              <span className="text-sm text-muted-foreground ml-4">
                                {item.time}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(event.sponsors?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Sponsors
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(event.sponsors || []).map((sponsor, index) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-foreground">
                            {sponsor.name}
                          </h4>
                          {sponsor.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {sponsor.description}
                            </p>
                          )}
                          {sponsor.website_url && (
                            <a
                              href={sponsor.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline mt-2 inline-block"
                            >
                              Visit Website
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SEO & Meta Information */}
          {(event.meta_title ||
            event.meta_description ||
            event.meta_keywords ||
            event.canonical_url ||
            event.language ||
            event.subtitles_available ||
            event.sign_language_available) && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  SEO & Accessibility
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.meta_title && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Meta Title
                      </Label>
                      <p className="text-foreground">{event.meta_title}</p>
                    </div>
                  )}

                  {event.meta_description && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Meta Description
                      </Label>
                      <p className="text-foreground text-sm">
                        {event.meta_description}
                      </p>
                    </div>
                  )}

                  {event.meta_keywords && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Meta Keywords
                      </Label>
                      <p className="text-foreground text-sm">
                        {event.meta_keywords}
                      </p>
                    </div>
                  )}

                  {event.canonical_url && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Canonical URL
                      </Label>
                      <a
                        href={event.canonical_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {event.canonical_url}
                      </a>
                    </div>
                  )}

                  {event.language && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Language
                      </Label>
                      <p className="text-foreground">{event.language}</p>
                    </div>
                  )}
                </div>

                {/* Accessibility Features */}
                {(event.subtitles_available ||
                  event.sign_language_available) && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Accessibility Features
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {event.subtitles_available && (
                        <Badge variant="secondary" className="text-xs">
                          Subtitles Available
                        </Badge>
                      )}
                      {event.sign_language_available && (
                        <Badge variant="secondary" className="text-xs">
                          Sign Language Available
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Social Media */}
          {(event.facebook_url ||
            event.instagram_url ||
            event.twitter_url ||
            event.website_url ||
            event.linkedin_url ||
            event.youtube_url ||
            event.tiktok_url ||
            event.snapchat_url ||
            event.discord_url ||
            event.telegram_url) && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media & Links
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.facebook_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Facebook Page
                      </a>
                    </div>
                  )}
                  {event.instagram_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Instagram Profile
                      </a>
                    </div>
                  )}
                  {event.twitter_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-500 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Twitter Profile
                      </a>
                    </div>
                  )}
                  {event.linkedin_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        LinkedIn Page
                      </a>
                    </div>
                  )}
                  {event.youtube_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        YouTube Channel
                      </a>
                    </div>
                  )}
                  {event.tiktok_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-black hover:text-gray-800 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        TikTok Profile
                      </a>
                    </div>
                  )}
                  {event.discord_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.discord_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Discord Server
                      </a>
                    </div>
                  )}
                  {event.telegram_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.telegram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Telegram Channel
                      </a>
                    </div>
                  )}
                  {event.website_url && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <a
                        href={event.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Event Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Event URLs & Sharing */}
          {(event.short_url || event.share_url) && (
            <>
              <Separator />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Event URLs & Sharing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.short_url && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Short URL
                      </Label>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <a
                          href={event.short_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {event.short_url}
                        </a>
                      </div>
                    </div>
                  )}

                  {event.share_url && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Share URL
                      </Label>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <a
                          href={event.share_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {event.share_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center">
        {/* Previous Button - Far Left */}
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2 h-12 px-6 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Publish Button - Far Right */}
        <Button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 h-12 px-6 rounded-xl"
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish Event
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
