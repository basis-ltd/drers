import {
  ellipsisHClassName,
  tableActionClassName,
} from "@/constants/input.constants";
import { cn } from "@/lib/utils";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export interface TableActionButtonProps {
  to?: string;
  label: string;
  onClick?: () => void;
  icon?: IconProp;
}

export const TableActionButton = ({
  to,
  label,
  onClick,
  icon
}: TableActionButtonProps) => {
  return (
    <Link to={to ?? "#"} className={tableActionClassName} onClick={onClick}>
      {icon && <FontAwesomeIcon icon={icon} className="text-primary" />}
      {label}
    </Link>
  );
};

export const TableActionButtonTrigger = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <FontAwesomeIcon
      icon={faEllipsisH}
      className={cn(ellipsisHClassName, className)}
    />
  );
};
