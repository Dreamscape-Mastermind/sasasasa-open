import type { ApiResponse, PaginatedResponse } from "./common";

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ReactionType = "LIKE" | "LOVE" | "LAUGH" | "WOW" | "SAD" | "ANGRY";

export interface ReactionCount {
  LIKE: number;
  LOVE: number;
  LAUGH: number;
  WOW: number;
  SAD: number;
  ANGRY: number;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author: number;
  author_name: string;
  status: BlogPostStatus;
  publish_date: string | null;
  tags: string[];
  meta_title: string;
  meta_description: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  comments: Comment[];
  reactions: Reaction[];
  reaction_count: ReactionCount;
}

export interface BlogPostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  status: BlogPostStatus;
  publish_date: string;
  view_count: number;
  comment_count: number;
  reaction_count: number;
  created_at: string;
}

export interface Comment {
  id: number;
  post: number;
  author: number;
  author_name: string;
  content: string;
  parent: number | null;
  is_approved: boolean;
  created_at: string;
  replies: Comment[];
  reactions: Reaction[];
  reaction_count: ReactionCount;
}

export interface Reaction {
  id: number;
  user: number;
  reaction_type: ReactionType;
  post?: number;
  comment?: number;
  created_at: string;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt: string;
  featured_image: File;
  tags: string[];
  meta_title: string;
  meta_description: string;
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  featured_image?: File;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface CreateCommentRequest {
  post: number;
  content: string;
  parent?: number;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface AddReactionRequest {
  post?: number;
  comment?: number;
  reaction_type: ReactionType;
}

export interface BlogListQueryParams {
  status?: BlogPostStatus;
  author?: number;
  tags?: string;
  search?: string;
  ordering?: "created_at" | "publish_date" | "view_count";
}

export interface CommentListQueryParams {
  post?: number;
  author?: number;
  parent?: number;
}

export interface BlogResponse<T> {
  status: "success" | "error";
  message: string;
  result: T;
  error_data?: {
    detail: string;
  };
}

export type BlogPostResponse = ApiResponse<BlogPost>;
export type BlogPostListResponse = ApiResponse<
  PaginatedResponse<BlogPostListItem>
>;
export type CommentListResponse = ApiResponse<PaginatedResponse<Comment>>;
export type CommentResponse = ApiResponse<Comment>;
export type ReactionResponse = ApiResponse<Reaction>;
export type SuccessResponse = ApiResponse<null>;
