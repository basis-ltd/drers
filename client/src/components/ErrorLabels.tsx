import {
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
} from "react-hook-form";
import { cn } from "@/lib/utils";

export const InputErrorMessage = ({
  message,
  className,
}: {
  message:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldValues>>
    | undefined;
  className?: string;
}) => {
  if (!message) return null;
  return (
    <p className={cn("text-red-700 text-[12px] font-normal", className)}>
      {String(message)}
    </p>
  );
};
