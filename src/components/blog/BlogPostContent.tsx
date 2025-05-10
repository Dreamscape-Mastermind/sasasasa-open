import { BlogPost } from "@/types/blog";
import { CommentSection } from "@/components/blog/CommentSection";
import { ReactionButtons } from "@/components/blog/ReactionButtons";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <header className="py-12">
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="mb-8 aspect-video w-full rounded-lg object-cover"
          />
        )}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>By {post.author_name}</span>
          <span>•</span>
          <time dateTime={post.publish_date || post.created_at}>
            {new Date(
              post.publish_date || post.created_at
            ).toLocaleDateString()}
          </time>
        </div>
      </header>

      <div className="prose prose-lg dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
        <ReactionButtons postId={post.id} reactions={post.reaction_count} />
      </div>

      <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}
