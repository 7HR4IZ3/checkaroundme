"use client";

import BlogEditor from "@/components/blog/editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSVG } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BlogPost, createBlogPostSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  Calendar,
  Clock,
  ImageIcon,
  LinkIcon,
  Tags,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

// Create a form schema that extends the blog post schema
const blogPostFormSchema = createBlogPostSchema.extend({
  tags: z.array(z.string()),
  status: z.enum(["draft", "published", "archived"]),
  // seoTitle: z.string().optional(),
  // seoDescription: z.string().optional(),
});

type BlogPostFormCreate = {
  mode: "create";
  initialData?: BlogPost;
  onSubmit: (data: z.infer<typeof createBlogPostSchema>) => Promise<void>;
  isSubmitting?: boolean;
};

type BlogPostFormEdit = {
  mode: "edit";
  initialData?: BlogPost;
  onSubmit: (data: Partial<BlogPost>) => Promise<void>;
  isSubmitting?: boolean;
};

type BlogPostFormProps = BlogPostFormCreate | BlogPostFormEdit;
type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export function BlogPostForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: BlogPostFormProps) {
  const router = useRouter();
  const [newTag, setNewTag] = useState("");

  // Initialize react-hook-form
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      slug:
        initialData?.slug ??
        initialData?.title?.toLowerCase().replace(/\s+/g, "-") ??
        "",
      status: initialData?.status ?? "draft",
      tags: initialData?.tags || [],
      excerpt: initialData?.excerpt ?? "",
      coverImage: initialData?.coverImage ?? "",
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt)
        : undefined,
      // seoTitle: "",
      // seoDescription: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = form;

  // Watch form values
  const content = watch("content");
  const title = watch("title");
  const tags = watch("tags") ?? [];
  const coverImage = watch("coverImage");
  const excerpt = watch("excerpt");
  const scheduledDate = watch("publishedAt");

  // Auto-populate slug based on title
  useEffect(() => {
    if (title && !initialData?.slug) {
      const newSlug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace special characters with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      setValue("slug", newSlug);
    }
  }, [title, setValue, initialData?.slug]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      // @ts-ignore
      // TODO: Fix this shii
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    }
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.currentTarget instanceof HTMLInputElement) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !tags.includes(newTag)) {
        setValue("tags", [...tags, newTag]);
        setNewTag("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <div className="h-auto md:h-[calc(80vh-4rem)] md:overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 md:p-6">
        {/* Left Configuration Panel */}
        <div className="w-full md:w-1/3 md:overflow-auto">
          <div className="sticky top-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
                <CardDescription>Configure your blog post</CardDescription>
              </CardHeader>
              <CardContent className="px-2 md:px-8">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <Accordion
                    type="multiple"
                    defaultValue={["basic", "media"]}
                    className="space-y-4"
                  >
                    {/* Basic Info Section */}
                    <AccordionItem value="basic" className="border rounded-lg">
                      <AccordionTrigger className="px-4">
                        Basic Information
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            {...register("title")}
                            placeholder="Enter post title"
                          />
                          {errors.title && (
                            <p className="text-sm text-destructive">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="excerpt">Excerpt</Label>
                          <Textarea
                            {...register("excerpt")}
                            placeholder="Brief description of your post"
                            rows={3}
                          />
                          {errors.excerpt && (
                            <p className="text-sm text-destructive">
                              {errors.excerpt.message}
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Media Section */}
                    <AccordionItem value="media" className="border rounded-lg">
                      <AccordionTrigger className="px-4">
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Media
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Featured Image</Label>
                          {coverImage ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                              <Image
                                src={coverImage}
                                alt="Featured"
                                fill
                                className="object-cover w-full h-full"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setValue("coverImage", "")}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed rounded-lg p-4 text-center">
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="featured-image"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append("image", file);
                                    const response = await fetch(
                                      "/api/upload/blog-images",
                                      {
                                        method: "POST",
                                        body: formData,
                                      }
                                    );
                                    const data = await response.json();
                                    setValue("coverImage", data.url);
                                  }
                                }}
                              />
                              <Label
                                htmlFor="featured-image"
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Click to upload featured image
                                </span>
                              </Label>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Publishing Options */}
                    <AccordionItem
                      value="publishing"
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4">
                        Publishing Options
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Schedule Publication</Label>
                          <div className="flex gap-2">
                            <Input
                              type="datetime-local"
                              value={
                                scheduledDate?.toISOString().slice(0, 16) || ""
                              }
                              onChange={(e) =>
                                setValue(
                                  "publishedAt",
                                  new Date(e.target.value)
                                )
                              }
                            />
                            {scheduledDate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setValue("publishedAt", undefined)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="slug">URL Slug</Label>
                          <div className="flex gap-2">
                            <Input
                              {...register("slug")}
                              placeholder="post-url-slug"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setValue(
                                  "slug",
                                  title?.toLowerCase().replace(/\s+/g, "-")
                                )
                              }
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* SEO Section */}
                    {/* <AccordionItem value="seo" className="border rounded-lg">
                      <AccordionTrigger className="px-4">SEO</AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="seoTitle">SEO Title</Label>
                          <Input
                            {...register("seoTitle")}
                            placeholder="SEO optimized title"
                          />
                          {errors.seoTitle && (
                            <p className="text-sm text-destructive">
                              {errors.seoTitle.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoDescription">
                            Meta Description
                          </Label>
                          <Textarea
                            {...register("seoDescription")}
                            placeholder="SEO meta description"
                            rows={3}
                          />
                          {errors.seoDescription && (
                            <p className="text-sm text-destructive">
                              {errors.seoDescription.message}
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem> */}

                    {/* Tags Section */}
                    <AccordionItem
                      value="tags"
                      className="border !border-b-1 rounded-lg"
                    >
                      <AccordionTrigger className="px-4">
                        <span className="flex items-center gap-2">
                          <Tags className="w-4 h-4" />
                          Tags
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add tags"
                              value={newTag}
                              onChange={(ev) => setNewTag(ev.target.value)}
                              onKeyDown={handleAddTag}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (newTag && !tags.includes(newTag)) {
                                  setValue("tags", [...tags, newTag]);
                                  setNewTag("");
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                className="flex items-center gap-1"
                                onClick={() => removeTag(tag)}
                              >
                                {tag}
                                <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? <LoadingSVG /> : null}
                      {isSubmitting
                        ? "Saving..."
                        : mode === "edit"
                        ? "Update Post"
                        : "Save as Draft"}
                    </Button>
                    {mode === "create" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setValue("status", "published");
                          handleFormSubmit();
                        }}
                        disabled={isSubmitting}
                      >
                        Publish Now
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Editor Panel */}
        <div className="w-full md:w-2/3 md:overflow-auto">
          <Card className="flex flex-col">
            <Tabs defaultValue="editor" className="w-full">
              <CardHeader className="border-b">
                <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                  <div>
                    <CardTitle>Content</CardTitle>
                    <CardDescription>
                      Write your blog post content
                    </CardDescription>
                  </div>
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-0 md:overflow-auto">
                <TabsContent value="editor" className="mt-0">
                  <div className="md:h-full">
                    <BlogEditor
                      content={content || ""}
                      onChange={(value) => setValue("content", value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent
                  value="preview"
                  className="h-full mt-0 bg-muted/10"
                >
                  <div className="w-full md:max-w-5xl md:mx-auto md:p-8">
                    <Card className="w-full">
                      <CardContent className="p-8 tiptap ProseMirror">
                        {/* Featured Image */}
                        {coverImage && (
                          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
                            <img
                              src={coverImage}
                              alt={title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        {/* Title and Meta */}
                        <div className="mb-8">
                          <h1 className="text-4xl font-bold mb-4">{title}</h1>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Draft
                            </div>
                            {scheduledDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Scheduled for{" "}
                                {scheduledDate.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-8">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Excerpt */}
                        {excerpt && (
                          <>
                            <p className="text-lg text-muted-foreground mb-8 italic">
                              {excerpt}
                            </p>
                            <Separator className="mb-8" />
                          </>
                        )}

                        {/* Main Content */}
                        <article className="prose prose-lg max-w-none dark:prose-invert">
                          <div
                            dangerouslySetInnerHTML={{ __html: content || "" }}
                          />
                        </article>

                        {/* Footer */}
                        <Separator className="my-8" />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Preview Mode
                          </div>
                          <div>{new Date().toLocaleDateString()}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
