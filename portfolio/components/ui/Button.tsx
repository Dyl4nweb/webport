import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit";
  external?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:bg-black hover:-translate-y-0.5 hover:shadow-[0_14px_35px_-18px_rgba(0,0,0,0.45)] dark:bg-ink-dark dark:text-surface-dark dark:hover:bg-white dark:hover:shadow-[0_14px_35px_-18px_rgba(255,255,255,0.25)]",
  secondary:
    "bg-transparent text-ink border border-line hover:border-ink hover:bg-ink/[0.03] hover:-translate-y-0.5 hover:shadow-md dark:text-ink-dark dark:border-line-dark dark:hover:border-ink-dark dark:hover:bg-white/[0.04]",
  ghost:
    "bg-transparent text-ink hover:opacity-70 dark:text-ink-dark",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-[11.5px] sm:px-4 sm:py-2 sm:text-[12.5px]",
  md: "px-5 py-2 text-[12.5px] sm:px-6 sm:py-2.5 sm:text-[13.5px] md:px-7 md:py-2.5 md:text-[14px]",
  lg: "px-6 py-2.5 text-[13px] sm:px-7 sm:py-3 sm:text-[14.5px]",
};

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  external = false,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 ease-out",
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
