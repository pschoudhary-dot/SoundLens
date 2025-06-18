"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md border border-input",
          "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-700/50 [&:has([aria-selected])]:bg-gray-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-gray-700 focus:bg-gray-700 focus:outline-none",
          "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#22c55e] text-white hover:bg-[#22c55e] hover:text-white focus:bg-[#22c55e] focus:text-white",
        day_today: "bg-gray-700 text-white",
        day_outside:
          "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-700/50 aria-selected:text-gray-400 aria-selected:opacity-30",
        day_disabled: "text-gray-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-gray-700 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // @ts-ignore - The DayPicker types are incorrect
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        // @ts-ignore - The DayPicker types are incorrect
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
