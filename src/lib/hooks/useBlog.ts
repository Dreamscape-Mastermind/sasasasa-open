import {
  AddReactionRequest,
  BlogListQueryParams,
  Comment,
  CommentListQueryParams,
  CreateBlogPostRequest,
  CreateCommentRequest,
  UpdateBlogPostRequest,
  UpdateCommentRequest,
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
      queryClient.invalidateQueries({
        queryKey: ["blog-post", variables.post],
      });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommentRequest }) =>
      blogApi.updateComment(id, data),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", comment.post] });
    },
  });
};

export const useApproveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => blogApi.approveComment(id),
    onSuccess: (comment: Comment | null) => {
      if (comment) {
        queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
        queryClient.invalidateQueries({
          queryKey: ["blog-post", comment.post],
        });
      }
    },
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddReactionRequest) => blogApi.addReaction(data),
    onSuccess: (_, data) => {
      if (data.post) {
        queryClient.invalidateQueries({ queryKey: ["blog-post", data.post] });
      }
      if (data.comment) {
        queryClient.invalidateQueries({ queryKey: ["blog-comments"] });
      }
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => blogApi.removeReaction(id),
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
