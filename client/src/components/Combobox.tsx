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
import { cn } from "@/lib/utils";
import { faCaretDown, faCheck, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, useState } from "react";
import { SkeletonLoader } from "./Loader";
import CustomTooltip from "./CustomTooltip";
import {
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
} from "react-hook-form";
import { InputErrorMessage } from "./ErrorLabels";

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

interface ComboboxProps {
  options?: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  labelClassName?: string;
  className?: string;
  inputClassName?: string;
  optionsClassName?: string;
  selectedValueClassName?: string;
  value?: string;
  defaultValue?: string;
  isLoading?: boolean;
  readOnly?: boolean;
  errorMessage?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
}

const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      options = [],
      placeholder,
      onChange,
      label,
      required,
      labelClassName,
      className,
      inputClassName,
      optionsClassName,
      selectedValueClassName,
      value,
      defaultValue,
      isLoading,
      readOnly,
      errorMessage,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const selectedValue = value ?? defaultValue ?? "";
    const selectedLabel = selectedValue
      ? options.find((option) => option.value === selectedValue)?.label
      : "";

    return (
      <label className={`flex flex-col gap-2 w-full ${labelClassName}`}>
        <p
          className={
            label
              ? "pl-1 flex items-center gap-1.5 text-[11px] lg:text-[12px] font-light leading-tight text-primary"
              : "hidden"
          }
        >
          {label}{" "}
          {required && (
            <CustomTooltip
              label={required ? `${label} is required` : ""}
              labelClassName="text-[11px] bg-red-600"
            >
              <span className="text-red-600 cursor-pointer">*</span>
            </CustomTooltip>
          )}
        </p>
        <Popover
          open={open}
          onOpenChange={readOnly ? undefined : setOpen}
          modal
        >
          <PopoverTrigger
            disabled={isLoading || readOnly}
            className={cn(
              "flex h-9 min-h-9 w-full items-center justify-between rounded-md border border-primary/20 bg-white px-3 text-left outline-none transition-[color,border-color,box-shadow] duration-200 hover:bg-background/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
              inputClassName || "text-[11px] lg:text-[12px] font-light leading-tight",
              readOnly && "cursor-default bg-background",
              className,
            )}
          >
            {isLoading ? (
              <SkeletonLoader type="input" height="2.25rem" className="w-full" />
            ) : (
              <>
                <span
                  className={cn(
                    "block w-full max-w-[calc(100%-24px)] flex-1 truncate text-left",
                    selectedValue
                      ? selectedValueClassName ||
                          inputClassName ||
                          "text-[11px] lg:text-[12px] font-light text-primary"
                      : cn(
                          "text-primary/70",
                          inputClassName || "text-[11px] lg:text-[12px] font-light",
                        ),
                  )}
                >
                  {selectedLabel || placeholder || "Select option..."}
                </span>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className="ml-2 h-3.5 w-3.5 shrink-0 flex-none text-[11px] text-primary/50"
                />
              </>
            )}
          </PopoverTrigger>
          <PopoverContent
            className="w-(--anchor-width) min-w-(--anchor-width) max-w-(--anchor-width) border border-primary/10 p-0"
            align="start"
          >
            <Command ref={ref} className="w-full bg-white p-0">
              <CommandInput
                placeholder="Search option..."
                className={`h-9 w-full ${inputClassName || "text-[11px] lg:text-[12px] font-light"}`}
              />
              <CommandList ref={ref} className="w-full p-1">
                <CommandEmpty
                  className={`w-full text-center text-primary ${
                    optionsClassName || "text-[11px] lg:text-[12px] py-2 font-light"
                  }`}
                >
                  No option found.
                </CommandEmpty>
                <CommandGroup className="w-full">
                  {(options ?? [])?.map((option) => (
                    <CommandItem
                      key={option.value}
                      disabled={option?.disabled}
                      className="flex h-8 items-center gap-2 w-full cursor-pointer overflow-hidden rounded-md px-2 text-[11px] lg:text-[12px] font-light hover:bg-background"
                      value={option.label}
                      onSelect={(currentValue) => {
                        const selectedOption = options.find(
                          (option) => option.label === currentValue,
                        );
                        onChange?.(selectedOption?.value || "");
                        setOpen(false);
                      }}
                    >
                      <p
                        className={`${
                          option?.disabled && `text-gray-400 cursor-not-allowed`
                        } truncate max-w-[calc(100%-24px)] ${
                          optionsClassName || "text-[11px] lg:text-[12px] font-light text-primary"
                        }`}
                      >
                        {option.label}
                      </p>
                      <FontAwesomeIcon
                        icon={selectedValue === option.value ? faCheck : faCircle}
                        className="ml-auto h-3.5 w-3.5 flex-none text-primary/60"
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errorMessage && (
          <InputErrorMessage message={errorMessage} className="mt-1.5" />
        )}
      </label>
    );
  },
);

Combobox.displayName = "Combobox";

export default Combobox;
