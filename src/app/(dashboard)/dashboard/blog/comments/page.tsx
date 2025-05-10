"use client";

import {
  useBlogComments,
  useApproveComment,
  useCreateComment,
} from "@/lib/hooks/useBlog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/types/blog";

export default function CommentsPage() {
  const { data: comments, isLoading } = useBlogComments();
  const { mutate: approveComment } = useApproveComment();
  const { mutate: createComment } = useCreateComment();
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleApprove = (id: number) => {
    approveComment(id, {
      onSuccess: () => {
        toast.success("Comment approved successfully");
      },
      onError: (error) => {
        toast.error(`Failed to approve comment: ${error.message}`);
      },
    });
  };

  const toggleComment = (id: number) => {
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

  const renderReplies = (comment: Comment) => {
    if (!comment.replies?.length) return null;

    return (
      <div className="ml-8 mt-2 space-y-2">
        {comment.replies.map((reply) => (
          <div key={reply.id} className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="font-medium">{reply.author_name}</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(reply.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm">{reply.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
        <p className="text-muted-foreground">
          Manage and moderate blog post comments.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading comments...
                </TableCell>
              </TableRow>
            ) : (
              comments?.results.map((comment) => (
                <>
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium">
                      {comment.author_name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="space-y-2">
                        <p className="truncate">
                          {truncateText(comment.content, 100)}
                        </p>
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
                      </div>
                    </TableCell>
                    <TableCell>{comment.post}</TableCell>
                    <TableCell>
                      <Badge
                        variant={comment.is_approved ? "default" : "secondary"}
                      >
                        {comment.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(comment.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!comment.is_approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(comment.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment.id ? null : comment.id
                            )
                          }
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedComments.has(comment.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30">
                        {renderReplies(comment)}
                      </TableCell>
                    </TableRow>
                  )}
                  {replyingTo === comment.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="p-4 space-y-2">
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
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setReplyingTo(null)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={() => handleReply(comment)}>
                              Post Reply
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
