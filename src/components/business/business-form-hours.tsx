import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface HourState {
  open: string;
  close: string;
  closed: boolean;
}

interface AvailableHoursState {
  [key: string]: HourState;
}

interface BusinessFormHoursProps {
  availableHours: AvailableHoursState;
  setAvailableHours: React.Dispatch<React.SetStateAction<AvailableHoursState>>;
}

export const BusinessFormHours: React.FC<BusinessFormHoursProps> = React.memo(
  ({ availableHours, setAvailableHours }) => {
    const updateBusinessHours = useCallback(
      (day: string, type: keyof HourState, value: string | boolean) => {
        setAvailableHours((prev) => ({
          ...prev,
          [day]: {
            ...prev[day],
            [type]: value,
          },
        }));
      },
      [setAvailableHours]
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Available Hours</h3>
        <div className="space-y-2 text-sm text-muted-foreground mt-2">
          {Object.entries(availableHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-2 md:gap-8">
              <span className="w-1/5 font-medium text-card-foreground">
                {day}
              </span>
              <div className="flex flex-row flex-grow">
                <Input
                  type="time"
                  className="border-0 border-bottom"
                  value={hours.open}
                  onChange={(ev) =>
                    updateBusinessHours(day, "open", ev.target.value)
                  }
                  disabled={hours.closed}
                  name={`${day}-open`}
                  aria-label={`${day} open time`}
                />
                <span className="flex items-center px-2">-</span>
                <Input
                  type="time"
                  className="border-0 border-bottom"
                  value={hours.close}
                  onChange={(ev) =>
                    updateBusinessHours(day, "close", ev.target.value)
                  }
                  disabled={hours.closed}
                  name={`${day}-close`}
                  aria-label={`${day} close time`}
                />
              </div>
              <span className="flex items-center gap-3">
                <Label htmlFor={`${day}-closed`}>Closed</Label>
                <Checkbox
                  className="h-5 w-5 data-[state=checked]:bg-primary"
                  id={`${day}-closed`}
                  name={`${day}-closed`}
                  checked={hours.closed}
                  onCheckedChange={(checked) =>
                    updateBusinessHours(day, "closed", checked as boolean)
                  }
                  aria-label={`${day} closed toggle`}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

BusinessFormHours.displayName = "BusinessFormHours";
