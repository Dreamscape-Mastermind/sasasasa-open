import {
  AddReactionRequest,
  BlogListQueryParams,
  BlogPostListResponse,
  BlogPostResponse,
  CommentListQueryParams,
  CommentListResponse,
  CommentResponse,
  CreateBlogPostRequest,
  CreateCommentRequest,
  ReactionResponse,
  SuccessResponse,
  UpdateBlogPostRequest,
  UpdateCommentRequest,
} from "@/types/blog";

import axios from "./axios";

export const blogApi = {
  // Blog Posts
  getPosts: async (params?: BlogListQueryParams) => {
    const response = await axios.get<BlogPostListResponse>(
      "/api/v1/blog/posts",
      {
        params,
      }
    );
    return response.data.result;
  },

  getPost: async (slug: string) => {
    const response = await axios.get<BlogPostResponse>(
      `/api/v1/blog/posts/${slug}`
    );
    return response.data.result;
  },

  createPost: async (data: CreateBlogPostRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "tags") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    const response = await axios.post<BlogPostResponse>(
      "/api/v1/blog/posts",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.result;
  },

  updatePost: async (slug: string, data: UpdateBlogPostRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "tags") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    const response = await axios.put<BlogPostResponse>(
      `/api/v1/blog/posts/${slug}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.result;
  },

  publishPost: async (slug: string) => {
    const response = await axios.post<SuccessResponse>(
      `/api/v1/blog/posts/${slug}/publish`
    );
    return response.data.result;
  },

  archivePost: async (slug: string) => {
    const response = await axios.post<SuccessResponse>(
      `/api/v1/blog/posts/${slug}/archive`
    );
    return response.data.result;
  },

  // Comments
  getComments: async (params?: CommentListQueryParams) => {
    const response = await axios.get<CommentListResponse>(
      "/api/v1/blog/comments",
      {
        params,
      }
    );
    return response.data.result;
  },

  createComment: async (data: CreateCommentRequest) => {
    const response = await axios.post<CommentResponse>(
      "/api/v1/blog/comments",
      data
    );
    return response.data.result;
  },

  updateComment: async (id: number, data: UpdateCommentRequest) => {
    const response = await axios.put<CommentResponse>(
      `/api/v1/blog/comments/${id}`,
      data
    );
    return response.data.result;
  },

  approveComment: async (id: number) => {
    const response = await axios.post<CommentResponse>(
      `/api/v1/blog/comments/${id}/approve`
    );
    return response.data.result;
  },

  // Reactions
  addReaction: async (data: AddReactionRequest) => {
    const response = await axios.post<ReactionResponse>(
      "/api/v1/blog/reactions",
      data
    );
    return response.data.result;
  },

  removeReaction: async (id: number) => {
    const response = await axios.delete<SuccessResponse>(
      `/api/v1/blog/reactions/${id}`
    );
    return response.data.result;
  },
};
