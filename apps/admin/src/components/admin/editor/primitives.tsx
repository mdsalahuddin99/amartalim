import { cn } from "@/lib/utils";

export const TBtn = ({
  onClick,
  active,
  title,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={cn(
      "h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none",
      active ? "bg-primary/15 text-primary" : "hover:bg-muted text-foreground/80",
    )}
  >
    {children}
  </button>
);

export const Sep = () => <div className="w-px h-6 bg-border mx-0.5 shrink-0" />;
