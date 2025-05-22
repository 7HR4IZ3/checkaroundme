import React, { useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { BusinessFormValues } from "./business-form"; // Import the main form values type
import { Controller } from "react-hook-form";
import { trpc } from "@/lib/trpc/client";

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
  // Pass RHF props down based on the main form values
  register: UseFormRegister<BusinessFormValues>;
  errors: FieldErrors<BusinessFormValues>;
  control: Control<BusinessFormValues>;
  setValue: UseFormSetValue<BusinessFormValues>;
  watch: UseFormWatch<BusinessFormValues>;
}

export const BusinessFormAddress: React.FC<BusinessFormAddressProps> = ({
  register,
  errors,
  control,
  setValue,
  watch,
}) => {
  // Watch relevant fields from the main form state
  const countryIsoCode = watch("country");
  const stateIsoCode = watch("state");

  const { data: countriesData, isLoading: isLoadingCountries } =
    trpc.getCountries.useQuery();
  const { data: statesData, isLoading: isLoadingStates } =
    trpc.getStatesByCountry.useQuery(
      { countryIsoCode: countryIsoCode },
      { enabled: !!countryIsoCode } // Only fetch states when a country ISO code is selected
    );
  const { data: citiesData, isLoading: isLoadingCities } =
    trpc.getCitiesByState.useQuery(
      { countryIsoCode: countryIsoCode, stateIsoCode: stateIsoCode },
      { enabled: !!countryIsoCode && !!stateIsoCode } // Only fetch cities when country and state ISO codes are selected
    );

  // Effect to update phone country code when country ISO code changes
  useEffect(() => {
    if (countryIsoCode && countriesData) {
      const selectedCountryData = countriesData.find(
        (c) => c.isoCode === countryIsoCode
      );
      if (selectedCountryData) {
        setValue("phoneCountryCode", selectedCountryData.phonecode || "+");
      } else {
        setValue("phoneCountryCode", "+");
      }
    } else {
      setValue("phoneCountryCode", "+");
    }
  }, [countryIsoCode, countriesData, setValue]);

  // Handler for country selection (main dropdown)
  const handleCountryChange = (isoCode: string) => {
    setValue("country", isoCode); // Set ISO code in form state
    setValue("state", ""); // Clear state
    setValue("city", ""); // Clear city

    const selectedCountryData = countriesData?.find(
      (c) => c.isoCode === isoCode
    );
    if (selectedCountryData) {
      setValue("phoneCountryCode", selectedCountryData.phonecode || "+");
    } else {
      setValue("phoneCountryCode", "+");
    }
  };

  // Handler for state selection
  const handleStateChange = (isoCode: string) => {
    setValue("state", isoCode); // Set ISO code in form state
    setValue("city", ""); // Clear city
  };

  // Handler for city selection
  const handleCityChange = (value: string) => {
    setValue("city", value); // Set city name in form state
  };

  // Handler for phone country code selection (dropdown)
  const handlePhoneCountryCodeChange = (phonecode: string) => {
    // Find the country by phonecode and update the main country field as well
    const selectedCountryData = countriesData?.find(
      (c) => c.phonecode === phonecode
    );
    if (selectedCountryData) {
      setValue("country", selectedCountryData.isoCode); // Update main country field
      setValue("phoneCountryCode", phonecode); // Update phone country code field
      // Also clear state/city when changing country via phone code dropdown
      setValue("state", "");
      setValue("city", "");
    } else {
      setValue("phoneCountryCode", phonecode); // Just update phone country code if country not found
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Business Address</h3>
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        {/* Address Line 1 */}
        <div className="flex-grow">
          <Label htmlFor="addressLine1" className="font-semibold">
            <span className="text-destructive">*</span> Business Address Line 1
          </Label>
          <Input
            id="addressLine1"
            {...register("addressLine1")}
            required
            placeholder="Enter address line 1"
            className={`mt-2 ${errors.addressLine1 ? "border-red-500" : ""}`}
          />
          {errors.addressLine1 && (
            <p className="text-red-500 text-sm mt-1">
              {errors.addressLine1.message}
            </p>
          )}
        </div>

        {/* Country */}
        <div className="flex-grow">
          <Label htmlFor="country" className="font-semibold">
            <span className="text-destructive">*</span> Country
          </Label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={handleCountryChange}
                required
                disabled={isLoadingCountries}
              >
                <SelectTrigger
                  id="country"
                  className={`mt-2 w-[100%] ${
                    errors.country ? "border-red-500" : ""
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
                    <SelectItem key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">
              {errors.country.message}
            </p>
          )}
        </div>

        {/* State */}
        <div className="flex-grow">
          <Label htmlFor="state" className="font-semibold">
            <span className="text-destructive">*</span> State
          </Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={handleStateChange}
                required
                disabled={!countryIsoCode || isLoadingStates}
              >
                <SelectTrigger
                  id="state"
                  className={`mt-2 w-[100%] ${
                    errors.state ? "border-red-500" : ""
                  }`}
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
                    <SelectItem key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* City */}
        <div className="flex-grow">
          <Label htmlFor="city" className="font-semibold">
            <span className="text-destructive">*</span> City
          </Label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={handleCityChange}
                required
                disabled={!stateIsoCode || isLoadingCities}
              >
                <SelectTrigger
                  id="city"
                  className={`mt-2 w-[100%] ${
                    errors.city ? "border-red-500" : ""
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
            )}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="flex-grow">
          <Label htmlFor="phoneNumber" className="font-semibold">
            Phone number
          </Label>
          <div className="flex gap-2 mt-2">
            <Controller
              name="phoneCountryCode"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={handlePhoneCountryCodeChange}
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
                        <SelectItem key={c.isoCode} value={c.phonecode || "+"}>
                          {c.name} ({c.phonecode || "N/A"})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              id="phoneNumber"
              type="tel"
              {...register("phoneNumber")}
              placeholder="Enter phone number"
              className="flex-1"
              aria-label="Phone number"
            />{errors.about && (
          <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
        )}
          </div>
          {(errors.phoneNumber || errors.phoneCountryCode) && (
            <p className="text-red-500 text-sm mt-1">
              {(errors.phoneNumber || errors.phoneCountryCode)?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

BusinessFormAddress.displayName = "BusinessFormAddress";
