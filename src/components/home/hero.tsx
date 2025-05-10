"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  title?: string;
  subtitles?: string[];
  button?: { text: string; onclick: () => void };
}

const Hero: React.FC<HeroProps> = ({ title, subtitles, button }) => {
  const router = useRouter();

  title ??= "Discover and connect with";
  subtitles ??= ["amazing local businesses in your", "community"];
  button ??= { text: "EXPLORE", onclick: () => router.push("/listings") };

  return (
    <div className="relative bg-gray-800 text-white overflow-hidden m-6 md:m-0 rounded-lg h-[30vh] md:h-[40vh]">
      {/* Background Image */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Assorted food items"
        layout="fill"
        objectFit="cover"
        quality={85}
        className="absolute z-1 opacity-70"
      />

      {/* Content */}
      <div className="relative flex flex-col z-10 container px-4 sm:px-6 lg:px-8 py-8 md:py-32 lg:py-40 text-left z-10 gap-2 md:gap-4 h-[100%] flex justify-center mx-auto my-auto">
        <span className="text-xs md:text-sm text-muted text-bold">
          CHECKAROUNDME
        </span>
        <span className="text-md md:text-4xl font-bold leading-tight">
          {title}
        </span>
        {subtitles.map((subtitle, index) => (
          <span
            key={index}
            className={`text-md md:text-4xl font-bold leading-tight ${
              index + 1 === subtitles.length ? "mb-4" : ""
            }`}
          >
            {subtitle}
          </span>
        ))}
        <Button
          className="bg-primary hover:bg-blue-700 h-10 md:h-12 w-35 text-white dark:text-black font-semibold rounded-full flex items-center justify-center"
          onClick={button.onclick}
        >
          <span className="text-xs">{button.text}</span>
          <ArrowRight style={{ transform: "rotate(-45deg)" }} className="" />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
