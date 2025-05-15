import { ReactionType } from "@/types/blog";
import { useAuth } from "@/context/auth-context";
import { useQueryClient } from "@tanstack/react-query";

interface UseReactionsProps {
  queryKey: string[];
  id: string;
}

export function useReactions({ queryKey, id }: UseReactionsProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleReactionSuccess = (reaction: any) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;
      const reactions = oldData.reactions || [];
      const reactionCounts = reactions.reduce((acc, r) => {
        acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
        return acc;
      }, {} as Record<ReactionType, number>);

      return {
        ...oldData,
        reactions: [...reactions, reaction],
        reaction_counts: {
          ...reactionCounts,
          [reaction.reaction_type]:
            (reactionCounts[reaction.reaction_type] || 0) + 1,
        },
      };
    });
  };

  const handleReactionUpdate = (
    oldType: ReactionType,
    newType: ReactionType
  ) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;
      const reactions = oldData.reactions || [];
      const updatedReactions = reactions.map((r) =>
        r.user === user?.id ? { ...r, reaction_type: newType } : r
      );
      const reactionCounts = updatedReactions.reduce((acc, r) => {
        acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
        return acc;
      }, {} as Record<ReactionType, number>);

      return {
        ...oldData,
        reactions: updatedReactions,
        reaction_counts: reactionCounts,
      };
    });
  };

  const handleReactionRemove = (reactionType: ReactionType) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;
      const reactions = oldData.reactions || [];
      const updatedReactions = reactions.filter((r) => r.user !== user?.id);
      const reactionCounts = updatedReactions.reduce((acc, r) => {
        acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
        return acc;
      }, {} as Record<ReactionType, number>);

      return {
        ...oldData,
        reactions: updatedReactions,
        reaction_counts: reactionCounts,
      };
    });
  };

  const getReactionsRecord = (reactions: any[] = []) => {
    return reactions.reduce((acc, reaction) => {
      acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
      return acc;
    }, {} as Record<ReactionType, number>);
  };

  return {
    handleReactionSuccess,
    handleReactionUpdate,
    handleReactionRemove,
    getReactionsRecord,
  };
}
