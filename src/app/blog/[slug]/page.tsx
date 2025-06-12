"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { ArrowLeft, Calendar, Clock, Edit2, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import React from "react";
import Loading from "@/components/ui/loading";

import "@/components/tiptap/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap/tiptap-node/image-upload-node/image-upload-node.scss";

export default function BlogPostPage({ params }: { params: any }) {
  params = React.use(params);

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery(params.slug, {
    staleTime: Infinity,
  });
  const { user } = useAuth();

  const { data: author, isLoading: isLoadingAuthor } =
    trpc.getUserProfileById.useQuery(
      {
        userId: post?.authorId!,
      },
      {
        enabled: !!post?.authorId,
        staleTime: Infinity,
      }
    );

  if (isLoading) return <Loading />;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-5xl mx-auto py-8">
        {/* Navigation and Actions */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          {user && user.$id === post.authorId && (
            <Link href={`/blog/${params.slug}/edit`}>
              <Button variant="outline" className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Post
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardContent className="p-8 tiptap ProseMirror">
            {/* Featured Image */}
            {post.coverImage && (
              <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Title and Meta */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {!author || isLoadingAuthor ? (
                        <AvatarFallback></AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage
                            src={author.avatarUrl}
                            alt={author.fullName.split(" ")[0]}
                          />
                          <AvatarFallback>
                            {author.fullName.split(" ")[0].charAt(0)}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <Tooltip>
                      <TooltipTrigger className="hover:text-foreground">
                        Author Name
                      </TooltipTrigger>
                      <TooltipContent>Author</TooltipContent>
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-2 hover:text-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDistance(new Date(post.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </TooltipTrigger>
                    <TooltipContent>Published Date</TooltipContent>
                  </Tooltip>

                  {post.publishedAt && (
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2 hover:text-foreground">
                        <Clock className="h-4 w-4" />
                        Scheduled for{" "}
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </TooltipTrigger>
                      <TooltipContent>Scheduled Publish Date</TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <>
                <p className="text-lg text-muted-foreground mb-8 italic">
                  {post.excerpt}
                </p>
                <Separator className="mb-8" />
              </>
            )}

            {/* Main Content */}
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

            {/* Footer */}
            <Separator className="my-8" />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Written by {author?.fullName}
              </div>
              <div>
                Last updated:{" "}
                {formatDistance(new Date(post.updatedAt), new Date(), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
