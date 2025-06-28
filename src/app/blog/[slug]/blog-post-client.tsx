"use client";

import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useClientAuth";

interface BlogPostClientProps {
  authorId: string;
  slug: string;
}

export default function BlogPostClient({ authorId, slug }: BlogPostClientProps) {
  const { user } = useAuth();

  return (
    <>
      {user && user.$id === authorId && (
        <Link href={`/blog/${slug}/edit`}>
          <Button variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Post
          </Button>
        </Link>
      )}
    </>
  );
}
