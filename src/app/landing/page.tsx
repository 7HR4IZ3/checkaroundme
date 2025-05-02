import Footer from "@/components/base/footer";
import Header from "@/components/base/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react"; // Assuming lucide-react is installed
import Image from "next/image";

// Helper component for star ratings (can be simplified for landing page)
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
};

// New component for displaying landing page reviews
const LandingReviewCard = ({
  review,
}: {
  review: {
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
    reviewerImage: string;
  };
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={review.reviewerImage} alt={review.reviewerName} />
            <AvatarFallback>
              {review.reviewerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{review.reviewerName}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{review.comment}</p>
        <p className="text-xs text-gray-500 mt-2">
          {new Date(review.createdAt).toDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

// Demo Data (Replace with actual data later)
const features = [
  {
    title: "Feature One",
    description: "Brief description of feature one.",
    icon: "💡",
  },
  {
    title: "Feature Two",
    description: "Brief description of feature two.",
    icon: "🚀",
  },
  {
    title: "Feature Three",
    description: "Brief description of feature three.",
    icon: "✅",
  },
];

const howItWorksSteps = [
  {
    title: "Step 1: Sign Up",
    description: "Create your account in seconds.",
    icon: "👤",
  },
  {
    title: "Step 2: Find Services",
    description: "Browse local services near you.",
    icon: "🔍",
  },
  {
    title: "Step 3: Connect",
    description: "Connect with businesses instantly.",
    icon: "💬",
  },
];

const reviews = [
  {
    id: "rev1",
    reviewerName: "Alex Johnson",
    rating: 5,
    comment: "Amazing platform! Found exactly what I needed quickly.",
    createdAt: new Date(),
    reviewerImage: "/images/cat-placeholder.png", // Placeholder image
  },
  {
    id: "rev2",
    reviewerName: "Samantha Lee",
    rating: 4,
    comment: "Very helpful service, easy to use interface.",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    reviewerImage: "/images/cat-placeholder.png", // Placeholder image
  },
  {
    id: "rev3",
    reviewerName: "Mike Brown",
    rating: 5,
    comment: "Highly recommend! Saved me a lot of time.",
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    reviewerImage: "/images/cat-placeholder.png", // Placeholder image
  },
];

const benefits = [
  {
    title: "Easy Discovery",
    description: "Find local services quickly and easily.",
    icon: "✨",
  },
  {
    title: "Connect Directly",
    description:
      "Communicate with service providers directly through the platform.",
    icon: "💬",
  },
  {
    title: "Trusted Reviews",
    description: "Make informed decisions based on real user reviews.",
    icon: "⭐",
  },
];

const faqs = [
  {
    question: "How do I find services?",
    answer: "Use the search bar or browse categories.",
  },
  {
    question: "Is it free to use?",
    answer: "Yes, it's free for users to find and connect with services.",
  },
  {
    question: "How can I list my business?",
    answer: "Sign up as a business and create your profile.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        {/* Section 1: Hero */}
        <section className="relative overflow-hidden py-20 md:py-32 text-center text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} // Assuming hero-bg.jpg exists
          />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Welcome to CheckAroundMe
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Discover and connect with the best local services right in your
              neighborhood. Fast, easy, and reliable.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              Get Started
            </Button>
          </div>
        </section>

        {/* Section 2: Features/Services */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
              Here's what makes our platform unique.
            </p>
            <div className="grid md:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-500"
                >
                  <CardHeader className="pb-4">
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-2xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Key Benefits */}
        {/* Section 3: Key Benefits */}
        <section id="benefits" className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Key Benefits
            </h2>
            <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
              Discover the advantages of using our platform.
            </p>
            <div className="grid md:grid-cols-3 gap-10">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4"
                >
                  <CardHeader className="pb-4">
                    <div className="text-5xl mb-4">{benefit.icon}</div>
                    <CardTitle className="text-2xl font-semibold">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: How It Works */}
        {/* Section 4: How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
              Get started in just a few simple steps.
            </p>
            <div className="grid md:grid-cols-3 gap-10">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg"
                >
                  <div className="text-5xl mb-4 p-4 bg-blue-100 rounded-full text-blue-600">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Testimonials/Reviews */}
        {/* Section 5: Testimonials/Reviews */}
        <section id="reviews" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
              Real feedback from our community.
            </p>
            {/* Consider using a Carousel component here if available */}
            <div className="grid md:grid-cols-3 gap-10">
              {reviews.map((review) => (
                <LandingReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: FAQ */}
        {/* Section 6: FAQ */}
        <section id="faq" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
              Find answers to common questions.
            </p>
            <div className="grid gap-8 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-6 border-gray-200">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Call to Action (CTA) */}
        {/* Section 7: Call to Action (CTA) */}
        <section
          id="cta"
          className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4 drop-shadow">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-10 max-w-xl mx-auto opacity-90">
              Join CheckAroundMe today and discover the best services your
              neighborhood has to offer.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 text-blue-600 hover:text-blue-700"
            >
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
