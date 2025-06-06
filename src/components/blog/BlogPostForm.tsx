"use client";

import {
  CreatePostRequest,
  Post,
  PostStatus,
  UpdatePostRequest,
} from "@/types/blog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { useBlog } from "@/hooks/useBlog";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  tags: z.string(),
  featured_image: z.union([z.string(), z.instanceof(File)]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogPostFormProps {
  post?: Post;
  mode: "create" | "edit";
  slug?: string;
}

const EditorPopup = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  const handleSave = () => {
    onChange(localContent);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {content ? "Edit Content" : "Add Content"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{content ? "Edit Content" : "Add Content"}</DialogTitle>
          <DialogDescription>
            {content
              ? "Edit the content of the blog post."
              : "Add content to the blog post."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <SimpleEditor content={localContent} onChange={setLocalContent} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function BlogPostForm({
  post: initialPost,
  mode,
  slug,
}: BlogPostFormProps) {
  const router = useRouter();
  const { usePost, useCreatePost, useUpdatePost } = useBlog();
  const { data: fetchedPost, isLoading } = usePost(slug || "");
  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost(
    slug || ""
  );

  const post = initialPost || (slug ? fetchedPost?.result : null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      status: post?.status || "DRAFT",
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
      tags: post?.tags?.join(", ") || "",
      featured_image: post?.featured_image || "",
    },
  });

  // Update form values when post data changes
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        tags: post.tags?.join(", ") || "",
        featured_image: post.featured_image || "",
      });
    }
  }, [post, form]);

  const onSubmit = (values: FormValues) => {
    if (mode === "create") {
      createPost(
        {
          ...values,
          tags: values.tags.split(",").map((tag) => tag.trim()),
          status: values.status as PostStatus,
        } as CreatePostRequest,
        {
          onSuccess: () => {
            toast.success("Blog post created successfully");
            router.push("/dashboard/blog/posts");
          },
          onError: (error: unknown) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to create blog post";
            toast.error(errorMessage);
          },
        }
      );
    } else {
      if (!post?.slug) return;

      // Compare current values with initial values to find changed fields
      const changedFields: Partial<UpdatePostRequest> = {};

      if (values.title !== post.title) changedFields.title = values.title;
      if (values.content !== post.content)
        changedFields.content = values.content;
      if (values.excerpt !== post.excerpt)
        changedFields.excerpt = values.excerpt;
      if (values.status !== post.status)
        changedFields.status = values.status as PostStatus;
      if (values.meta_title !== post.meta_title)
        changedFields.meta_title = values.meta_title;
      if (values.meta_description !== post.meta_description)
        changedFields.meta_description = values.meta_description;

      // Compare tags
      const currentTags = values.tags;
      const originalTags = (post.tags || []).join(", ");
      if (currentTags !== originalTags) {
        changedFields.tags = values.tags.split(",").map((tag) => tag.trim());
      }

      // Check if featured_image is a File (new upload) or different from original
      if (
        values.featured_image instanceof File ||
        values.featured_image !== post.featured_image
      ) {
        changedFields.featured_image =
          values.featured_image instanceof File
            ? values.featured_image.name
            : values.featured_image;
      }

      // Only proceed if there are changes
      if (Object.keys(changedFields).length === 0) {
        toast("No changes to update");
        return;
      }

      updatePost(changedFields as UpdatePostRequest, {
        onSuccess: () => {
          toast.success("Blog post updated successfully");
          router.push("/dashboard/blog/posts");
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update blog post";
          toast.error(errorMessage);
        },
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (mode === "edit" && !post) {
    return <div>Post not found</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured_image"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              {value && (
                <div className="mt-2">
                  <img
                    src={
                      typeof value === "string"
                        ? value
                        : URL.createObjectURL(value)
                    }
                    alt="Featured"
                    className="max-w-[200px] rounded-md"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <EditorPopup
                  content={field.value}
                  onChange={(content) => field.onChange(content)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief excerpt..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select post status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas (e.g., technology, web development, react)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter meta title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter meta description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {mode === "create" ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Post
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Post
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
