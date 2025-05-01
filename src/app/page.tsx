import Hero from "@/components/home/hero";
import Categories from "@/components/home/categories";
import ServicesNearYou from "@/components/home/services-near-you";
import PopularServices from "@/components/home/popular-services";

export default function HomePage() {

  return (
    <>
      <Hero />
      <Categories />
      <PopularServices />
      <ServicesNearYou />
      {/* Add other sections as needed */}
    </>
  );
}
