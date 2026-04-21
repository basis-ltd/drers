import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChangeEvent, FocusEvent, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Select from "./Select";

type DatePickerProps = {
  value?: Date | string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  name?: string;
  selectionType?: "date" | "month" | "year" | "recurringDate" | undefined;
  fromDate?: Date;
  placeholder?: string;
  toDate?: Date;
  disabled?: boolean;
};

const parseDateValue = (value?: Date | string): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  const parsed = moment(value, ["YYYY-MM-DD", moment.ISO_8601], true);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

const DatePicker = ({
  onChange,
  onBlur,
  value,
  name,
  selectionType,
  fromDate = undefined,
  placeholder = "Select date",
  toDate = undefined,
  disabled = false,
}: DatePickerProps) => {
  const normalizedValue = useMemo(() => parseDateValue(value), [value]);

  const validYearRange = useMemo(() => {
    const minYear = fromDate ? fromDate.getFullYear() : 1900;
    const maxYear = toDate ? toDate.getFullYear() : 2199;
    return { minYear, maxYear };
  }, [fromDate, toDate]);

  const resolveFallbackMonth = () => {
    const now = moment();
    const isNowInRange =
      (!fromDate || now.isSameOrAfter(moment(fromDate), "day")) &&
      (!toDate || now.isSameOrBefore(moment(toDate), "day"));

    if (isNowInRange) return now.toDate();
    if (fromDate) return fromDate;
    if (toDate) return toDate;
    return now.toDate();
  };

  const [year, setYear] = useState<string | undefined>(() => {
    if (normalizedValue) return String(normalizedValue.getFullYear());
    return String(resolveFallbackMonth().getFullYear());
  });

  const [defaultMonth, setDefaultMonth] = useState<Date | undefined>(() => {
    if (normalizedValue) return normalizedValue;
    return resolveFallbackMonth();
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (normalizedValue) {
      queueMicrotask(() => {
        setYear(String(normalizedValue.getFullYear()));
        setDefaultMonth(normalizedValue);
      });
    }
  }, [normalizedValue]);

  const validMonths = useMemo(() => {
    if (!year) return [];

    const selectedYear = parseInt(year);
    const months: Array<{ value: string; label: string }> = [];

    for (let i = 0; i < 12; i++) {
      const monthStart = moment(
        `${selectedYear}-${String(i + 1).padStart(2, "0")}-01`,
        "YYYY-MM-DD",
      );
      const monthEnd = monthStart.clone().endOf("month");

      // Check if this month has any valid dates within the range
      const hasValidDates =
        (!fromDate || monthEnd.isSameOrAfter(moment(fromDate), "day")) &&
        (!toDate || monthStart.isSameOrBefore(moment(toDate), "day"));

      if (hasValidDates) {
        months.push({
          value: String(i + 1).padStart(2, "0"),
          label: moment().month(i).format("MMM"),
        });
      }
    }

    return months;
  }, [year, fromDate, toDate]);

  const emitBlur = (nextValue: string) => {
    onBlur?.({
      target: { name: name ?? "", value: nextValue },
      currentTarget: { name: name ?? "", value: nextValue },
    } as FocusEvent<HTMLInputElement>);
  };

  const emitChange = (nextDate: Date) => {
    const nextValue = moment(nextDate).format("YYYY-MM-DD");
    onChange?.({
      target: { name: name ?? "", value: nextValue, type: "date" },
      currentTarget: { name: name ?? "", value: nextValue, type: "date" },
    } as ChangeEvent<HTMLInputElement>);
    return nextValue;
  };

  const displayValue = useMemo(() => {
    if (!normalizedValue) return null;
    if (selectionType === "recurringDate") {
      return moment(normalizedValue).format("MMMM DD");
    }
    if (selectionType === "month") {
      return moment(normalizedValue).format("MMMM YYYY");
    }
    if (selectionType === "year") {
      return moment(normalizedValue).format("YYYY");
    }
    return moment(normalizedValue).format("MMMM DD, YYYY");
  }, [normalizedValue, selectionType]);

  const currentMonthValue = defaultMonth
    ? moment(defaultMonth).format("MM")
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-full h-10 px-4 justify-start text-[12px]! text-left font-normal text-sm text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out hover:border-gray-300 hover:bg-white/90",
            !normalizedValue && "text-gray-400",
          )}
        >
          <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-1 text-gray-500" />
          {displayValue ? (
            displayValue
          ) : (
            <span className="text-[12px] text-gray-700 font-light">
              {placeholder}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg"
        align="start"
      >
        <menu className="flex flex-col w-full gap-3 p-4">
          <ul
            className={`w-full grid gap-3 p-0 ${
              selectionType === "recurringDate" ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {selectionType !== "recurringDate" && (
              <Select
                className="!h-8"
                placeholder="Year"
                onChange={(e) => {
                  setYear(e);
                  // Update defaultMonth to the selected year, preserving month if valid
                  if (defaultMonth) {
                    const newYear = parseInt(e);
                    const currentMonthValue = moment(defaultMonth).format("MM");

                    // Calculate valid months for the new year
                    const monthsForNewYear: Array<{
                      value: string;
                      label: string;
                    }> = [];
                    for (let i = 0; i < 12; i++) {
                      const monthStart = moment(
                        `${newYear}-${String(i + 1).padStart(2, "0")}-01`,
                        "YYYY-MM-DD",
                      );
                      const monthEnd = monthStart.clone().endOf("month");

                      const hasValidDates =
                        (!fromDate ||
                          monthEnd.isSameOrAfter(moment(fromDate), "day")) &&
                        (!toDate ||
                          monthStart.isSameOrBefore(moment(toDate), "day"));

                      if (hasValidDates) {
                        monthsForNewYear.push({
                          value: String(i + 1).padStart(2, "0"),
                          label: moment().month(i).format("MMM"),
                        });
                      }
                    }

                    // Check if current month is valid for new year
                    const isCurrentMonthValid = monthsForNewYear.some(
                      (m) => m.value === currentMonthValue,
                    );

                    if (isCurrentMonthValid && monthsForNewYear.length > 0) {
                      // Preserve month number, update year
                      setDefaultMonth(
                        moment(
                          `${newYear}-${currentMonthValue}-01`,
                          "YYYY-MM-DD",
                        ).toDate(),
                      );
                    } else if (monthsForNewYear.length > 0) {
                      // Use first valid month of new year
                      const firstValidMonth = monthsForNewYear[0];
                      setDefaultMonth(
                        moment(
                          `${newYear}-${firstValidMonth.value}-01`,
                          "YYYY-MM-DD",
                        ).toDate(),
                      );
                    }
                  }
                }}
                value={year}
                options={Array.from(
                  {
                    length: validYearRange.maxYear - validYearRange.minYear + 1,
                  },
                  (_, i) => ({
                    value: String(validYearRange.maxYear - i),
                    label: String(validYearRange.maxYear - i),
                  }),
                )}
              />
            )}
            <Select
              className="!h-8"
              placeholder="Month"
              onChange={(e) => {
                if (!year) return;
                setDefaultMonth(
                  moment(`${year}-${e}-01`, "YYYY-MM-DD", true).toDate(),
                );
              }}
              value={currentMonthValue}
              options={validMonths}
            />
          </ul>
          <Calendar
            fromDate={fromDate}
            toDate={toDate}
            mode="single"
            month={defaultMonth}
            onMonthChange={(e) => {
              if (selectionType !== "recurringDate") {
                setDefaultMonth(e);
                setYear(String(e.getFullYear()));
              }
            }}
            selected={normalizedValue}
            onSelect={(e) => {
              if (e) {
                setDefaultMonth(e);
                setYear(String(e.getFullYear()));
                const nextValue = emitChange(e);
                emitBlur(nextValue);
                setOpen(false);
              }
            }}
            modifiers={{
              hidden: (date) => {
                if (
                  fromDate &&
                  moment(date).isBefore(moment(fromDate), "day")
                ) {
                  return true;
                }
                if (toDate && moment(date).isAfter(moment(toDate), "day")) {
                  return true;
                }
                return false;
              },
            }}
            modifiersClassNames={{
              hidden: "day_hidden",
            }}
            initialFocus
            className="bg-transparent"
          />
        </menu>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
