"use client";

import {
  Calendar,
  Check,
  Edit3,
  FileText,
  Globe,
  Image,
  Ticket,
  Users,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadtab";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { use, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import EventForm from "@/components/forms/event-form";
import EventMediaForm from "@/components/forms/event-media-form";
import EventReviewPublishForm from "@/components/forms/event-review-publish-form";
import EventRichContentForm from "@/components/forms/event-rich-content-form";
import EventSocialSEOForm from "@/components/forms/event-social-seo-form";
import EventTeamMembersForm from "@/components/forms/event-team-members-form";
import { ROUTES } from "@/lib/constants";
import TicketForm from "@/components/forms/ticket-form";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const EVENT_STEPS = [
  {
    id: "event-details",
    label: "Basic Info",
    icon: Calendar,
    required: true,
  },
  { id: "media", label: "Media", icon: Image, required: false },
  { id: "tickets", label: "Ticket Types", icon: Ticket, required: false },
  {
    id: "team-performers",
    label: "Team Members",
    icon: Users,
    required: false,
  },
  { id: "rich-content", label: "Content", icon: FileText, required: false },
  { id: "social-seo", label: "Social", icon: Globe, required: false },
  { id: "review", label: "Review", icon: Check, required: true },
];

type Props = {
  params: Promise<{ id: string }>;
};

export function EditEventContent({ params }: Props) {
  const router = useRouter();
  const { id: eventId } = use(params);

  const isEditMode = Boolean(eventId);
  const [isPublishing, setIsPublishing] = useState(false);
  const { useEvent: useEventQuery, usePublishEvent } = useEvent();
  const publishEvent = usePublishEvent();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("event-details");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<string[]>([]);

  // Load step completion state from localStorage
  useEffect(() => {
    if (eventId) {
      const storedCompleted = localStorage.getItem(
        `event-steps-completed-${eventId}`
      );
      const storedSkipped = localStorage.getItem(
        `event-steps-skipped-${eventId}`
      );

      if (storedCompleted) {
        try {
          const completed = JSON.parse(storedCompleted);
          setCompletedSteps(completed);

          // Don't auto-advance in edit mode - let users access any step they want
        } catch (error) {
          console.warn(
            "Failed to parse completed steps from localStorage:",
            error
          );
        }
      }

      if (storedSkipped) {
        try {
          setSkippedSteps(JSON.parse(storedSkipped));
        } catch (error) {
          console.warn(
            "Failed to parse skipped steps from localStorage:",
            error
          );
        }
      }
    }
  }, [eventId, activeTab]);

  const {
    data: eventData,
    error: eventError,
    isLoading,
  } = useEventQuery(eventId || "");

  const getCurrentStepIndex = () =>
    EVENT_STEPS.findIndex((step) => step.id === activeTab);

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    const nextStep = EVENT_STEPS[currentIndex + 1];
    if (nextStep) {
      setActiveTab(nextStep.id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    const previousStep = EVENT_STEPS[currentIndex - 1];
    if (previousStep) {
      setActiveTab(previousStep.id);
    }
  };

  const handleSkip = () => {
    const currentIndex = getCurrentStepIndex();
    const nextStep = EVENT_STEPS[currentIndex + 1];
    if (nextStep) {
      setSkippedSteps((prev) => {
        const newSkipped = [...prev, activeTab];
        if (eventId) {
          localStorage.setItem(
            `event-steps-skipped-${eventId}`,
            JSON.stringify(newSkipped)
          );
        }
        return newSkipped;
      });
      setActiveTab(nextStep.id);
    }
  };

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newCompleted = [...prev.filter((s) => s !== stepId), stepId];
      if (eventId) {
        localStorage.setItem(
          `event-steps-completed-${eventId}`,
          JSON.stringify(newCompleted)
        );
      }
      return newCompleted;
    });
  };

  const canSkipStep = () => {
    const currentStep = EVENT_STEPS.find((step) => step.id === activeTab);
    return currentStep?.required === false;
  };

  const canGoToPrevious = () => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex > 0;
  };

  const canGoToNext = () => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex < EVENT_STEPS.length - 1;
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const isStepSkipped = (stepId: string) => skippedSteps.includes(stepId);

  const handlePublish = async () => {
    if (!eventId) {
      toast.error("Event must be created before publishing");
      return;
    }

    setIsPublishing(true);
    try {
      await publishEvent.mutateAsync(eventId);
      toast.success("Event published successfully!");

      // Navigate to event details page after publishing
      router.push(ROUTES.DASHBOARD_EVENT_DETAILS(eventId));
    } catch (err) {
      toast.error("Failed to publish event");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto rounded-lg">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Edit3 className="w-6 h-6" />
          Edit Event
        </h1>
        {activeTab === "review" && (
          <Button
            variant="default"
            disabled={
              eventData?.result?.status === "PUBLISHED" ||
              isPublishing ||
              publishEvent.isPending
            }
            onClick={handlePublish}
          >
            {isPublishing || publishEvent.isPending
              ? "Publishing..."
              : "Publish Event"}
          </Button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Step {getCurrentStepIndex() + 1} of {EVENT_STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {completedSteps.length} completed, {skippedSteps.length} skipped
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((getCurrentStepIndex() + 1) / EVENT_STEPS.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Mobile step tiles */}
      <div className="sm:hidden grid grid-cols-4 gap-1 mb-4">
        {EVENT_STEPS.slice(0, 8).map((step) => {
          const Icon = step.icon;
          const isCompleted = isStepCompleted(step.id);
          const isSkipped = isStepSkipped(step.id);
          const isActive = activeTab === step.id;
          const isRequired = step.required;

          return (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label={`Go to ${step.label}`}
                    aria-pressed={isActive}
                    onClick={() => setActiveTab(step.id)}
                    className={`flex flex-col items-center justify-center rounded-lg p-2 border transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-transparent shadow"
                        : isCompleted
                        ? "bg-green-100 text-green-700 border-green-200"
                        : isSkipped
                        ? "bg-gray-100 text-gray-500 border-gray-200"
                        : "bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mb-1 ${
                        isSkipped ? "opacity-50" : ""
                      }`}
                    />
                    <span className="text-xs font-medium">{step.label}</span>
                    {isRequired && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {step.label} {isRequired && "(Required)"}
                  {isCompleted && " ✓"}
                  {isSkipped && " (Skipped)"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="event-details"
        className="space-y-6"
      >
        <TabsList className="hidden sm:grid w-full grid-cols-7 bg-muted p-1 rounded-lg">
          {EVENT_STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = isStepCompleted(step.id);
            const isSkipped = isStepSkipped(step.id);
            const isActive = activeTab === step.id;
            const isRequired = step.required;

            return (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className={`flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2 relative ${
                  isCompleted
                    ? "bg-green-50 text-green-700 border-green-200"
                    : isSkipped
                    ? "bg-gray-50 text-gray-500"
                    : ""
                }`}
                aria-label={`${step.label} ${
                  isRequired ? "(Required)" : "(Optional)"
                } ${
                  isCompleted ? "(Completed)" : isSkipped ? "(Skipped)" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{step.label}</span>
                <span className="lg:hidden">{step.label.split(" ")[0]}</span>
                {isRequired && (
                  <span className="text-xs text-red-500 absolute -top-1 -right-1">
                    *
                  </span>
                )}
                {isCompleted && <span className="text-xs">✓</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="event-details" className="space-y-6">
          <EventForm
            onFormSubmitSuccess={handleNext}
            eventId={eventId}
            onStepComplete={() => handleStepComplete("event-details")}
            onPrevious={handlePrevious}
            canGoPrevious={canGoToPrevious()}
            onNext={handleNext}
            canGoNext={canGoToNext()}
            onSkip={handleSkip}
            canSkip={canSkipStep()}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <EventMediaForm
            onFormSubmitSuccess={handleNext}
            eventId={eventId}
            onStepComplete={() => handleStepComplete("media")}
            onPrevious={handlePrevious}
            canGoPrevious={canGoToPrevious()}
            onNext={handleNext}
            canGoNext={canGoToNext()}
            onSkip={handleSkip}
            canSkip={canSkipStep()}
          />
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <TicketForm
            onFormSubmitSuccess={handleNext}
            eventId={eventId}
            onStepComplete={() => handleStepComplete("tickets")}
            onPrevious={handlePrevious}
            canGoPrevious={canGoToPrevious()}
            onNext={handleNext}
            canGoNext={canGoToNext()}
            onSkip={handleSkip}
            canSkip={canSkipStep()}
          />
        </TabsContent>

        <TabsContent value="team-performers" className="space-y-6">
          <EventTeamMembersForm
            onFormSubmitSuccess={handleNext}
            eventId={eventId}
            onStepComplete={() => handleStepComplete("team-performers")}
            onPrevious={handlePrevious}
            canGoPrevious={canGoToPrevious()}
            onNext={handleNext}
            canGoNext={canGoToNext()}
            onSkip={handleSkip}
            canSkip={canSkipStep()}
          />
        </TabsContent>

        <TabsContent value="rich-content" className="space-y-6">
          <EventRichContentForm
            onFormSubmitSuccess={handleNext}
            eventId={eventId}
            onStepComplete={() => handleStepComplete("rich-content")}
            onPrevious={handlePrevious}
            canGoPrevious={canGoToPrevious()}
            onNext={handleNext}
            canGoNext={canGoToNext()}
            onSkip={handleSkip}
            canSkip={canSkipStep()}
          />
        </TabsContent>

        <TabsContent value="social-seo" className="space-y-6">
          <EventSocialSEOForm
            onFormSubmitSuccess={handleNext}
            eventId={eventId}
            onStepComplete={() => handleStepComplete("social-seo")}
            onPrevious={handlePrevious}
            canGoPrevious={canGoToPrevious()}
            onNext={handleNext}
            canGoNext={canGoToNext()}
            onSkip={handleSkip}
            canSkip={canSkipStep()}
          />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <EventReviewPublishForm
            onFormSubmitSuccess={handlePublish}
            eventId={eventId}
            onStepComplete={() => handleStepComplete("review")}
            onPrevious={handlePrevious}
            canGoPrevious={canGoToPrevious()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
