import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      small: 'size-4',
      medium: 'size-6',
      large: 'size-8',
    },
  },
  defaultVariants: {
    size: 'small',
  },
});

interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
}

const Loader = ({
  size,
  show,
  children,
  className = 'text-white',
}: SpinnerContentProps) => {
  return (
    <span className={spinnerVariants({ show })}>
      <Loader2 className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );
};

interface SkeletonLoaderProps {
  type?: 'text' | 'avatar' | 'button' | 'card' | 'table' | 'input';
  width?: string;
  height?: string;
  className?: string;
}

/** Deterministic 50–70% width from React `useId()` so text skeletons vary without impure `Math.random` in render. */
function skeletonTextLineWidthFromStableId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = Math.imul(31, h) + id.charCodeAt(i);
  }
  const pct = 50 + (Math.abs(h) % 21);
  return `${pct}%`;
}

export const SkeletonLoader = ({
  type = 'text',
  width,
  height,
  className,
}: SkeletonLoaderProps) => {
  const stableId = useId();

  const base: React.CSSProperties = {
    animationDuration: '1.2s',
    minWidth: '10vw',
  };

  let style: React.CSSProperties;

  switch (type) {
    case 'text':
      style = {
        ...base,
        width: width ?? skeletonTextLineWidthFromStableId(stableId),
        height: height ?? '1.3rem',
      };
      break;
    case 'input':
      style = {
        ...base,
        width: width ?? '100%',
        height: height ?? '2.5rem',
      };
      break;
    case 'button':
      style = {
        ...base,
        width: width ?? '100%',
        height: height ?? '2.5rem',
      };
      break;
    case 'card':
      style = {
        ...base,
        width: width ?? '100%',
        height: height ?? '13rem',
      };
      break;
    case 'table':
      style = {
        ...base,
        width: width ?? '100%',
        height: height ?? '20rem',
      };
      break;
    case 'avatar':
      style = {
        ...base,
        width: width ?? '100%',
        height: height ?? '1.8rem',
      };
      break;
  }

  return (
    <figure
      className={`animate-pulse bg-gray-200 rounded-[4px] ${className}`}
      style={style}
    />
  );
};

export const FormSkeletonLoader = () => {
  return (
    <fieldset className="w-full grid grid-cols-2 gap-6 p-6">
      {Array.from({ length: 10 }).map((_, index) => (
        <label className="w-full flex flex-col gap-2" key={index}>
          <SkeletonLoader type="text" />
          <SkeletonLoader type="input" height="2.5rem" />
        </label>
      ))}
    </fieldset>
  );
};

export default Loader;