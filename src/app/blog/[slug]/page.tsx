import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Edit2, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BlogService, UserService } from "@/lib/appwrite";
import { Metadata } from "next";
import BlogPostClient from "./blog-post-client";

import "@/components/tiptap/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap/tiptap-node/image-upload-node/image-upload-node.scss";

// Revalidate the page every 24 hours
export const revalidate = 86400;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const result = await BlogService.listPosts({ perPage: 100 });
    return result.posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await BlogService.getPostBySlug(slug);
    
    if (!post) {
      return {
        title: "Post Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    return {
      title: post.title,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
        type: "article",
        publishedTime: new Date(post.createdAt).toISOString(),
        modifiedTime: new Date(post.updatedAt).toISOString(),
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt || post.title,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch (error) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params;
    const post = await BlogService.getPostBySlug(slug);
    
    if (!post) {
      return <div>Post not found</div>;
    }

    let author = null;
    try {
      author = await UserService.getUserProfileById(post.authorId);
    } catch (error) {
      console.error("Error fetching author:", error);
    }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-5xl mx-auto py-8">
        {/* Navigation and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <BlogPostClient authorId={post.authorId} slug={slug} />
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
                      {!author ? (
                        <AvatarFallback></AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage
                            src={author.avatarUrl}
                            alt={author.fullName?.split(" ")[0] || "Author"}
                          />
                          <AvatarFallback>
                            {author.fullName?.split(" ")[0]?.charAt(0) || "A"}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <Tooltip>
                      <TooltipTrigger className="hover:text-foreground">
                        {author?.fullName || "Anonymous"}
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
                {post.tags.map((tag: string) => (
                  <Badge key={tag}>
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
                Written by {author?.fullName || "Anonymous"}
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
  } catch (error) {
    console.error("Error rendering blog post:", error);
    return <div>Error loading blog post</div>;
  }
}
