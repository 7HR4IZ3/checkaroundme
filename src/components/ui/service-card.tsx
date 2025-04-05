import Image from "next/image";
import Link from "next/link";
import RatingStars from "../ui/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Service {
  name?: string;
  rating?: number;
  description?: string;
  image?: string;
  address?: string;
  slug?: string;
  tags?: string[];
}

const ServiceCard = ({ service }: { service: Service }) => {
  const { name, rating, description, image, address, slug, tags } = service;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 py-2">
      <CardContent className="flex flex-row p-0">
        <div className="absolute top-2 right-2">
          <p className="text-xs text-gray-500">
            {address || "123 Example Street, City"}
          </p>
        </div>

        <div className="flex-shrink-0 h-24 sm:h-auto p-4 overflow-hidden">
          <Image
            className="rounded-sm"
            src={image || "/images/service-placeholder.png"}
            alt={name || "Service image"}
            width={100}
            height={100}
          />
        </div>

        <div className="flex flex-col justify-center flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-blue-600">
            <Link href={`/service/${slug || "#"}`}>
              {name || "Service Name"}
            </Link>
          </h3>
          <div className="mb-2">
            <RatingStars rating={rating || 0} starSize={14} />
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags?.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            )) || <Badge variant="secondary">General</Badge>}
          </div>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {description ||
              "Brief description of the service offering goes here."}
          </p>
          <p className="text-xs text-gray-500">
            {address || "123 Example Street, City"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default ServiceCard;
