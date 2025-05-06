import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGeolocation as useNativeGeolocation } from "@uidotdev/usehooks";
import { useGeolocationPermission } from "@/lib/context/GeolocationPermissionContext";

interface GeolocationState {
  loading: boolean;
  error: any | null; // Use generic Error type for tRPC errors
  latitude: number | null;
  longitude: number | null;
}

const useGeolocation = (): GeolocationState => {
  const { latitude, longitude, error, loading } = useNativeGeolocation();
  const { showModal, onResponse } = useGeolocationPermission();

  const {
    data,
    isLoading,
    error: geoError,
  } = trpc.getGeolocation.useQuery(void 0, {
    enabled: Boolean(
      !loading && (!latitude || !longitude) && error && error.code !== 1
    ),
  });

  useEffect(() => {
    // console.error(error);
    if (error && error.code === 1) {
      // GeolocationPositionError.PERMISSION_DENIED
      showModal();
    }
  }, [error]);

  return {
    error: geoError || null,
    loading: loading || isLoading,
    latitude: latitude ?? data?.latitude ?? null,
    longitude: longitude ?? data?.longitude ?? null,
  };
};

export default useGeolocation;
