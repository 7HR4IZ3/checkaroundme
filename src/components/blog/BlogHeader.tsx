"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GridIcon, ListIcon, Search } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { BlogSearch } from "./BlogSearch";

export function BlogHeader({
  onViewChange,
  view,
  onCategoryChange,
}: {
  onViewChange: (view: "grid" | "list") => void;
  view: "grid" | "list";
  onCategoryChange: (category: string) => void;
}) {
  const { data: categories } = trpc.blog.getCategories.useQuery();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Blog</h1>
        <div className="flex items-center gap-4">
          <div className="flex border rounded-md">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewChange("grid")}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewChange("list")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <BlogSearch />
        <Select defaultValue="all" onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
