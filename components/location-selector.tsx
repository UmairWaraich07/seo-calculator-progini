"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LoadingSpinner } from "./loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type LocationOption = {
  name: string;
  code: number;
  full_name: string;
  location_type: string;
};

interface LocationSelectorProps {
  value: string;
  onChange: (value: string, locationCode?: number) => void;
  onLocationCodeChange?: (locationCode: number) => void;
  disabled?: boolean;
  isNationalScope?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  onLocationCodeChange,
  disabled = false,
  isNationalScope = false,
}: LocationSelectorProps) {
  const [openState, setOpenState] = React.useState(false);
  const [openCity, setOpenCity] = React.useState(false);
  const [states, setStates] = React.useState<LocationOption[]>([]);
  const [cities, setCities] = React.useState<LocationOption[]>([]);
  const [loadingStates, setLoadingStates] = React.useState(false);
  const [loadingCities, setLoadingCities] = React.useState(false);
  const [selectedState, setSelectedState] =
    React.useState<LocationOption | null>(null);
  const [selectedCity, setSelectedCity] = React.useState<LocationOption | null>(
    null
  );
  const [showCityAlert, setShowCityAlert] = React.useState(false);

  // If national scope, set US as default location code
  React.useEffect(() => {
    if (isNationalScope && onLocationCodeChange) {
      onLocationCodeChange(2840); // US location code
    }
  }, [isNationalScope, onLocationCodeChange]);

  // Fetch states when component mounts
  React.useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await fetch("/api/locations");
        if (!response.ok) {
          throw new Error("Failed to fetch states");
        }
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Parse the current value to see if it contains state and city
  React.useEffect(() => {
    if (!value || states.length === 0) return;

    const parts = value.split(", ");
    if (parts.length >= 2) {
      const cityName = parts[0];
      const stateName = parts[1];

      // Find the state in our list
      const state = states.find((s) => s.name === stateName);
      if (state) {
        setSelectedState(state);

        // Fetch cities for this state
        fetchCitiesForState(state.name).then((citiesData) => {
          console.log(`Looking for city "${cityName}" in fetched cities`);
          // Find the city in the fetched cities data
          const city = citiesData.find(
            (c: LocationOption) => c.name === cityName
          );
          if (city) {
            console.log(`Found matching city:`, city);
            setSelectedCity(city);
            if (onLocationCodeChange) {
              onLocationCodeChange(city.code);
            }
          } else {
            console.log(`City "${cityName}" not found in fetched cities`);
          }
        });
      }
    } else {
      // It might be just a state
      const state = states.find((s) => s.name === value);
      if (state) {
        setSelectedState(state);
        setSelectedCity(null);
        if (onLocationCodeChange) {
          onLocationCodeChange(state.code);
        }

        // Pre-fetch cities for this state
        fetchCitiesForState(state.name);
      }
    }
  }, [value, states, onLocationCodeChange]);

  // Fetch cities for a selected state
  const fetchCitiesForState = async (stateName: string) => {
    setLoadingCities(true);
    try {
      console.log(`Fetching cities for state: ${stateName}`);
      const response = await fetch(
        `/api/locations?state=${encodeURIComponent(stateName)}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cities: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Log the raw response to see what we're getting
      console.log(`Raw API response for ${stateName} cities:`, data);

      // Ensure data is an array
      const citiesArray = Array.isArray(data) ? data : [];
      console.log(`Processed ${citiesArray.length} cities for ${stateName}`);

      // Log the first few cities to verify the data structure
      if (citiesArray.length > 0) {
        console.log("Sample cities:", citiesArray.slice(0, 3));
      } else {
        console.warn(`No cities found for ${stateName}`);
      }

      setCities(citiesArray);
      return citiesArray;
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
      return [];
    } finally {
      setLoadingCities(false);
    }
  };

  React.useEffect(() => {
    console.log(`Cities state updated: ${cities.length} cities available`);
  }, [cities]);

  const handleStateSelect = async (stateName: string) => {
    console.log(`State selected: ${stateName}`);
    const state = states.find((s) => s.name === stateName);
    if (state) {
      setSelectedState(state);
      setSelectedCity(null);

      // Update the value with just the state
      onChange(state.name, state.code);
      if (onLocationCodeChange) {
        onLocationCodeChange(state.code);
      }

      // Fetch cities for this state
      const citiesData = await fetchCitiesForState(state.name);
      console.log(`Fetched ${citiesData.length} cities for ${state.name}`);

      // Hide city alert if it was shown
      setShowCityAlert(false);
    }
    setOpenState(false);
  };

  const handleCitySelect = (cityName: string) => {
    if (!selectedState) {
      setShowCityAlert(true);
      return;
    }

    const city = cities.find((c) => c.name === cityName);
    if (city && selectedState) {
      setSelectedCity(city);

      // Update the value with city and state
      onChange(`${city.name}`, city.code);
      if (onLocationCodeChange) {
        onLocationCodeChange(city.code);
      }
    }
    setOpenCity(false);
  };

  const handleCityTriggerClick = () => {
    if (!selectedState) {
      setShowCityAlert(true);
    } else {
      setOpenCity(!openCity);
    }
  };

  return (
    <div className="space-y-2">
      {showCityAlert && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please select a state first</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">State</label>
          <Popover open={openState} onOpenChange={setOpenState}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openState}
                className="w-full justify-between"
                disabled={disabled || loadingStates || isNationalScope}
              >
                <div className="flex items-center">
                  {selectedState ? (
                    <>
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{selectedState.name}</span>
                    </>
                  ) : (
                    <span>
                      {isNationalScope ? "United States" : "Select state..."}
                    </span>
                  )}
                </div>
                {loadingStates ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search state..." />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    {Array.isArray(states) &&
                      states.map((state) => (
                        <CommandItem
                          key={state.code}
                          value={state.name}
                          onSelect={handleStateSelect}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedState?.name === state.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span>{state.name}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            City (Optional)
          </label>
          <Popover open={openCity} onOpenChange={setOpenCity}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCity}
                className="w-full justify-between"
                disabled={
                  disabled || loadingCities || !selectedState || isNationalScope
                }
                onClick={handleCityTriggerClick}
              >
                <div className="flex items-center">
                  {selectedCity ? (
                    <>
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{selectedCity.name}</span>
                    </>
                  ) : (
                    <span>Select city...</span>
                  )}
                </div>
                {loadingCities ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>
                    {cities.length === 0
                      ? "No cities available for this state."
                      : "No city found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {Array.isArray(cities) &&
                      cities.map((city) => (
                        <CommandItem
                          key={city.code}
                          value={city.name}
                          onSelect={handleCitySelect}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCity?.name === city.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span>{city.name}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isNationalScope ? (
        <p className="text-xs text-muted-foreground mt-1">
          Location is set to United States for national analysis. State and city
          selection is optional.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-1">
          <span className="text-red-500">*</span> Location is required for local
          analysis.
        </p>
      )}
    </div>
  );
}
