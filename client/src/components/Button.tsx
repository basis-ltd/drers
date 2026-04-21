import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSProperties, FC, MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";

interface ButtonProps {
  route?: string;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: "submit" | "button" | "reset";
  disabled?: boolean;
  primary?: boolean;
  styled?: boolean;
  className?: string;
  submit?: boolean;
  danger?: boolean;
  icon?: IconProp;
  isLoading?: boolean;
  children?: ReactNode;
  variant?: string;
  size?: string;
  role?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

const Button: FC<ButtonProps> = ({
  route = "#",
  value,
  onClick,
  type = null,
  disabled = false,
  primary = false,
  styled = true,
  className,
  submit = false,
  danger = false,
  icon = undefined,
  isLoading = false,
  children,
  role,
  style,
  ...rest
}) => {
  const baseStyles = `py-[6px] px-4 font-light leading-tight flex items-center gap-1.5 justify-center text-center border border-[1px] border-primary rounded-md text-primary bg-white hover:bg-primary hover:text-white cursor-pointer ease-in-out duration-200 hover:scale-[1.01]
    sm:gap-1 md:gap-1.5 lg:gap-1.5
    ${
      !styled &&
      "bg-transparent! shadow-none! text-primary! hover:scale-[1.01]! py-0! px-0! border-none! hover:bg-transparent! hover:text-primary! hover:underline underline-offset-2"
    }
    ${className}
    ${
      (primary || submit || type === "submit") &&
      "bg-primary! text-white! hover:bg-primary! hover:text-white! shadow-sm!"
    }
    ${
      danger &&
      "bg-red-700! border-none! text-white! hover:bg-red-700! hover:text-white! shadow-sm!"
    }
    ${
      disabled &&
      "bg-secondary! shadow-none! hover:scale-[1]! cursor-not-allowed! hover:bg-secondary! hover:text-opacity-80 duration-0! text-white text-opacity-80 border-none! text-center transition-all"
    }`;

  if (submit || type === "submit" || route === "#") {
    return (
      <button
        type={type || "button"}
        onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
        className={baseStyles}
        disabled={disabled}
        role={role}
        style={style}
        {...(rest as Record<string, unknown>)}
      >
        {isLoading ? (
          <Loader className={primary ? "text-white" : "text-primary"} />
        ) : (
          <>
            {icon && (
              <FontAwesomeIcon
                icon={icon}
                className="text-[9px] sm:text-[10px] md:text-[10px]"
              />
            )}
            {children || value}
          </>
        )}
      </button>
    );
  }

  return (
    <Link
      to={route}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          onClick(e);
        }
      }}
      className={`${baseStyles} text-[12px]!`}
      role={role}
      style={style}
      {...(rest as Record<string, unknown>)}
    >
      {isLoading ? (
        <Loader className={primary ? "text-white" : "text-primary"} />
      ) : (
        <>
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className="text-[9px] sm:text-[10px] md:text-[10px]"
            />
          )}
          {children || value}
        </>
      )}
    </Link>
  );
};

export default Button;
