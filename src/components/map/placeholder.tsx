import { useGeolocation } from '@uidotdev/usehooks';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import React from 'react';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { Business } from '@/lib/schema';

import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});

interface MapPlaceholderProps {
  businesses?: Business[];
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ businesses }) => {
  const { latitude, longitude, error } = useGeolocation();
  const router = useRouter();

  if (error) {
    return (
      <div className="w-full h-full sticky top-[88px] bg-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
        <span className="bg-white px-4 py-2 rounded shadow font-medium text-gray-600">Error getting location: {error.message}</span>
      </div>
    );
  }

  if (latitude === null || longitude === null) {
    return (
      <div className="w-full h-full sticky top-[88px] bg-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
        <span className="bg-white px-4 py-2 rounded shadow font-medium text-gray-600">Loading map...</span>
      </div>
    );
  }

  const position: [number, number] = [latitude, longitude];

  return (
    <div className="w-full h-full sticky top-[88px] bg-gray-300 rounded-lg overflow-hidden">
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Your current location.
          </Popup>
        </Marker>

        {businesses && businesses.map((business) => (
          business.coordinates && (
            <Marker
              key={business.$id}
              position={[business.coordinates.latitude, business.coordinates.longitude]}
              eventHandlers={{
                click: () => {
                  router.push(`/business/${business.$id}`);
                },
              }}
            >
              <Popup>
                {business.name}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPlaceholder;
