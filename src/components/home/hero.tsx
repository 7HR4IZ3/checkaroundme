"use client";

import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  return (
    <div className="relative bg-gray-800 text-white overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Assorted food items"
        layout="fill"
        objectFit="cover"
        quality={85}
        className="absolute z-1"
      />

      {/* Content */}
      <div className="relative flex flex-col z-10 container mx-4 px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40 text-left z-10 gap-4 mx-auto">
        <span className="text-sm text-muted">CHECKAROUNDME</span>
        <span className="text-2xl sm:text-4xl md:text-4xl font-bold leading-tight">
          Discover and connect with
        </span>
        <span className="text-2xl sm:text-4xl md:text-4xl font-bold leading-tight">
          amazing local businesses in your
        </span>
        <span className="text-2xl sm:text-4xl md:text-4xl font-bold leading-tight mb-4">
          community
        </span>
        <Button
          className="bg-[#2E57A9] hover:bg-blue-700 h-12 text-white font-semibold rounded-full flex items-center justify-center w-35"
          onClick={() => router.push("/listings")}
        >
          <span className="text-xs">EXPLORE</span>
          <FaArrowRight style={{ transform: "rotate(-45deg)" }} className="" />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
