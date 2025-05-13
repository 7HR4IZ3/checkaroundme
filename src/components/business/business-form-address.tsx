import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types for the data fetched via tRPC to ensure type safety
interface CountryData {
  name: string;
  isoCode: string;
  phonecode: string | null; // Match the type from the tRPC router
}

interface StateData {
  name: string;
  isoCode: string;
}

interface CityData {
  name: string;
}

interface BusinessFormAddressProps {
  addressLine1: string;
  setAddressLine1: (value: string) => void;
  addressLine1Error: string;
  setAddressLine1Error: (value: string) => void;

  country: string;
  setCountry: (value: string) => void;
  countryIsoCode: string | undefined;
  setCountryIsoCode: (value: string | undefined) => void;
  countryError: string;
  setCountryError: (value: string) => void;

  state: string;
  setState: (value: string) => void;
  stateIsoCode: string | undefined;
  setStateIsoCode: (value: string | undefined) => void;

  city: string;
  setCity: (value: string) => void;
  cityError: string;
  setCityError: (value: string) => void;

  phoneCountryCode: string;
  setPhoneCountryCode: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;

  // tRPC query results passed as props
  countriesData: CountryData[] | undefined;
  isLoadingCountries: boolean;
  statesData: StateData[] | undefined;
  isLoadingStates: boolean;
  citiesData: CityData[] | undefined;
  isLoadingCities: boolean;
}

export const BusinessFormAddress: React.FC<BusinessFormAddressProps> =
  React.memo(
    ({
      addressLine1,
      setAddressLine1,
      addressLine1Error,
      setAddressLine1Error,
      country,
      setCountry,
      countryIsoCode,
      setCountryIsoCode,
      countryError,
      setCountryError,
      state,
      setState,
      stateIsoCode,
      setStateIsoCode,
      city,
      setCity,
      cityError,
      setCityError,
      phoneCountryCode,
      setPhoneCountryCode,
      phoneNumber,
      setPhoneNumber,
      countriesData,
      isLoadingCountries,
      statesData,
      isLoadingStates,
      citiesData,
      isLoadingCities,
    }) => {
      // Handler for country selection (main dropdown)
      const handleCountryChange = (value: string) => {
        setCountry(value);
        setCountryError("");
        setState(""); // Clear state name
        setStateIsoCode(undefined); // Clear state ISO code
        setCity(""); // Clear city name

        const selectedCountryData = countriesData?.find(
          (c) => c.name === value
        );
        if (selectedCountryData) {
          setCountryIsoCode(selectedCountryData.isoCode);
          setPhoneCountryCode(selectedCountryData.phonecode || "+");
        } else {
          setCountryIsoCode(undefined);
          setPhoneCountryCode("+");
        }
      };

      // Handler for state selection
      const handleStateChange = (value: string) => {
        setState(value);
        setCity(""); // Clear city name
        const selectedStateData = statesData?.find((s) => s.name === value);
        setStateIsoCode(selectedStateData?.isoCode);
      };

      // Handler for country selection (phone code dropdown)
      const handlePhoneCountryChange = (value: string) => {
        setCountry(value); // Update country name based on selection
        const selectedCountryData = countriesData?.find(
          (c) => c.name === value
        );
        if (selectedCountryData) {
          setCountryIsoCode(selectedCountryData.isoCode); // Update ISO code
          setPhoneCountryCode(selectedCountryData.phonecode || "+"); // Update phone code
        } else {
          setPhoneCountryCode("+");
        }
        // Also clear state/city when changing country via phone code dropdown
        setState("");
        setStateIsoCode(undefined);
        setCity("");
      };

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            Business Address
          </h3>
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            {/* Address Line 1 */}
            <div className="flex-grow">
              <Label htmlFor="addressLine1" className="font-semibold">
                <span className="text-destructive">*</span> Business Address
                Line 1
              </Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                required
                onChange={(e) => {
                  setAddressLine1(e.target.value);
                  setAddressLine1Error(""); // Clear error on change
                }}
                placeholder="Enter address line 1"
                className={`mt-2 ${addressLine1Error ? "border-red-500" : ""}`}
              />
              {addressLine1Error && (
                <p className="text-red-500 text-sm mt-1">{addressLine1Error}</p>
              )}
            </div>

            {/* Country */}
            <div className="flex-grow">
              <Label htmlFor="country" className="font-semibold">
                <span className="text-destructive">*</span> Country
              </Label>
              <Select
                value={country}
                onValueChange={handleCountryChange}
                required
              >
                <SelectTrigger
                  id="country"
                  className={`mt-2 w-[100%] ${
                    countryError ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCountries && (
                    <SelectItem value="loading" disabled>
                      Loading countries...
                    </SelectItem>
                  )}
                  {countriesData?.map((c) => (
                    <SelectItem key={c.isoCode} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {countryError && (
                <p className="text-red-500 text-sm mt-1">{countryError}</p>
              )}
            </div>

            {/* State */}
            <div className="flex-grow">
              <Label htmlFor="state" className="font-semibold">
                <span className="text-destructive">*</span> State
              </Label>
              <Select
                value={state}
                onValueChange={handleStateChange}
                required
                disabled={!countryIsoCode || isLoadingStates}
              >
                <SelectTrigger
                  id="state"
                  className={`mt-2 w-[100%] ${
                    cityError ? "border-red-500" : ""
                  }`} // Use cityError for state as well
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingStates && (
                    <SelectItem value="loading" disabled>
                      Loading states...
                    </SelectItem>
                  )}
                  {!isLoadingStates &&
                    statesData?.length === 0 &&
                    countryIsoCode && (
                      <SelectItem value="no-states" disabled>
                        No states found
                      </SelectItem>
                    )}
                  {statesData?.map((s) => (
                    <SelectItem key={s.isoCode} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* No separate state error, covered by cityError */}
            </div>

            {/* City */}
            <div className="flex-grow">
              <Label htmlFor="city" className="font-semibold">
                <span className="text-destructive">*</span> City
              </Label>
              <Select
                value={city}
                onValueChange={(value) => {
                  setCity(value);
                  setCityError(""); // Clear error on change
                }}
                required
                disabled={!stateIsoCode || isLoadingCities}
              >
                <SelectTrigger
                  id="city"
                  className={`mt-2 w-[100%] ${
                    cityError ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCities && (
                    <SelectItem value="loading" disabled>
                      Loading cities...
                    </SelectItem>
                  )}
                  {!isLoadingCities &&
                    citiesData?.length === 0 &&
                    stateIsoCode && (
                      <SelectItem value="no-cities" disabled>
                        No cities found
                      </SelectItem>
                    )}
                  {citiesData?.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cityError && (
                <p className="text-red-500 text-sm mt-1">{cityError}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex-grow">
              <Label htmlFor="phoneNumber" className="font-semibold">
                Phone number
              </Label>
              <div className="flex gap-2 mt-2">
                <Select
                  value={country} // Bind to selected country name for consistency
                  onValueChange={handlePhoneCountryChange}
                >
                  <SelectTrigger
                    id="phoneCountryCode"
                    className="w-auto min-w-[8rem]"
                  >
                    <SelectValue placeholder="Country Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCountries && (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
                    {countriesData
                      ?.sort((a, b) => a.name.localeCompare(b.name)) // Sort by name
                      .map((c) => (
                        <SelectItem key={c.isoCode} value={c.name}>
                          {c.name} ({c.phonecode || "N/A"})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1"
                  aria-label="Phone number"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
  );

BusinessFormAddress.displayName = "BusinessFormAddress"; // Add display name for React DevTools
