import CategoryNav from "@/components/listing/category-nav";
import FilterSortBar from "@/components/listing/filter-sort-bar";
import ListingCard from "@/components/listing/listing-card";
import Pagination from "@/components/ui/pagination";
import MapPlaceholder from "@/components/map/placeholder";

// Sample Data (replace with actual data fetching)
const listingsData = [
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very professional. Definitely would recommend this garage for your vehicle needs.",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Mobile Mercedes Mechanic",
    rating: 5.0,
    reviewCount: 12,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very professional. Definitely would recommend this garage for your vehicle needs.",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very professional. Definitely would recommend this garage for your vehicle needs.",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very professional. Definitely would recommend this garage for your vehicle needs.",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very professional. Definitely would recommend this garage for your vehicle needs.",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very professional. Definitely would recommend this garage for your vehicle needs.",
    location: "18 Abuila Street, Abuja",
  },
];

export default function Home() {
  return (
    <>
      <CategoryNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Listings Section */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">
              Auto Mechanics near Lekki, Lagos
            </h1>
            <FilterSortBar />
            <div className="space-y-6">
              {listingsData.map((listing, index) => (
                <ListingCard key={index} {...listing} />
              ))}
            </div>
            <Pagination />
          </div>

          {/* Map Section */}
          <div className="lg:col-span-1">
            <MapPlaceholder />
          </div>
        </div>
      </div>
    </>
  );
}
