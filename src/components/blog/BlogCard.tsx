import { formatDistance } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "../ui/skeleton";

export function BlogCard({ post }: { post: any }) {
  const { data: author, isLoading } = trpc.getUserProfileById.useQuery(
    {
      userId: post.authorId,
    },
    { staleTime: Infinity }
  );

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {post.coverImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <CardHeader>
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
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          <h3 className="text-2xl font-semibold">{post.title}</h3>
        </Link>
        {post.excerpt && (
          <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
      </CardHeader>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {post.tags?.map((tag: string) => (
            <Badge key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
