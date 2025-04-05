import Hero from "@/components/home/hero";
import Categories from "@/components/home/categories";
import ServicesNearYou from "@/components/home/services-near-you";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <ServicesNearYou />
      {/* Add other sections as needed */}
    </>
  );
}
