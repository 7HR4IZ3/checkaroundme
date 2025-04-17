"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { trpc } from "@/lib/trpc/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";

const CategorySkeleton = () => {
  return (
    <div className="flex flex-col items-center text-center">
      <Skeleton className="w-40 h-40 rounded-full mb-3" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
};

const Categories = function () {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories = [], isLoading } = trpc.getAllCategories.useQuery();

  const goToCategory = useCallback(
    (category: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set("categories", category);
      } else {
        params.delete("categories");
      }
      // Reset to first page when filters change
      params.set("offset", "0");
      router.replace(`/listings?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-center mb-8">Categories</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem
                    key={`skeleton-${index}`}
                    className="pl-2 md:pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5"
                  >
                    <CategorySkeleton />
                  </CarouselItem>
                ))
              : categories.map((category, index) => (
                  <CarouselItem
                    key={category.$id || index}
                    className="pl-2 md:pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5"
                  >
                <div
                  className="flex flex-col items-center text-center cursor-pointer group"
                  onClick={() => goToCategory(category.name)}
                >
                  <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-[#F3B53F] via-[#FF4D00] to-[#AE06C9] transition duration-200">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={category.imageUrl || "/images/cat-placeholder.png"}
                        alt={category.name}
                        width={200}
                        height={200}
                        objectFit="cover"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {category.name}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default Categories;
