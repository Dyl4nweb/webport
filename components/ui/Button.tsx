import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  external?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover dark:bg-accent-dark dark:text-ink dark:hover:bg-accent-dark-hover",
  secondary:
    "bg-transparent text-accent border border-accent/30 hover:border-accent dark:text-accent-dark dark:border-accent-dark/40 dark:hover:border-accent-dark",
  ghost:
    "bg-transparent text-ink dark:text-ink-dark hover:opacity-70",
};

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
  external = false,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-medium tracking-tight transition-all duration-300 ease-apple",
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
