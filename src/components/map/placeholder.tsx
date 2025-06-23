"use client";

import React, { useMemo, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import L from "leaflet";

import useGeolocation from "@/lib/hooks/useGeolocation"; // Import custom hook
import { Business } from "@/lib/schema";

import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
});

// Memoized marker component
const BusinessMarker = memo(({ business }: { business: Business }) => {
  if (!business.coordinates) return null;

  const coordinates = JSON.parse(business.coordinates);

  return (
    <Marker position={[coordinates.latitude, coordinates.longitude]}>
      <Popup>
        <Link href={`/business/${business.$id}`}>{business.name}</Link>
      </Popup>
    </Marker>
  );
});

BusinessMarker.displayName = "BusinessMarker";

// Memoized loading state component
const LoadingState = memo(() => (
  <div className="w-full h-full sticky top-[88px] bg-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
    <span className="bg-white px-4 py-2 rounded shadow font-medium text-gray-600">
      Loading map...
    </span>
  </div>
));

LoadingState.displayName = "LoadingState";

// Memoized error state component
const ErrorState = memo(({ message }: { message: string }) => (
  <div className="w-full h-full sticky top-[88px] bg-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
    <span className="bg-white px-4 py-2 rounded shadow font-medium text-gray-600">
      Error getting location: {message}
    </span>
  </div>
));

ErrorState.displayName = "ErrorState";

interface MapPlaceholderProps {
  isHero?: boolean;
  businesses?: Business[];
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  businesses,
  isHero,
}) => {
  const { latitude, longitude, error, loading } = useGeolocation();

  // Memoize the user position
  const position: [number, number] = useMemo(
    () => (latitude && longitude ? [latitude, longitude] : [0, 0]),
    [latitude, longitude]
  );

  // Memoize business markers
  const businessMarkers = useMemo(
    () =>
      businesses?.map((business) => (
        <BusinessMarker key={business.$id} business={business} />
      )),
    [businesses]
  );

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (loading || latitude === null || longitude === null) {
    return <LoadingState />;
  }

  return (
    <div className="w-full h-full bg-gray-300 rounded-lg overflow-hidden">
      <MapContainer
        center={position}
        zoom={20}
        scrollWheelZoom={!isHero}
        dragging={!isHero} // Disable dragging
        zoomControl={!isHero} // Hide zoom controls
        style={{ height: "100%", width: "100%", zIndex: "10" }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        <Marker position={position}>
          <Popup>Your current location.</Popup>
        </Marker>
        {businessMarkers}
      </MapContainer>
    </div>
  );
};

// Memoize the entire component
export default memo(MapPlaceholder);
