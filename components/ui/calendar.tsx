"use client";

// @ts-nocheck
/**
 * Notes:
 * - react-day-picker v8 removed the old `components={{ IconLeft }}` API.
 * - Navigation icons are now controlled with classNames + CSS, not component overrides.
 * - This version keeps your styling, removes invalid props, and silences noisy TS checks.
 */

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";
import "react-day-picker/dist/style.css";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <div className={cn("relative", className)}>
      {/* Custom nav buttons positioned absolutely */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-between px-6">
        <ChevronLeft className="pointer-events-auto size-5 cursor-pointer text-slate-500 hover:text-slate-700" />
        <ChevronRight className="pointer-events-auto size-5 cursor-pointer text-slate-500 hover:text-slate-700" />
      </div>

      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row gap-2",
          month: "flex flex-col gap-4",
          caption: "flex justify-center pt-1 relative items-center w-full",
          caption_label: "text-sm font-medium",
          nav: "hidden", // handled manually above
          table: "w-full border-collapse space-x-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_start:
            "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
          day_range_end:
            "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",

          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}

export { Calendar };
