import ListingCard from "../listing/listing-card";

// Sample service data (replace with dynamic data fetching later)
const listingsData = [
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very .",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Mobile Mercedes Mechanic",
    rating: 5.0,
    reviewCount: 12,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very .",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very .",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very .",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very .",
    location: "18 Abuila Street, Abuja",
  },
  {
    imageUrl: "/images/service-placeholder.png", // Replace
    name: "Balls Pond Garage",
    rating: 5.0,
    reviewCount: 7,
    tags: ["Garages", "Body Shops"],
    description:
      "Excellent service, the team was very helpful and polite and above all very .",
    location: "18 Abuila Street, Abuja",
  },
];

const ServicesNearYou = () => {
  // In a real app, you'd fetch this data
  const services = listingsData;

  return (
    <div className="bg-gray-50 py-16">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
          Services Near You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ListingCard key={service.name} hideButton={true} {...service} />
          ))}
        </div>
        {/* Optional: Add a "View More" button */}
        {/* <div className="text-center mt-8">
           <button className="text-blue-600 hover:underline">
             Load More Services
           </button>
         </div> */}
      </div>
    </div>
  );
};

export default ServicesNearYou;
