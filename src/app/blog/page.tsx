"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogList } from "@/components/blog/BlogList";

export default function BlogPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data } = trpc.blog.list.useQuery({
    status: "published",
  });
  const { user } = useAuth();

  return (
    <div className="container h-full md:h-[80vh] mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-2">
        <BlogHeader
          view={view}
          onViewChange={setView}
          onCategoryChange={() => {}}
        />
        {user && (
          <Link href="/blog/new">
            <Button>Create New Post</Button>
          </Link>
        )}
      </div>

      {view === "grid" ? (
        <BlogGrid posts={data?.posts || []} />
      ) : (
        <BlogList posts={data?.posts || []} />
      )}
    </div>
  );
}
