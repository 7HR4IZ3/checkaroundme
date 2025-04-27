import { trpc } from "@/lib/trpc/client"; // Import trpc client

interface GeolocationState {
  loading: boolean;
  error: any | null; // Use generic Error type for tRPC errors
  latitude: number | null;
  longitude: number | null;
}

const useGeolocation = (): GeolocationState => {
  const { data, isLoading, error } = trpc.getGeolocation.useQuery();

  // Directly return the state derived from the tRPC query
  return {
    loading: isLoading,
    error: error || null,
    latitude: data?.latitude ?? null, // Use nullish coalescing for default null
    longitude: data?.longitude ?? null, // Use nullish coalescing for default null
  };
};

export default useGeolocation;
