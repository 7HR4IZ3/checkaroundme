import { Country, State, City } from "country-state-city";

export type LocationHierarchy = {
  [countryCode: string]: {
    name: string;
    states: {
      [stateCode: string]: {
        name: string;
        cities: string[];
      };
    };
  };
};

export type LocationData = {
  city: string;
  stateCode: string;
  countryCode: string;
};

export function organizeLocations(
  locations: LocationData[]
): LocationHierarchy {
  return locations.reduce((acc: LocationHierarchy, location) => {
    const { city, stateCode, countryCode } = location;

    // Get country and state details from their ISO codes
    const country = Country.getCountryByCode(countryCode);
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);

    if (!country || !state) return acc;

    if (!acc[countryCode]) {
      acc[countryCode] = {
        name: country.name,
        states: {},
      };
    }

    if (!acc[countryCode].states[stateCode]) {
      acc[countryCode].states[stateCode] = {
        name: state.name,
        cities: [],
      };
    }

    if (!acc[countryCode].states[stateCode].cities.includes(city)) {
      acc[countryCode].states[stateCode].cities.push(city);
    }

    return acc;
  }, {});
}

export function formatLocationString(
  countryCode: string,
  stateCode?: string,
  city?: string
): string {
  const country = Country.getCountryByCode(countryCode) || {
    name: countryCode,
  };
  if (!countryCode) return "";

  if (city && stateCode) {
    const state = State.getStateByCodeAndCountry(stateCode, countryCode) || {
      name: stateCode,
    };
    return `${city}, ${state.name}, ${country.name}`;
  }

  if (stateCode) {
    const state = State.getStateByCodeAndCountry(stateCode, countryCode) || {
      name: stateCode,
    };
    return `${state.name}, ${country.name}`;
  }
  return country.name;
}
