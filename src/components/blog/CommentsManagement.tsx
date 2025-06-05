"use client";

import {
  Angry,
  ChevronDown,
  ChevronUp,
  Frown,
  Heart,
  MessageSquare,
  Smile,
  Star,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { Comment, ReactionType } from "@/types/blog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReactionButtons } from "@/components/blog/ReactionButtons";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/hooks/useBlog";
import { useReactions } from "@/hooks/useReactions";
import { useState } from "react";

const REACTION_ICONS: Record<ReactionType, React.ReactNode> = {
  LIKE: <ThumbsUp className="h-4 w-4" />,
  LOVE: <Heart className="h-4 w-4" />,
  LAUGH: <Smile className="h-4 w-4" />,
  WOW: <Star className="h-4 w-4" />,
  SAD: <Frown className="h-4 w-4" />,
  ANGRY: <Angry className="h-4 w-4" />,
};

export function CommentsManagement() {
  const { useComments, useCreateComment, useDeleteComment } = useBlog();
  const { data: commentsResponse, isLoading } = useComments();
  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: createComment } = useCreateComment();
  const { user, isAuthenticated } = useAuth();
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [activeReactionPopover, setActiveReactionPopover] = useState<
    string | null
  >(null);

  const {
    handleReactionSuccess,
    handleReactionUpdate,
    handleReactionRemove,
    getReactionsRecord,
  } = useReactions({
    queryKey: ["comments"],
    id: "comments",
  });

  const handleDelete = (id: string) => {
    deleteComment(id, {
      onSuccess: () => {
        toast.success("Comment deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete comment: ${error.message}`);
      },
    });
  };

  const toggleComment = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleReply = (comment: Comment) => {
    if (!replyContent[comment.id]) {
      toast.error("Please enter a reply");
      return;
    }

    createComment(
      {
        post: comment.post,
        content: replyContent[comment.id],
        parent: comment.id,
      },
      {
        onSuccess: () => {
          toast.success("Reply posted successfully");
          setReplyContent((prev) => ({ ...prev, [comment.id]: "" }));
          setReplyingTo(null);
        },
        onError: (error) => {
          toast.error(`Failed to post reply: ${error.message}`);
        },
      }
    );
  };

  const renderCommentActions = (comment: Comment) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(comment.id)}
        title="Delete comment"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          setReplyingTo(replyingTo === comment.id ? null : comment.id)
        }
        title="Reply to comment"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderReactionButton = (comment: Comment) => {
    const reactionsRecord = getReactionsRecord(comment.reactions) as Record<
      ReactionType,
      number
    >;
    const totalReactions = Object.values(reactionsRecord).reduce(
      (sum: number, count: number) => sum + count,
      0
    );
    const userReaction = comment.reactions?.find(
      (r) => r.user === user?.id
    )?.reaction_type;

    return (
      <Popover
        open={activeReactionPopover === comment.id}
        onOpenChange={(open) =>
          setActiveReactionPopover(open ? comment.id : null)
        }
      >
        <PopoverTrigger asChild>
          <Button
            variant={userReaction ? "default" : "ghost"}
            size="sm"
            className="relative"
            onClick={(e) => {
              e.stopPropagation();
              setActiveReactionPopover(
                activeReactionPopover === comment.id ? null : comment.id
              );
            }}
          >
            {userReaction ? (
              REACTION_ICONS[userReaction]
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
            {totalReactions > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {totalReactions}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <ReactionButtons
            commentId={comment.id}
            reactions={reactionsRecord}
            userReaction={userReaction}
            userReactionId={
              comment.reactions?.find((r) => r.user === user?.id)?.id
            }
            onReactionSuccess={(reaction) => {
              handleReactionSuccess(reaction);
              setActiveReactionPopover(null);
            }}
            onReactionUpdate={(oldType, newType) => {
              handleReactionUpdate(oldType, newType);
              setActiveReactionPopover(null);
            }}
            onReactionRemove={(type) => {
              handleReactionRemove(type);
              setActiveReactionPopover(null);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  };

  const renderComment = (comment: Comment, isReply = false) => {
    return (
      <div key={comment.id} className={`${isReply ? "ml-8 mt-2" : ""}`}>
        <div
          className={`rounded-lg border p-3 ${isReply ? "bg-muted/50" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{comment.author_name}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <Badge variant={comment.is_approved ? "default" : "secondary"}>
              {comment.is_approved ? "Approved" : "Pending"}
            </Badge>
          </div>
          <p className="mt-2">{comment.content}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {comment.replies?.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComment(comment.id)}
                >
                  {expandedComments.has(comment.id) ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  {comment.replies.length} replies
                </Button>
              )}
              {renderReactionButton(comment)}
            </div>
            {renderCommentActions(comment)}
          </div>
        </div>

        {expandedComments.has(comment.id) && comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}

        {replyingTo === comment.id && (
          <div className="mt-2 p-3 border rounded-lg bg-muted/30">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent[comment.id] || ""}
              onChange={(e) =>
                setReplyContent((prev) => ({
                  ...prev,
                  [comment.id]: e.target.value,
                }))
              }
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleReply(comment)}>Post Reply</Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const comments = commentsResponse?.result?.results || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
        <p className="text-muted-foreground">
          Manage and moderate blog post comments.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading comments...</div>
        ) : (
          comments
            .filter((comment) => !comment.parent) // Only show top-level comments
            .map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
