import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  UseFormWatch,
  Controller,
} from "react-hook-form";
import { BusinessFormValues } from "./business-form"; // Import the main form values type

interface BusinessFormHoursProps {
  // Pass RHF props down based on the main form values
  register: UseFormRegister<BusinessFormValues>;
  errors: FieldErrors<BusinessFormValues>;
  control: Control<BusinessFormValues>;
  setValue: UseFormSetValue<BusinessFormValues>;
  watch: UseFormWatch<BusinessFormValues>;
}

export const BusinessFormHours: React.FC<BusinessFormHoursProps> = (
  ({ control, setValue, watch }) => {
    // Watch the hours object from RHF
    const availableHours = watch("hours") ?? {};

    const updateBusinessHours = useCallback(
      (
        day: string,
        type: "open" | "close" | "closed",
        value: string | boolean
      ) => {
        setValue(`hours.${day}.${type}` as any, value); // Update nested RHF state
      },
      [setValue]
    );

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Available Hours</h3>
        <div className="space-y-2 text-sm text-muted-foreground mt-2">
          {days.map((day) => {
            const hours = availableHours[day] || {
              open: "",
              close: "",
              closed: false,
            }; // Provide default if day is missing
            return (
              <div key={day} className="flex items-center gap-2 md:gap-8">
                <span className="w-1/5 font-medium text-card-foreground">
                  {day}
                </span>
                <div className="flex flex-row flex-grow">
                  <Controller
                    name={`hours.${day}.open` as any} // Use dot notation for nested fields
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="time"
                        className="border-0 border-bottom"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={hours.closed}
                        aria-label={`${day} open time`}
                      />
                    )}
                  />
                  <span className="flex items-center px-2">-</span>
                  <Controller
                    name={`hours.${day}.close` as any} // Use dot notation for nested fields
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="time"
                        className="border-0 border-bottom"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={hours.closed}
                        aria-label={`${day} close time`}
                      />
                    )}
                  />
                </div>
                <span className="flex items-center gap-3">
                  <Label htmlFor={`${day}-closed`}>Closed</Label>
                  <Controller
                    name={`hours.${day}.closed` as any} // Use dot notation for nested fields
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        className="h-5 w-5 data-[state=checked]:bg-primary"
                        id={`${day}-closed`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={`${day} closed toggle`}
                      />
                    )}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

BusinessFormHours.displayName = "BusinessFormHours";
