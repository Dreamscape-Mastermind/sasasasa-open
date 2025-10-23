import {
  BlogTagSearchQueryParams,
  BlogTagSearchResponse,
  CommentListResponse,
  CommentQueryParams,
  CommentResponse,
  CreateCommentRequest,
  CreatePostRequest,
  CreateReactionRequest,
  PostListResponse,
  PostQueryParams,
  PostResponse,
  ReactionResponse,
  UpdateCommentRequest,
  UpdatePostRequest,
  UpdateReactionRequest,
} from "@/types/blog";

import { apiClient } from "./api.service";

/**
 * Blog service for handling all blog-related operations
 */
class BlogService {
  private static instance: BlogService;
  private readonly baseUrl = "/api/v1";

  private constructor() {}

  public static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  /**
   * Post operations
   */
  public async listPosts(params?: PostQueryParams): Promise<PostListResponse> {
    return apiClient.get<PostListResponse>(`${this.baseUrl}/blog/posts`, {
      params,
    });
  }

  public async getPost(slug: string): Promise<PostResponse> {
    return apiClient.get<PostResponse>(`${this.baseUrl}/blog/posts/${slug}`);
  }

  public async createPost(data: CreatePostRequest): Promise<PostResponse> {
    const formData = new FormData();

    // Handle file uploads
    if (data.featured_image && typeof data.featured_image !== "string") {
      formData.append("featured_image", data.featured_image);
    }

    if (data.audio_file && typeof data.audio_file !== "string") {
      formData.append("audio_file", data.audio_file);
    }

    // Add other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "featured_image" && key !== "audio_file") {
        formData.append(
          key,
          typeof value === "string" ? value : JSON.stringify(value)
        );
      }
    });

    return apiClient.post<PostResponse>(
      `${this.baseUrl}/blog/posts`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  public async updatePost(
    slug: string,
    data: UpdatePostRequest
  ): Promise<PostResponse> {
    const formData = new FormData();

    // Handle file uploads
    if (data.featured_image && typeof data.featured_image !== "string") {
      formData.append("featured_image", data.featured_image);
    }

    if (data.audio_file && typeof data.audio_file !== "string") {
      formData.append("audio_file", data.audio_file);
    }

    // Add other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "featured_image" && key !== "audio_file") {
        formData.append(
          key,
          typeof value === "string" ? value : JSON.stringify(value)
        );
      }
    });

    return apiClient.patch<PostResponse>(
      `${this.baseUrl}/blog/posts/${slug}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  public async deletePost(slug: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/blog/posts/${slug}`);
  }

  public async publishPost(slug: string): Promise<PostResponse> {
    return apiClient.post<PostResponse>(
      `${this.baseUrl}/blog/posts/${slug}/publish`
    );
  }

  public async archivePost(slug: string): Promise<PostResponse> {
    return apiClient.post<PostResponse>(
      `${this.baseUrl}/blog/posts/${slug}/archive`
    );
  }

  public async incrementViewCount(slug: string): Promise<PostResponse> {
    return apiClient.post<PostResponse>(
      `${this.baseUrl}/blog/posts/${slug}/increment_view_count`
    );
  }

  public async searchTags(
    params: BlogTagSearchQueryParams
  ): Promise<BlogTagSearchResponse> {
    return apiClient.get<BlogTagSearchResponse>(
      `${this.baseUrl}/blog/posts/search_tags`,
      { params }
    );
  }

  /**
   * Comment operations
   */
  public async listComments(
    params?: CommentQueryParams
  ): Promise<CommentListResponse> {
    return apiClient.get<CommentListResponse>(`${this.baseUrl}/blog/comments`, {
      params,
    });
  }

  public async getComment(id: string): Promise<CommentResponse> {
    return apiClient.get<CommentResponse>(
      `${this.baseUrl}/blog/comments/${id}`
    );
  }

  public async createComment(
    data: CreateCommentRequest
  ): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(
      `${this.baseUrl}/blog/comments`,
      data
    );
  }

  public async updateComment(
    id: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse> {
    return apiClient.patch<CommentResponse>(
      `${this.baseUrl}/blog/comments/${id}`,
      data
    );
  }

  public async deleteComment(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/blog/comments/${id}`);
  }

  public async approveComment(id: string): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(
      `${this.baseUrl}/blog/comments/${id}/approve`
    );
  }

  public async denyComment(id: string): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(
      `${this.baseUrl}/blog/comments/${id}/deny`
    );
  }

  /**
   * Reaction operations
   */
  public async createReaction(
    data: CreateReactionRequest
  ): Promise<ReactionResponse> {
    return apiClient.post<ReactionResponse>(
      `${this.baseUrl}/blog/reactions`,
      data
    );
  }

  public async updateReaction(
    id: string,
    data: UpdateReactionRequest
  ): Promise<ReactionResponse> {
    return apiClient.patch<ReactionResponse>(
      `${this.baseUrl}/blog/reactions/${id}`,
      data
    );
  }

  public async deleteReaction(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/blog/reactions/${id}`);
  }
}

export const blogService = BlogService.getInstance();
