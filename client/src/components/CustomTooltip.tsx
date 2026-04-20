import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

type CustomTooltipProps = {
  children: ReactNode;
  label?: string;
  labelClassName?: string;
};

const CustomTooltip = ({
  children,
  label,
  labelClassName,
}: CustomTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          className={`text-[11px] font-normal text-white ${labelClassName}`}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
