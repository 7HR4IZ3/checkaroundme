"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import MapPlaceholder from "@/components/map/placeholder";

interface HeroProps {
  title?: string;
  subtitles?: string[];
  button?: { text: string; onclick: () => void };
}

const Hero: React.FC<HeroProps> = ({ title, subtitles, button }) => {
  const router = useRouter();

  title ??= "Discover and connect with";
  subtitles ??= ["amazing Service Providers"];
  button ??= { text: "EXPLORE", onclick: () => router.push("/listings") };

  return (
    <div className="relative overflow-hidden m-6 md:m-0 rounded-lg h-[30vh] md:h-[50vh]">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapPlaceholder isHero={true} />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="relative flex flex-col z-20 container px-4 sm:px-6 lg:px-8 py-8 md:py-32 lg:py-40 text-left gap-2 md:gap-4 h-[100%] flex justify-center mx-auto my-auto text-white">
        <span className="text-xs md:text-sm text-muted-foreground font-bold">
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
