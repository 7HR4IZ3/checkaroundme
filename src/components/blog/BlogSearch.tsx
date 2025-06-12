"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function BlogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams?.get("search") || "");
  const debouncedValue = useDebounce(value);

  // Update URL when search value changes
  useEffect(() => {
    if (debouncedValue) {
      startTransition(() => {
        router.push(`/blog?search=${debouncedValue}`);
      });
    } else {
      startTransition(() => {
        router.push("/blog");
      });
    }
  }, [debouncedValue, router]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search posts..."
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isPending}
      />
    </div>
  );
}
