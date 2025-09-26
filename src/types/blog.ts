import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

/**
 * Enum representing the possible statuses of a blog post
 */
export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

/**
 * Enum representing the possible reaction types for posts and comments
 */
export enum ReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  LAUGH = "LAUGH",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
}

/**
 * Base interfaces
 */
export interface BaseBlogEntity extends TimeStamp {
  id: string;
}

export interface BaseContentEntity extends BaseBlogEntity {
  content: string;
}

export interface BaseReactionEntity extends BaseBlogEntity {
  user: string;
  reaction_type: ReactionType;
}

/**
 * Core interfaces
 */
export interface Reaction extends BaseReactionEntity {
  post?: string;
  comment?: string;
}

export interface Comment extends BaseContentEntity {
  post: string;
  author: string;
  author_name: string;
  parent?: string;
  is_approved: boolean;
  replies: Comment[];
  reactions: Reaction[];
  reaction_count: Record<ReactionType, number>;
}

export interface Post extends BaseContentEntity {
  title: string;
  slug: string;
  excerpt: string;
  featured_image: Nullable<string>;
  author: string;
  author_name: string;
  status: PostStatus;
  publish_date: Nullable<string>;
  tags: string[];
  meta_title: Nullable<string>;
  meta_description: Nullable<string>;
  view_count: number;
  comments: Comment[];
  reactions: Reaction[];
  reaction_count: Record<ReactionType, number>;
}

/**
 * List interfaces
 */
export interface PostListItem
  extends Pick<
    Post,
    | "id"
    | "title"
    | "slug"
    | "excerpt"
    | "featured_image"
    | "author_name"
    | "status"
    | "publish_date"
    | "view_count"
    | "created_at"
  > {
  comment_count: number;
  reaction_count: number;
}

/**
 * Request interfaces
 */
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  status?: PostStatus;
  publish_date?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface CreateCommentRequest {
  post: string;
  content: string;
  parent?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CreateReactionRequest {
  post?: string;
  comment?: string;
  reaction_type: ReactionType;
}

export interface UpdateReactionRequest {
  reaction_type: ReactionType;
}

/**
 * Response interfaces
 */
export interface PostResponse extends SuccessResponse<Post> {}

export interface PostListResponse
  extends SuccessResponse<PaginatedResponse<PostListItem>> {}

export interface CommentResponse extends SuccessResponse<Comment> {}

export interface CommentListResponse
  extends SuccessResponse<PaginatedResponse<Comment>> {}

export interface ReactionResponse extends SuccessResponse<Reaction> {}

export interface BlogTagSearchResponse
  extends SuccessResponse<{ tags: string[] }> {}

/**
 * Query parameter interfaces
 */
export interface PostQueryParams {
  status?: PostStatus;
  author?: string;
  tags?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface CommentQueryParams {
  post?: string;
  author?: string;
  parent?: string;
  is_approved?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface BlogTagSearchQueryParams {
  q: string;
}
