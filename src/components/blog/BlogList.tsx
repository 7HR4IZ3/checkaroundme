"use client";

import { formatDistance } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { BlogListItem } from "./BlogListItem";

export function BlogList({ posts }: { posts: any[] }) {
  return (
    <div className="space-y-8">
      {posts.map((post, index) => (
        <div key={post.$id}>
          <BlogListItem post={post} />
          {index < posts.length - 1 && <Separator className="my-8" />}
        </div>
      ))}
    </div>
  );
}
