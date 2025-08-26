import type {
  CommentQueryParams,
  CreateCommentRequest,
  CreatePostRequest,
  CreateReactionRequest,
  PostQueryParams,
  UpdateCommentRequest,
  UpdatePostRequest,
  UpdateReactionRequest,
} from "@/types/blog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { blogService } from "@/services/blog.service";

export const useBlog = () => {
  const queryClient = useQueryClient();

  // Posts
  const usePosts = (params?: PostQueryParams) => {
    return useQuery({
      queryKey: ["posts", params],
      queryFn: () => blogService.listPosts(params),
    });
  };

  const usePost = (slug: string) => {
    return useQuery({
      queryKey: ["post", slug],
      queryFn: () => blogService.getPost(slug),
    });
  };

  const useCreatePost = () => {
    return useMutation({
      mutationFn: (data: CreatePostRequest) => blogService.createPost(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    });
  };

  const useUpdatePost = (slug: string) => {
    return useMutation({
      mutationFn: (data: UpdatePostRequest) =>
        blogService.updatePost(slug, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["post", slug] });
      },
    });
  };

  const useDeletePost = () => {
    return useMutation({
      mutationFn: (slug: string) => blogService.deletePost(slug),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    });
  };

  const usePublishPost = () => {
    return useMutation({
      mutationFn: (slug: string) => blogService.publishPost(slug),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    });
  };

  const useArchivePost = () => {
    return useMutation({
      mutationFn: (slug: string) => blogService.archivePost(slug),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    });
  };

  // Comments
  const useComments = (params?: CommentQueryParams) => {
    return useQuery({
      queryKey: ["comments", params],
      queryFn: () => blogService.listComments(params),
    });
  };

  const useComment = (id: string) => {
    return useQuery({
      queryKey: ["comment", id],
      queryFn: () => blogService.getComment(id),
    });
  };

  const useCreateComment = () => {
    return useMutation({
      mutationFn: (data: CreateCommentRequest) =>
        blogService.createComment(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["comments"] });
        if (variables.post) {
          queryClient.invalidateQueries({ queryKey: ["post", variables.post] });
        }
      },
    });
  };

  const useUpdateComment = (id: string) => {
    return useMutation({
      mutationFn: (data: UpdateCommentRequest) =>
        blogService.updateComment(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["comments"] });
        queryClient.invalidateQueries({ queryKey: ["comment", id] });
      },
    });
  };

  const useDeleteComment = () => {
    return useMutation({
      mutationFn: (id: string) => blogService.deleteComment(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      },
    });
  };

  // Reactions
  const useCreateReaction = () => {
    return useMutation({
      mutationFn: (data: CreateReactionRequest) =>
        blogService.createReaction(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      },
    });
  };

  const useUpdateReaction = (id: string) => {
    return useMutation({
      mutationFn: (data: UpdateReactionRequest) =>
        blogService.updateReaction(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      },
    });
  };

  const useDeleteReaction = () => {
    return useMutation({
      mutationFn: (id: string) => blogService.deleteReaction(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      },
    });
  };

  const useIncrementViewCount = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (slug: string) => blogService.incrementViewCount(slug),
      onSuccess: (viewCount, slug) => {
        // Update the view count in the blog post cache
        queryClient.setQueryData(["post", slug], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            view_count: viewCount,
          };
        });
      },
    });
  };

  return {
    // Posts
    usePosts,
    usePost,
    useCreatePost,
    useUpdatePost,
    useDeletePost,
    usePublishPost,
    useArchivePost,
    // Comments
    useComments,
    useComment,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
    // Reactions
    useCreateReaction,
    useUpdateReaction,
    useDeleteReaction,
    // Views
    useIncrementViewCount,
  };
};
