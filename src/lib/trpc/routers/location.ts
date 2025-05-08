import ipdata from "ipdata";
import type SuperJSON from "superjson";

export function createLocationProcedures(
  t: ReturnType<
    typeof import("@trpc/server").initTRPC.create<{
      transformer: typeof SuperJSON;
    }>
  >,
) {
  // Replace 'YOUR_IPDATA_API_KEY' with your actual API key, preferably from an environment variable
  const ipdataClient = new ipdata(
    process.env.IPDATA_API_KEY || "YOUR_IPDATA_API_KEY",
  );

  return {
    getGeolocation: t.procedure.query(async () => {
      try {
        const response = await ipdataClient.lookup();
        return {
          latitude: response.latitude,
          longitude: response.longitude,
        };
      } catch (error) {
        console.error("Error fetching geolocation from ipdata:", error);
        throw new Error("Failed to fetch geolocation");
      }
    }),
  };
}
