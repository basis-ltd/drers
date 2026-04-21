import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UUID } from '@/types/common/base.types';
import { FieldValues } from 'react-hook-form';
import { FieldError, Merge } from 'react-hook-form';
import { FieldErrorsImpl } from 'react-hook-form';
import { InputErrorMessage } from './ErrorLabels';

type SelectProps = {
  label?: string | number | undefined;
  options?: Array<{ label: string | undefined; value: string | UUID }>;
  defaultValue?: string | undefined;
  placeholder?: string;
  className?: string;
  onChange?: ((value: string) => void) | undefined;
  value?: string | undefined;
  required?: boolean;
  labelClassName?: string | undefined;
  name?: string | undefined;
  readOnly?: boolean;
  errorMessage?:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
};

const Select = ({
  options = [],
  defaultValue = undefined,
  placeholder = 'Select here...',
  className = undefined,
  value = '',
  onChange,
  label = undefined,
  required = false,
  labelClassName = undefined,
  name = undefined,
  readOnly = false,
  errorMessage = undefined,
}: SelectProps) => {
  return (
    <label className={`flex flex-col gap-2 w-full ${labelClassName}`}>
      <p
        className={
          label
            ? 'pl-1 flex items-center gap-1.5 text-[11px] lg:text-[12px] font-light leading-tight text-secondary'
            : 'hidden'
        }
      >
        {label} <span className={required ? `text-red-600` : 'hidden'}>*</span>
      </p>
      <SelectComponent
        onValueChange={onChange}
        defaultValue={defaultValue}
        value={value}
        name={name}
      >
        <SelectTrigger
          className={`w-full cursor-pointer !h-10 min-h-10 text-[11px] lg:text-[12px] font-light border border-primary/20 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 bg-white shadow-sm rounded-md ${className}`}
        >
          <SelectValue
            className="text-[11px] lg:text-[12px] font-light"
            placeholder={
              <p className="text-[11px] lg:text-[12px] font-light text-secondary/70">
                {placeholder}
              </p>
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option, index: number) => {
              return (
                <SelectItem
                  key={index}
                  value={option.value}
                  disabled={readOnly}
                  className="cursor-pointer text-[11px] lg:text-[12px] font-light py-1 hover:bg-background"
                >
                  <p className="text-[11px] lg:text-[12px] font-light py-[3px]">
                    {option.label}
                  </p>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </SelectComponent>
      <InputErrorMessage message={errorMessage} />
    </label>
  );
};

export default Select;
