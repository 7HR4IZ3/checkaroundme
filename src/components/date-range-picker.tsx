"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarDateRangePickerProps {
  date: [Date | undefined, Date | undefined];
  onDateChange: (date: [Date | undefined, Date | undefined]) => void;
  className?: string;
}

export function CalendarDateRangePicker({
  date,
  onDateChange,
  className,
}: CalendarDateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.length === 2 ? (
              date[0] && date[1] ? (
                <>
                  {format(date[0], "LLL dd, y")} -{" "}
                  {format(date[1], "LLL dd, y")}
                </>
              ) : (
                <span>Pick a date range</span>
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date[0]}
            selected={{ from: date[0], to: date[1] }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateChange([range.from, range.to]);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
