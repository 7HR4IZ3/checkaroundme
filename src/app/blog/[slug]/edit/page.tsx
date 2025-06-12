"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/lib/hooks/useClientAuth";
import BlogEditor from "@/components/blog/editor";
import Loading from "@/components/ui/loading";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { toast } from "sonner";
import React from "react";

export default function EditBlogPost({ params }: { params: any }) {
  const router = useRouter();
  const { user } = useAuth();

  params = React.use(params);

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery(params.slug, {
    staleTime: Infinity,
  });

  const updatePost = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully!");
      router.push(`/blog/${params.slug}`);
    },
    onError: () => {
      toast.error("Failed to update post");
    },
  });

  // Authorization check
  useEffect(() => {
    if (!isLoading && (!user || (post && user.$id !== post.authorId))) {
      router.push("/blog");
      toast.error("Unauthorized to edit this post");
    }
  }, [user, post, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!post) return null;

  return (
    <BlogPostForm
      mode="edit"
      initialData={post}
      onSubmit={async (data) => {
        await updatePost.mutateAsync({
          id: post.$id,
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      }}
      isSubmitting={updatePost.isPending}
    />
  );
}
