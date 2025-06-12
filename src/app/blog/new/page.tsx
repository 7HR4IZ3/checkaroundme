"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { toast } from "sonner";

export default function NewBlogPost() {
  const router = useRouter();
  const createPost = trpc.blog.create.useMutation();

  return (
    <BlogPostForm
      mode="create"
      onSubmit={async (data) => {
        try {
          await createPost.mutateAsync(data);
          toast.success("Blog post created successfully!");
          router.push("/blog");
        } catch (error) {
          toast.error("Failed to create blog post");
        }
      }}
      isSubmitting={createPost.isPending}
    />
  );
}
