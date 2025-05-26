import React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva("flex flex-col items-center justify-center", {
  variants: {
    show: {
      true: "flex",
      false: "hidden",
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      small: "w-4 h-4 sm:w-5 sm:h-5",
      medium: "w-6 h-6 sm:w-8 sm:h-8",
      large: "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const textVariants = cva("mt-2 font-medium", {
  variants: {
    size: {
      small: "text-xs sm:text-sm",
      medium: "text-sm sm:text-base",
      large: "text-base sm:text-lg",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

export function Spinner({
  size = "medium",
  show = true,
  children,
  className,
  text,
}) {
  return (
    <div className={cn(spinnerVariants({ show }), className)}>
      <Loader2 className={loaderVariants({ size })} />
      {text && <span className={textVariants({ size })}>{text}</span>}
      {children}
    </div>
  );
}
