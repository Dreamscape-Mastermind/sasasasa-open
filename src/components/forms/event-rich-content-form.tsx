"use client";

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Clock,
  HelpCircle,
  Loader2,
  Plus,
  Star,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadtab";
import { useEffect, useState } from "react";

import { ApiError } from "@/services/api.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const richContentSchema = z.object({
  agenda: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        start_time: z.string().optional(),
        end_time: z.string().optional(),
        location: z.string().optional(),
        speaker: z.string().optional(),
      })
    )
    .default([]),
  faq: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    )
    .default([]),
  highlights: z.array(z.string()).default([]),
  sponsors: z
    .array(
      z.object({
        name: z.string().min(1, "Sponsor name is required"),
        logo_url: z.string().optional(),
        website_url: z.string().optional(),
        description: z.string().optional(),
        sponsorship_level: z.string().optional(),
      })
    )
    .default([]),
});

type RichContentFormData = z.infer<typeof richContentSchema>;

interface EventRichContentFormProps {
  onFormSubmitSuccess: () => void;
  eventId?: string;
  onStepComplete: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  onNext?: () => void;
  canGoNext?: boolean;
  onSkip?: () => void;
  canSkip?: boolean;
}

export default function EventRichContentForm({
  onFormSubmitSuccess,
  eventId,
  onStepComplete,
  onPrevious,
  canGoPrevious,
  onNext,
  canGoNext,
  onSkip,
  canSkip = false,
}: EventRichContentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("agenda");
  const [topError, setTopError] = useState<string | null>(null);

  const { useEvent: useEventQuery, useUpdateEvent } = useEvent();
  const {
    data: eventData,
    error: eventError,
    isLoading: isLoadingEvent,
  } = useEventQuery(eventId || "");
  const updateEvent = useUpdateEvent(eventId || "");

  const form = useForm<RichContentFormData>({
    resolver: zodResolver(richContentSchema),
    defaultValues: {
      agenda: [],
      faq: [],
      highlights: [],
      sponsors: [],
    },
  });

  // Populate form with existing event data
  useEffect(() => {
    if (eventData?.result) {
      const event = eventData.result;

      // Populate agenda
      if (event.agenda && event.agenda.length > 0) {
        form.setValue("agenda", event.agenda);
      }

      // Populate FAQ
      if (event.faq && event.faq.length > 0) {
        form.setValue("faq", event.faq);
      }

      // Populate highlights
      if (event.highlights && event.highlights.length > 0) {
        form.setValue("highlights", event.highlights);
      }

      // Populate sponsors
      if (event.sponsors && event.sponsors.length > 0) {
        form.setValue("sponsors", event.sponsors);
      }
    }
  }, [eventData, form]);

  // Add agenda item
  const addAgendaItem = () => {
    const currentAgenda = form.getValues("agenda");
    form.setValue("agenda", [
      ...currentAgenda,
      {
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        speaker: "",
      },
    ]);
  };

  // Remove agenda item
  const removeAgendaItem = (index: number) => {
    const currentAgenda = form.getValues("agenda");
    form.setValue(
      "agenda",
      currentAgenda.filter((_, i) => i !== index)
    );
  };

  // Add FAQ item
  const addFaqItem = () => {
    const currentFaq = form.getValues("faq");
    form.setValue("faq", [...currentFaq, { question: "", answer: "" }]);
  };

  // Remove FAQ item
  const removeFaqItem = (index: number) => {
    const currentFaq = form.getValues("faq");
    form.setValue(
      "faq",
      currentFaq.filter((_, i) => i !== index)
    );
  };

  // Add highlight
  const addHighlight = (highlight: string) => {
    if (highlight.trim()) {
      const currentHighlights = form.getValues("highlights");
      form.setValue("highlights", [...currentHighlights, highlight.trim()]);
    }
  };

  // Remove highlight
  const removeHighlight = (index: number) => {
    const currentHighlights = form.getValues("highlights");
    form.setValue(
      "highlights",
      currentHighlights.filter((_, i) => i !== index)
    );
  };

  // Add sponsor
  const addSponsor = () => {
    const currentSponsors = form.getValues("sponsors");
    form.setValue("sponsors", [
      ...currentSponsors,
      {
        name: "",
        logo_url: "",
        website_url: "",
        description: "",
        sponsorship_level: "",
      },
    ]);
  };

  // Remove sponsor
  const removeSponsor = (index: number) => {
    const currentSponsors = form.getValues("sponsors");
    form.setValue(
      "sponsors",
      currentSponsors.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: RichContentFormData) => {
    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    setIsLoading(true);
    setTopError(null);
    try {
      await updateEvent.mutateAsync({
        agenda: data.agenda,
        faq: data.faq,
        highlights: data.highlights,
        sponsors: data.sponsors,
      });

      toast.success("Event content updated successfully");
      onStepComplete();
      onFormSubmitSuccess();
    } catch (error) {
      let fallbackMessage = "Failed to update event content";
      if (error instanceof ApiError) {
        const apiMessage = error.data?.message || error.message;
        const possibleFieldErrors =
          error.data?.result?.errors?.errors || error.data?.errors;
        const errorDetails =
          error.data?.result?.errors?.error_details || error.data?.errors;
        const detail: string | undefined =
          typeof errorDetails?.detail === "string"
            ? errorDetails.detail
            : undefined;

        if (possibleFieldErrors && typeof possibleFieldErrors === "object") {
          Object.entries(possibleFieldErrors as Record<string, any>).forEach(
            ([key, value]) => {
              const message = Array.isArray(value)
                ? String(value[0])
                : typeof value === "string"
                ? value
                : undefined;
              if (!message) return;

              // Attempt to set nested errors for arrays if indices provided
              // Otherwise set a top-level alert
            }
          );
        }

        setTopError(detail || apiMessage || fallbackMessage);
      } else {
        setTopError(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (eventError) {
    return (
      <div className="text-red-500">
        Error loading event data. Please try again.
      </div>
    );
  }

  if (isLoadingEvent) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const agenda = form.watch("agenda");
  const faq = form.watch("faq");
  const highlights = form.watch("highlights");
  const sponsors = form.watch("sponsors");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Content & Details</CardTitle>
          <CardDescription>
            Add rich content to make your event more engaging and informative.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Could not save content</AlertTitle>
              <AlertDescription>{topError}</AlertDescription>
            </Alert>
          )}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="agenda" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Agenda
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger
                value="highlights"
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Highlights
              </TabsTrigger>
              <TabsTrigger value="sponsors" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Sponsors
              </TabsTrigger>
            </TabsList>

            {/* Agenda Tab */}
            <TabsContent value="agenda" className="space-y-4">
              <div className="space-y-4">
                {agenda.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Agenda Item {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAgendaItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          placeholder="Session title"
                          value={item.title}
                          onChange={(e) => {
                            const newAgenda = [...agenda];
                            newAgenda[index].title = e.target.value;
                            form.setValue("agenda", newAgenda);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Speaker</Label>
                        <Input
                          placeholder="Speaker name"
                          value={item.speaker}
                          onChange={(e) => {
                            const newAgenda = [...agenda];
                            newAgenda[index].speaker = e.target.value;
                            form.setValue("agenda", newAgenda);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe this agenda item..."
                        value={item.description}
                        onChange={(e) => {
                          const newAgenda = [...agenda];
                          newAgenda[index].description = e.target.value;
                          form.setValue("agenda", newAgenda);
                        }}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={item.start_time}
                          onChange={(e) => {
                            const newAgenda = [...agenda];
                            newAgenda[index].start_time = e.target.value;
                            form.setValue("agenda", newAgenda);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={item.end_time}
                          onChange={(e) => {
                            const newAgenda = [...agenda];
                            newAgenda[index].end_time = e.target.value;
                            form.setValue("agenda", newAgenda);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          placeholder="Room/Venue"
                          value={item.location}
                          onChange={(e) => {
                            const newAgenda = [...agenda];
                            newAgenda[index].location = e.target.value;
                            form.setValue("agenda", newAgenda);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addAgendaItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agenda Item
                </Button>
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-4">
              <div className="space-y-4">
                {faq.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">FAQ {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaqItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Question *</Label>
                      <Input
                        placeholder="What's the dress code?"
                        value={item.question}
                        onChange={(e) => {
                          const newFaq = [...faq];
                          newFaq[index].question = e.target.value;
                          form.setValue("faq", newFaq);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer *</Label>
                      <Textarea
                        placeholder="Business casual is recommended..."
                        value={item.answer}
                        onChange={(e) => {
                          const newFaq = [...faq];
                          newFaq[index].answer = e.target.value;
                          form.setValue("faq", newFaq);
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addFaqItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
            </TabsContent>

            {/* Highlights Tab */}
            <TabsContent value="highlights" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a highlight (e.g., 'Free parking available')"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addHighlight(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      addHighlight(input.value);
                      input.value = "";
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {highlight}
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Sponsors Tab */}
            <TabsContent value="sponsors" className="space-y-4">
              <div className="space-y-4">
                {sponsors.map((sponsor, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Sponsor {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSponsor(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sponsor Name *</Label>
                        <Input
                          placeholder="Company name"
                          value={sponsor.name}
                          onChange={(e) => {
                            const newSponsors = [...sponsors];
                            newSponsors[index].name = e.target.value;
                            form.setValue("sponsors", newSponsors);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sponsorship Level</Label>
                        <Select
                          value={sponsor.sponsorship_level}
                          onValueChange={(value) => {
                            const newSponsors = [...sponsors];
                            newSponsors[index].sponsorship_level = value;
                            form.setValue("sponsors", newSponsors);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="bronze">Bronze</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Company Logo URL</Label>
                      <Input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={sponsor.logo_url}
                        onChange={(e) => {
                          const newSponsors = [...sponsors];
                          newSponsors[index].logo_url = e.target.value;
                          form.setValue("sponsors", newSponsors);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        type="url"
                        placeholder="https://sponsor.com"
                        value={sponsor.website_url}
                        onChange={(e) => {
                          const newSponsors = [...sponsors];
                          newSponsors[index].website_url = e.target.value;
                          form.setValue("sponsors", newSponsors);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe the sponsor's involvement..."
                        value={sponsor.description}
                        onChange={(e) => {
                          const newSponsors = [...sponsors];
                          newSponsors[index].description = e.target.value;
                          form.setValue("sponsors", newSponsors);
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addSponsor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sponsor
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between items-center">
        {/* Previous Button - Far Left */}
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Skip and Next/Submit Buttons - Far Right */}
        <div className="flex gap-2">
          {canSkip && onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={!canGoNext}
            >
              Skip
            </Button>
          )}
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading || !canGoNext}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Next"
            )}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
