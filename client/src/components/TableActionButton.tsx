import {
  ellipsisHClassName,
  tableActionClassName,
} from "@/constants/input.constants";
import { cn } from "@/lib/utils";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export const TableActionButton = ({
  to,
  label,
  onClick,
}: {
  to?: string;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <Link to={to ?? "#"} className={tableActionClassName} onClick={onClick}>
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
