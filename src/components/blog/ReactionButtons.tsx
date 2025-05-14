"use client";

import { Angry, Frown, Heart, Smile, Star, ThumbsUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAddReaction, useRemoveReaction } from "@/lib/hooks/useBlog";

import { Button } from "@/components/ui/button";
import { ReactionType } from "@/types/blog";
import { useState } from "react";

interface ReactionButtonsProps {
  postId: number;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;
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
  postId,
  reactions,
  userReaction,
}: ReactionButtonsProps) {
  const [selectedReaction, setSelectedReaction] = useState<
    ReactionType | undefined
  >(userReaction);
  const { mutate: addReaction } = useAddReaction();
  const { mutate: removeReaction } = useRemoveReaction();

  const handleReaction = (type: ReactionType) => {
    if (selectedReaction === type) {
      // Remove reaction
      removeReaction(postId);
      setSelectedReaction(undefined);
    } else {
      // Add new reaction
      addReaction({
        post: postId,
        reaction_type: type,
      });
      setSelectedReaction(type);
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
