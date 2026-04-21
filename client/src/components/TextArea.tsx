import { FC, ChangeEvent, useEffect, useRef } from 'react';
import { FieldError, FieldErrorsImpl, FieldValues, Merge } from 'react-hook-form';
import { InputErrorMessage } from './ErrorLabels';

interface TextAreaProps {
  cols?: number;
  rows?: number;
  className?: string;
  defaultValue?: string | number | readonly string[] | undefined;
  resize?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string | undefined;
  required?: boolean;
  readonly?: boolean;
  onBlur?: () => void | undefined;
  label?: string | React.ReactNode;
  value?: string | number | readonly string[] | undefined;
  errorMessage?:
  | string
  | FieldError
  | Merge<FieldError, FieldErrorsImpl<FieldValues>>
  | undefined;
}

const TextArea: FC<TextAreaProps> = ({
  cols = 50,
  rows = 5,
  className = '',
  defaultValue = undefined,
  resize = true,
  onChange,
  placeholder = undefined,
  required = false,
  readonly = false,
  onBlur,
  label = null,
  value,
  errorMessage,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!defaultValue && !value && ref?.current) {
      ref.current.value = '';
    }
  }, [defaultValue, value]);

  return (
    <label className="flex flex-col gap-[6px] item-start w-full">
      <p
        className={`text-[14px] flex items-center gap-1 ${!label && 'hidden'}`}
      >
        {label}{' '}
        <span className={`${required ? 'text-red-500' : 'hidden'}`}>*</span>
      </p>
      <textarea
        cols={cols}
        rows={rows}
        ref={ref}
        value={value}
        readOnly={readonly}
        placeholder={placeholder}
        className={`border-[1.5px] border-opacity-50 text-[14px] placeholder:text-[13px] border-secondary flex items-center justify-center px-4 py-[8px] w-full focus:border-[1.3px] focus:outline-hidden focus:border-primary rounded-md ${
          resize ? null : 'resize-none'
        } ${className}`}
        onChange={onChange}
        onBlur={onBlur}
        defaultValue={defaultValue}
      ></textarea>
      <InputErrorMessage message={errorMessage} />
    </label>
  );
};

export default TextArea;