"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

export function Calendar({
  selected,
  onSelect,
  fromYear = 1950,
  toYear = new Date().getFullYear(),
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected?.getMonth() ?? new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(selected?.getFullYear() ?? new Date().getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onSelect?.(newDate);
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isSelected = (day: number | null) => {
    if (!day || !selected) return false;
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth &&
      selected.getFullYear() === currentYear
    );
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  return (
    <div className={cn("p-4", className)}>
      {/* Header with Month and Year Selection */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          <Select
            value={currentMonth.toString()}
            onValueChange={(value) => setCurrentMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentYear.toString()}
            onValueChange={(value) => setCurrentYear(parseInt(value))}
          >
            <SelectTrigger className="w-[90px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-muted-foreground text-xs"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index}>
              {day ? (
                <Button
                  variant={isSelected(day) ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-full",
                    isToday(day) && !isSelected(day) && "bg-accent",
                    isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                </Button>
              ) : (
                <div className="h-8 w-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
