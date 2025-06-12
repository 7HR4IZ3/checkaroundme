"use client";

import { memo } from "react";
import { formatDistance } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

const BlogListItem = memo(function BlogListItem({ post }: { post: any }) {
  const { data: author, isLoading } = trpc.getUserProfileById.useQuery({
    userId: post.authorId,
  });

  return (
    <div className="flex gap-6">
      {post.coverImage && (
        <Link
          href={`/blog/${post.slug}`}
          className="relative aspect-[16/10] w-[35%] overflow-hidden rounded-lg shrink-0"
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
        </Link>
      )}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-8 w-8">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-full" />
            ) : (
              <>
                <AvatarImage src={author?.avatarUrl} />
                <AvatarFallback>
                  {author?.fullName[0].toUpperCase()}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <>
              <span>{author?.fullName}</span>
              <span>•</span>
              <time>
                {formatDistance(new Date(post.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </time>
            </>
          )}
        </div>
        <Link href={`/blog/${post.slug}`} className="block group">
          <h3 className="text-2xl font-semibold group-hover:underline">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-2 mt-2">
              {post.excerpt}
            </p>
          )}
        </Link>
        {post.tags?.length > 0 && (
          <div className="flex gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export { BlogListItem };
