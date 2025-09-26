"use client";

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Clock,
  FileText,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Premium Header */}
        <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 mb-2 sm:mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Event Content & Details
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Add rich content to make your event more engaging and informative.
          </p>
        </div>

        {/* Premium Form Grid */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                    Event Content & Details
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    Add rich content to make your event more engaging and
                    informative
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {topError && (
                <Alert
                  variant="destructive"
                  className="mb-4 sm:mb-8 border-red-200 bg-red-50 dark:bg-red-950/20"
                >
                  <AlertTitle className="text-sm sm:text-base text-red-800 dark:text-red-200">
                    Could not save content
                  </AlertTitle>
                  <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                    {topError}
                  </AlertDescription>
                </Alert>
              )}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 h-8 sm:h-10 bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                  <TabsTrigger
                    value="agenda"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg"
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    Agenda
                  </TabsTrigger>
                  <TabsTrigger
                    value="faq"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg"
                  >
                    <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger
                    value="highlights"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg"
                  >
                    <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                    Highlights
                  </TabsTrigger>
                  <TabsTrigger
                    value="sponsors"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg"
                  >
                    <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                    Sponsors
                  </TabsTrigger>
                </TabsList>

                {/* Agenda Tab */}
                <TabsContent value="agenda" className="space-y-4 sm:space-y-6">
                  <div className="space-y-4 sm:space-y-6">
                    {agenda.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl space-y-4 sm:space-y-6 bg-white/50 dark:bg-gray-800/50"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm sm:text-base text-foreground">
                            Agenda Item {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAgendaItem(index)}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label className="text-xs sm:text-sm font-semibold text-foreground">
                              Title *
                            </Label>
                            <Input
                              placeholder="Session title"
                              value={item.title}
                              onChange={(e) => {
                                const newAgenda = [...agenda];
                                newAgenda[index].title = e.target.value;
                                form.setValue("agenda", newAgenda);
                              }}
                              className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                            />
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label className="text-xs sm:text-sm font-semibold text-foreground">
                              Speaker
                            </Label>
                            <Input
                              placeholder="Speaker name"
                              value={item.speaker}
                              onChange={(e) => {
                                const newAgenda = [...agenda];
                                newAgenda[index].speaker = e.target.value;
                                form.setValue("agenda", newAgenda);
                              }}
                              className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
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

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAgendaItem}
                      className="h-8 sm:h-10 px-4 sm:px-6 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-lg sm:rounded-xl text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Agenda Item
                    </Button>
                  </div>
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="space-y-4">
                  <div className="space-y-4">
                    {faq.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-4"
                      >
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

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFaqItem}
                    >
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
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-4"
                      >
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
                                <SelectItem value="platinum">
                                  Platinum
                                </SelectItem>
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

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSponsor}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sponsor
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-4 sm:px-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-full text-sm font-medium"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Previous
            </Button>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {canSkip && onSkip && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSkip}
                  disabled={!canGoNext}
                  className="w-full sm:w-auto h-8 sm:h-10 px-4 sm:px-6 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-full text-sm font-medium"
                >
                  Skip
                </Button>
              )}
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading || !canGoNext}
                className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-6 sm:px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 rounded-full text-sm font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Next"
                )}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
