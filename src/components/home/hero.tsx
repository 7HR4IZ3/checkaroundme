"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  title?: string;
  subtitles?: string[];
}

const Hero: React.FC<HeroProps> = ({ title, subtitles }) => {
  const router = useRouter();

  title ??= "Discover and connect with";
  subtitles ??= ["amazing local businesses in your", "community"];

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
          {title}
        </span>
        {subtitles.map((subtitle, index) => (
          <span
            className={`text-2xl sm:text-4xl md:text-4xl font-bold leading-tight ${
              (index + 1) === subtitles.length ? "mb-4" : ""
            }`}
          >
            {subtitle}
          </span>
        ))}
        <Button
          className="bg-[#2E57A9] hover:bg-blue-700 h-12 text-white font-semibold rounded-full flex items-center justify-center w-35"
          onClick={() => router.push("/listings")}
        >
          <span className="text-xs">EXPLORE</span>
          <ArrowRight style={{ transform: "rotate(-45deg)" }} className="" />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
