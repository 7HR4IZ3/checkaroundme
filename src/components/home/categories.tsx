import Image from "next/image";

import { trpc } from "@/lib/trpc/server";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../ui/carousel";
import Link from "next/link";

// import { Skeleton } from "../ui/skeleton";
// const CategorySkeleton = () => {
//   return (
//     <div className="flex flex-col items-center text-center">
//       <Skeleton className="w-40 h-40 rounded-full mb-3" />
//       <Skeleton className="h-4 w-24" />
//     </div>
//   );
// };

export default async function Categories() {
  const categories = await trpc.getAllCategories();

  return (
    <div className="bg-white py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg md:text-2xl font-semibold text-center mb-8">
          Categories
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          autoplay={true} // Enable autoplay
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category, index) => (
              <CarouselItem
                key={category.$id || index}
                className="pl-2 md:pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                <Link
                  href={`/listings?categories=${category.name}`}
                  className="flex flex-col items-center text-center cursor-pointer group"
                >
                  <div className="w-[25vw] h-[25vw] md:w-[10rem] md:h-[10rem] rounded-full p-1 bg-gradient-to-br from-[#F3B53F] via-[#FF4D00] to-[#AE06C9] transition duration-200">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={category.imageUrl || "/images/cat-placeholder.png"}
                        alt={category.description || category.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {category.name}
                  </p>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </div>
  );
}
