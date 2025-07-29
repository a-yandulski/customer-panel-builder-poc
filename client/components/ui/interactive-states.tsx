import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Enhanced Button Variants with Loading States
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 position-relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 hover:shadow-md hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 hover:shadow-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80 hover:shadow-sm hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 hover:shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {loading ? (loadingText || "Loading...") : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

// Enhanced Link with Hover Effects
const linkVariants = cva(
  "relative inline-flex items-center gap-1 text-primary font-medium transition-all duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
  {
    variants: {
      underline: {
        none: "",
        always: "underline underline-offset-4",
        hover: "hover:underline underline-offset-4",
        animated: "relative after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full",
      },
    },
    defaultVariants: {
      underline: "animated",
    },
  }
);

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  external?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, underline, external, children, ...props }, ref) => {
    return (
      <a
        className={cn(linkVariants({ underline, className }))}
        ref={ref}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        {...props}
      >
        {children}
        {external && (
          <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </a>
    );
  }
);
Link.displayName = "Link";

// Enhanced Toggle Switch with Smooth Transitions
export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  label?: string;
  description?: string;
  className?: string;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onCheckedChange, disabled, size = "default", label, description, className }, ref) => {
    const sizes = {
      sm: { switch: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3" },
      default: { switch: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
      lg: { switch: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
    };

    const sizeClasses = sizes[size];

    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            "relative inline-flex items-center rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
            checked ? "bg-primary" : "bg-gray-200",
            sizeClasses.switch
          )}
        >
          <span
            className={cn(
              "inline-block transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
              checked ? sizeClasses.translate : "translate-x-0",
              sizeClasses.thumb
            )}
          />
        </button>
        {(label || description) && (
          <div className="flex-1">
            {label && <label className="text-sm font-medium text-gray-900">{label}</label>}
            {description && <p className="text-xs text-gray-500">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);
Toggle.displayName = "Toggle";

// Enhanced Card with Hover Effects
export interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  clickable?: boolean;
  selected?: boolean;
}

const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, hover = false, clickable = false, selected = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-md transition-all duration-200",
          hover && "hover:shadow-lg hover:-translate-y-1",
          clickable && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
          selected && "ring-2 ring-primary ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InteractiveCard.displayName = "InteractiveCard";

// Focus Trap for Accessibility
export function FocusTrap({ children }: { children: React.ReactNode }) {
  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          // Handle tab navigation within the trap
          const focusableElements = e.currentTarget.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        }
      }}
    >
      {children}
    </div>
  );
}

// Skip Link for Accessibility
export function SkipLink({ href = "#main-content", children = "Skip to main content" }: { href?: string; children?: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

export { Button, Link, Toggle, InteractiveCard, buttonVariants };
