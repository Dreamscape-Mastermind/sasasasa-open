"use client";

import {
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from "@/types/blog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tag as ReactTag, WithContext as ReactTags } from "react-tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBlogPost, useUpdateBlogPost } from "@/lib/hooks/useBlog";

import { Button } from "@/components/ui/button";
import { Editor } from "@/components/ui/editor";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Tag = ReactTag;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured_image: z.instanceof(File).optional(),
  meta_title: z.string().min(1, "Meta title is required"),
  meta_description: z.string().min(1, "Meta description is required"),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogPostFormProps {
  post?: BlogPost;
  mode: "create" | "edit";
}

export default function BlogPostForm({ post, mode }: BlogPostFormProps) {
  const router = useRouter();
  const { mutate: createPost, isPending: isCreating } = useCreateBlogPost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdateBlogPost();
  const [tags, setTags] = useState<Tag[]>(
    post?.tags.map((tag) => ({
      id: tag,
      text: tag,
      className:
        "bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1",
    })) || []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      status: post?.status || "DRAFT",
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
      tags: post?.tags || [],
    },
  });

  const handleAddTag = (tag: Tag) => {
    setTags([...tags, tag]);
    form.setValue(
      "tags",
      [...tags, tag].map((t) => t.text)
    );
  };

  const handleDeleteTag = (i: number) => {
    const newTags = tags.filter((tag, index) => index !== i);
    setTags(newTags);
    form.setValue(
      "tags",
      newTags.map((t) => t.text)
    );
  };

  const handleDragTag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = tags.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setTags(newTags);
    form.setValue(
      "tags",
      newTags.map((t) => t.text)
    );
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const onSubmit = (values: FormValues) => {
    const formData = {
      ...values,
    };

    if (mode === "create") {
      createPost(formData as CreateBlogPostRequest, {
        onSuccess: () => {
          toast.success("Blog post created successfully");
          router.push("/dashboard/blog/posts");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create blog post");
        },
      });
    } else {
      if (!post?.slug) return;
      updatePost(
        { slug: post.slug, data: formData as UpdateBlogPostRequest },
        {
          onSuccess: () => {
            toast.success("Blog post updated successfully");
            router.push("/dashboard/blog/posts");
          },
          onError: (error) => {
            toast.error(error.message || "Failed to update blog post");
          },
        }
      );
    }
  };

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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="enter-post-slug" {...field} />
              </FormControl>
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
                <Editor
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
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <ReactTags
                    tags={tags}
                    handleDelete={handleDeleteTag}
                    handleAddition={handleAddTag}
                    handleDrag={handleDragTag}
                    delimiters={[188, 13]}
                    placeholder="Press enter to add new tag"
                    inputFieldPosition="inline"
                    classNames={{
                      tags: "flex flex-wrap gap-2 my-2 w-full",
                      tag: "bg-[#CC322D] text-white px-2 py-1 my-2  rounded-md flex items-center gap-1 transition-colors",
                      tagInput:
                        "border border-[#CC322D] rounded-md px-3 py-1 w-full bg-background text-foreground dark:bg-background dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#CC322D] mt-3",
                      tagInputField:
                        "bg-transparent text-foreground dark:text-foreground placeholder:text-[#CC322D]/70 dark:placeholder:text-white/70",
                      remove:
                        "text-white hover:text-[#CC322D] hover:bg-white rounded-full ml-1 cursor-pointer transition-colors",
                      clearAll:
                        "text-xs text-[#CC322D] hover:text-white hover:bg-[#CC322D] cursor-pointer ml-2 rounded px-2 py-1 transition-colors",
                    }}
                    maxTags={10}
                  />
                </div>
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
