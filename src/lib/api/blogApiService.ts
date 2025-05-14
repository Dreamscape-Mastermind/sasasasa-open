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
  TagSearchResponse,
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

    console.log(response);
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

    // Append all text fields
    formData.append("title", data.title);
    formData.append("content", data.content);
    if (data.excerpt) formData.append("excerpt", data.excerpt);
    if (data.status) formData.append("status", data.status);
    if (data.meta_title) formData.append("meta_title", data.meta_title);
    if (data.meta_description)
      formData.append("meta_description", data.meta_description);

    // Append tags as comma-separated string
    formData.append("tags", JSON.stringify(data.tags));

    // Append file if exists
    if (data.featured_image) {
      formData.append("featured_image", data.featured_image);
    }

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

    // Only append fields that have changed
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.content !== undefined) formData.append("content", data.content);
    if (data.excerpt !== undefined) formData.append("excerpt", data.excerpt);
    if (data.status !== undefined) formData.append("status", data.status);
    if (data.meta_title !== undefined)
      formData.append("meta_title", data.meta_title);
    if (data.meta_description !== undefined)
      formData.append("meta_description", data.meta_description);

    // Only append tags if they were changed
    if (data.tags !== undefined) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Only append featured_image if it was changed
    if (data.featured_image !== undefined) {
      formData.append("featured_image", data.featured_image);
    }

    const response = await axios.patch<BlogPostResponse>(
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

  searchTags: async (query: string) => {
    const response = await axios.get<TagSearchResponse>(
      "/api/v1/blog/posts/search_tags",
      {
        params: { q: query },
      }
    );
    return response.data.result.tags;
  },
};
