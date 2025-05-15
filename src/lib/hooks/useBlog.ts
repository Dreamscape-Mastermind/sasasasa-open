import {
  AddReactionRequest,
  BlogListQueryParams,
  CommentListQueryParams,
  CreateBlogPostRequest,
  CreateCommentRequest,
  UpdateBlogPostRequest,
  UpdateCommentRequest,
  UpdateReactionRequest,
} from "@/types/blog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { blogApi } from "../api/blogApiService";

// Query hooks
export const useBlogPosts = (params?: BlogListQueryParams) => {
  return useQuery({
    queryKey: ["blog-posts", params],
    queryFn: () => blogApi.getPosts(params),
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogApi.getPost(slug),
  });
};

export const useBlogComments = (params?: CommentListQueryParams) => {
  return useQuery({
    queryKey: ["blog-comments", params],
    queryFn: () => blogApi.getComments(params),
    select: (data) => data.results,
  });
};

export const useBlogComment = (id: string) => {
  return useQuery({
    queryKey: ["blog-comment", id],
    queryFn: () => blogApi.getComment(id),
  });
};

// Mutation hooks
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogPostRequest) => blogApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: UpdateBlogPostRequest;
    }) => blogApi.updatePost(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] });
    },
  });
};

export const usePublishBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => blogApi.publishPost(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] });
    },
  });
};

export const useArchiveBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => blogApi.archivePost(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] });
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => blogApi.createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      if (variables.post) {
        queryClient.invalidateQueries({
          queryKey: ["blog-post", variables.post],
        });
      }
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentRequest }) =>
      blogApi.updateComment(id, data),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      queryClient.invalidateQueries({
        queryKey: ["blog-comment", comment.comment_id],
      });
    },
  });
};

export const useApproveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.approveComment(id),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      queryClient.invalidateQueries({
        queryKey: ["blog-comment", comment.comment_id],
      });
    },
  });
};

export const useDenyComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.denyComment(id),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      queryClient.invalidateQueries({
        queryKey: ["blog-comment", comment.comment_id],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
    },
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddReactionRequest) => blogApi.addReaction(data),
    onSuccess: (reaction) => {
      if (reaction.post) {
        queryClient.invalidateQueries({
          queryKey: ["blog-post", reaction.post],
        });
      }
      if (reaction.comment) {
        queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      }
    },
  });
};

export const useUpdateReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReactionRequest }) =>
      blogApi.updateReaction(id, data),
    onSuccess: (reaction) => {
      if (reaction.post) {
        queryClient.invalidateQueries({
          queryKey: ["blog-post", reaction.post],
        });
      }
      if (reaction.comment) {
        queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      }
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.removeReaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
    },
  });
};

export const useSearchTags = (query: string) => {
  return useQuery({
    queryKey: ["blog-tags", query],
    queryFn: () => blogApi.searchTags(query),
    enabled: query.length > 0,
  });
};

export const useIncrementViewCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => blogApi.incrementViewCount(slug),
    onSuccess: (viewCount, slug) => {
      // Update the view count in the blog post cache
      queryClient.setQueryData(["blog-post", slug], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          view_count: viewCount,
        };
      });
    },
  });
};
