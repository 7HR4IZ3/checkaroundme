import React from 'react';
import ListingCard from './listing-card';
import Loading from '@/components/ui/loading';
import { Business } from '@/lib/schema';

interface ListingCardsListProps {
  isLoading: boolean;
  geoError: GeolocationPositionError | null;
  userLatitude: number | null;
  businesses: Business[] | undefined;
}

const ListingCardsList: React.FC<ListingCardsListProps> = ({
  isLoading,
  geoError,
  userLatitude,
  businesses,
}) => {
  if (isLoading) {
    return <Loading />;
  }

  if (geoError && !userLatitude) {
    return (
      <div className="text-center text-gray-500">
        Could not determine your location. Please enable location services or select
        a location manually.
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No service providers found matching your criteria.
      </div>
    );
  }

  return (
    <>
      {businesses.map((business, index) => (
        <ListingCard key={business.$id || index} business={business} />
      ))}
    </>
  );
};

// Add display name for debugging
ListingCardsList.displayName = 'ListingCardsList';

export default ListingCardsList;
