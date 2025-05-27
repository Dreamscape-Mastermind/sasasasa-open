import {
  CommentQueryParams,
  CommentResponse,
  CommentsResponse,
  CreateCommentRequest,
  CreatePostRequest,
  CreateReactionRequest,
  PostQueryParams,
  PostResponse,
  PostsResponse,
  ReactionResponse,
  TagSearchQueryParams,
  TagSearchResponse,
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
  public async listPosts(params?: PostQueryParams): Promise<PostsResponse> {
    return apiClient.get<PostsResponse>(`${this.baseUrl}/blog/posts`, { params });
  }

  public async getPost(slug: string): Promise<PostResponse> {
    return apiClient.get<PostResponse>(`${this.baseUrl}/blog/posts/${slug}`);
  }

  public async createPost(data: CreatePostRequest): Promise<PostResponse> {
    return apiClient.post<PostResponse>(`${this.baseUrl}/blog/posts`, data);
  }

  public async updatePost(slug: string, data: UpdatePostRequest): Promise<PostResponse> {
    return apiClient.patch<PostResponse>(`${this.baseUrl}/blog/posts/${slug}`, data);
  }

  public async deletePost(slug: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/blog/posts/${slug}`);
  }

  public async publishPost(slug: string): Promise<PostResponse> {
    return apiClient.post<PostResponse>(`${this.baseUrl}/blog/posts/${slug}/publish`);
  }

  public async archivePost(slug: string): Promise<PostResponse> {
    return apiClient.post<PostResponse>(`${this.baseUrl}/blog/posts/${slug}/archive`);
  }

  public async incrementViewCount(slug: string): Promise<PostResponse> {
    return apiClient.post<PostResponse>(`${this.baseUrl}/blog/posts/${slug}/increment_view_count`);
  }

  public async searchTags(params: TagSearchQueryParams): Promise<TagSearchResponse> {
    return apiClient.get<TagSearchResponse>(`${this.baseUrl}/blog/posts/search_tags`, { params });
  }

  /**
   * Comment operations
   */
  public async listComments(params?: CommentQueryParams): Promise<CommentsResponse> {
    return apiClient.get<CommentsResponse>(`${this.baseUrl}/blog/comments`, { params });
  }

  public async getComment(id: string): Promise<CommentResponse> {
    return apiClient.get<CommentResponse>(`${this.baseUrl}/blog/comments/${id}`);
  }

  public async createComment(data: CreateCommentRequest): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(`${this.baseUrl}/blog/comments`, data);
  }

  public async updateComment(id: string, data: UpdateCommentRequest): Promise<CommentResponse> {
    return apiClient.patch<CommentResponse>(`${this.baseUrl}/blog/comments/${id}`, data);
  }

  public async deleteComment(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/blog/comments/${id}`);
  }

  public async approveComment(id: string): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(`${this.baseUrl}/blog/comments/${id}/approve`);
  }

  public async denyComment(id: string): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(`${this.baseUrl}/blog/comments/${id}/deny`);
  }

  /**
   * Reaction operations
   */
  public async createReaction(data: CreateReactionRequest): Promise<ReactionResponse> {
    return apiClient.post<ReactionResponse>(`${this.baseUrl}/blog/reactions`, data);
  }

  public async updateReaction(id: string, data: UpdateReactionRequest): Promise<ReactionResponse> {
    return apiClient.patch<ReactionResponse>(`${this.baseUrl}/blog/reactions/${id}`, data);
  }

  public async deleteReaction(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/blog/reactions/${id}`);
  }
}

export const blogService = BlogService.getInstance();
