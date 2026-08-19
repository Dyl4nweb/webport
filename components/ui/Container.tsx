import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  narrow?: boolean;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export default function Container<T extends ElementType = "div">({
  as,
  narrow = false,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={[
        "mx-auto w-full px-6 sm:px-8",
        narrow ? "max-w-4xl" : "max-w-7xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}