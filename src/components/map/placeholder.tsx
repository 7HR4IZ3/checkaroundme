import React from 'react';
import Image from 'next/image';

const MapPlaceholder = () => {
  return (
    <div className="w-full h-[600px] lg:h-full sticky top-[88px] bg-gray-300 rounded-lg overflow-hidden">
      {/* You would replace this with a real map component */}
      <Image
        src="/map-placeholder.png" // Replace with the actual map image crop you provided
        alt="Map Placeholder"
        layout="fill"
        objectFit="cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-white px-4 py-2 rounded shadow font-medium text-gray-600">Map Area</span>
      </div>
    </div>
  );
};

export default MapPlaceholder;