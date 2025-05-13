import ipdata from "ipdata";
import { z } from "zod";
import { Country, State, City } from "country-state-city";
import type { AppTRPC } from "../router";

export function createLocationProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure, // Keep protectedProcedure even if unused for now
) {
  // Replace 'YOUR_IPDATA_API_KEY' with your actual API key, preferably from an environment variable
  const ipdataClient = new ipdata(
    process.env.IPDATA_API_KEY || "YOUR_IPDATA_API_KEY",
  );

  return {
    // --- Existing Geolocation Procedure ---
    getGeolocation: t.procedure.query(async () => {
      try {
        const response = await ipdataClient.lookup();
        return {
          latitude: response.latitude,
          longitude: response.longitude,
        };
      } catch (error) {
        console.error("Error fetching geolocation from ipdata:", error);
        // Consider throwing a TRPCError for better client handling
        throw new Error("Failed to fetch geolocation");
      }
    }),

    // --- New Country/State/City Procedures ---

    /**
     * Fetches all countries with basic details.
     */
    getCountries: t.procedure.query(() => {
      try {
        const countries = Country.getAllCountries().map((c) => ({
          name: c.name,
          isoCode: c.isoCode,
          phonecode: c.phonecode, // Keep phonecode for the phone input
        }));
        return countries;
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        // Consider throwing a TRPCError here
        return [];
      }
    }),

    /**
     * Fetches states for a given country ISO code.
     */
    getStatesByCountry: t.procedure
      .input(z.object({ countryIsoCode: z.string().optional() })) // Make optional to handle initial undefined state
      .query(({ input }) => {
        try {
          if (!input.countryIsoCode) {
            return []; // Return empty if no country code provided
          }
          const states = State.getStatesOfCountry(input.countryIsoCode).map(
            (s) => ({
              name: s.name,
              isoCode: s.isoCode,
            }),
          );
          return states;
        } catch (error) {
          console.error(
            `Failed to fetch states for country ${input.countryIsoCode}:`,
            error,
          );
          return [];
        }
      }),

    /**
     * Fetches cities for a given country and state ISO code.
     */
    getCitiesByState: t.procedure
      .input(
        z.object({
          countryIsoCode: z.string().optional(), // Make optional
          stateIsoCode: z.string().optional(), // Make optional
        }),
      )
      .query(({ input }) => {
        try {
          if (!input.countryIsoCode || !input.stateIsoCode) {
            return []; // Return empty if codes are missing
          }
          const cities = City.getCitiesOfState(
            input.countryIsoCode,
            input.stateIsoCode,
          ).map((city) => ({
            name: city.name,
            // Add other city properties if needed
          }));
          return cities;
        } catch (error) {
          console.error(
            `Failed to fetch cities for state ${input.stateIsoCode} in country ${input.countryIsoCode}:`,
            error,
          );
          return [];
        }
      }),
  };
}
