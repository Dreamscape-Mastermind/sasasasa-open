"use client";

import { Angry, Frown, Heart, Smile, Star, ThumbsUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ReactionType } from "@/types/blog";
import { useBlog } from "@/hooks/useBlog";

interface ReactionButtonsProps {
  postSlug?: string;
  commentId?: string;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;
  userReactionId?: string;
  onReactionSuccess?: (reaction: any) => void;
  onReactionUpdate?: (oldType: ReactionType, newType: ReactionType) => void;
  onReactionRemove?: (type: ReactionType) => void;
}

const REACTION_ICONS: Record<ReactionType, React.ReactNode> = {
  LIKE: <ThumbsUp className="h-4 w-4" />,
  LOVE: <Heart className="h-4 w-4" />,
  LAUGH: <Smile className="h-4 w-4" />,
  WOW: <Star className="h-4 w-4" />,
  SAD: <Frown className="h-4 w-4" />,
  ANGRY: <Angry className="h-4 w-4" />,
};

export function ReactionButtons({
  postSlug,
  commentId,
  reactions,
  userReaction,
  userReactionId,
  onReactionSuccess,
  onReactionUpdate,
  onReactionRemove,
}: ReactionButtonsProps) {
  const [selectedReaction, setSelectedReaction] = useState<
    ReactionType | undefined
  >(userReaction);
  const [currentReactionId, setCurrentReactionId] = useState<
    string | undefined
  >(userReactionId);

  const { useCreateReaction, useUpdateReaction, useDeleteReaction } = useBlog();
  const { mutate: addReaction } = useCreateReaction();
  const { mutate: updateReaction } = useUpdateReaction(userReactionId || "");
  const { mutate: removeReaction } = useDeleteReaction();

  // Update local state when props change
  useEffect(() => {
    setSelectedReaction(userReaction);
    setCurrentReactionId(userReactionId);
  }, [userReaction, userReactionId]);

  const handleReaction = (type: ReactionType) => {
    if (selectedReaction === type) {
      // Remove reaction
      if (currentReactionId) {
        removeReaction(currentReactionId, {
          onSuccess: () => {
            setSelectedReaction(undefined);
            setCurrentReactionId(undefined);
            onReactionRemove?.(type);
          },
        });
      }
    } else if (currentReactionId) {
      // Update existing reaction
      updateReaction(
        { reaction_type: type },
        {
          onSuccess: () => {
            setSelectedReaction(type);
            onReactionUpdate?.(selectedReaction!, type);
          },
        }
      );
    } else {
      // Add new reaction
      addReaction(
        {
          ...(postSlug ? { post: postSlug } : {}),
          ...(commentId ? { comment: commentId } : {}),
          reaction_type: type,
        },
        {
          onSuccess: (reaction: ReactionResponse) => {
            setSelectedReaction(type);
            setCurrentReactionId(reaction.result.id);
            onReactionSuccess?.(reaction);
          },
        }
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {Object.entries(REACTION_ICONS).map(([type, icon]) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant={selectedReaction === type ? "default" : "ghost"}
                size="sm"
                onClick={() => handleReaction(type as ReactionType)}
                className="relative"
              >
                {icon}
                {reactions[type as ReactionType] > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {reactions[type as ReactionType]}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="capitalize">{type.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
