import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text";
  visualState?: "default" | "hover" | "outline" | "disabled";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      visualState,
      size = "md",
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0F]/20 disabled:pointer-events-none";

    // Size styles
    const sizeStyles = {
      sm: "h-8 px-3 text-[13px] rounded-[6px] gap-1.5",
      md: "h-10 px-5 text-[14px] rounded-[8px] gap-2",
      lg: "h-12 px-6 text-[16px] rounded-[8px] gap-2.5",
    }[size];

    const isDisabled = disabled || visualState === "disabled";

    let variantStyles = "";

    if (variant === "primary") {
      if (visualState === "hover") {
        variantStyles = "bg-[#27272A] text-white shadow-sm";
      } else if (visualState === "outline") {
        variantStyles =
          "bg-white text-[#0D0D0F] border border-[#E5E7EB] hover:bg-[#F6F6F6]";
      } else if (visualState === "disabled" || isDisabled) {
        variantStyles = "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed border-transparent";
      } else {
        // default interactive
        variantStyles =
          "bg-[#0D0D0F] text-white hover:bg-[#27272A] active:bg-black shadow-sm";
      }
    } else if (variant === "secondary") {
      if (visualState === "hover") {
        variantStyles = "bg-[#E5E7EB] text-[#0D0D0F]";
      } else if (visualState === "outline") {
        variantStyles =
          "bg-white text-[#0D0D0F] border border-[#E5E7EB] hover:bg-[#F6F6F6]";
      } else if (visualState === "disabled" || isDisabled) {
        variantStyles = "bg-[#F0F0F0] text-[#9CA3AF] cursor-not-allowed";
      } else {
        // default interactive
        variantStyles =
          "bg-[#F6F6F6] text-[#0D0D0F] hover:bg-[#E5E7EB] border border-transparent";
      }
    } else if (variant === "text") {
      if (visualState === "hover") {
        variantStyles = "bg-transparent text-[#1D4ED8]";
      } else if (visualState === "outline") {
        variantStyles =
          "bg-transparent text-[#0D0D0F] border border-dashed border-[#E5E7EB]";
      } else if (visualState === "disabled" || isDisabled) {
        variantStyles = "bg-transparent text-[#9CA3AF] cursor-not-allowed";
      } else {
        // default interactive
        variantStyles =
          "bg-transparent text-[#0D0D0F] hover:text-[#1D4ED8] p-0 h-auto font-normal";
      }
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
