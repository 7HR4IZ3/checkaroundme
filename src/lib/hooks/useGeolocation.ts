import { trpc } from "@/lib/trpc/client";
import { useGeolocation as useNativeGeolocation } from "@uidotdev/usehooks";

interface GeolocationState {
  loading: boolean;
  error: any | null; // Use generic Error type for tRPC errors
  latitude: number | null;
  longitude: number | null;
}

const useGeolocation = (): GeolocationState => {
  const { latitude, longitude, error, loading } = useNativeGeolocation();
  const {
    data,
    isLoading,
    error: geoError,
  } = trpc.getGeolocation.useQuery(void 0, {
    enabled: !loading && (!latitude || !longitude),
  });

  return {
    error: geoError || null,
    loading: loading || isLoading,
    latitude: latitude ?? data?.latitude ?? null,
    longitude: longitude ?? data?.longitude ?? null,
  };
};

export default useGeolocation;
