import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function AppCard({ children, className, onClick, hoverable = false }: AppCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card text-card-foreground border border-border rounded-xl p-4 sm:p-6 transition-all duration-200",
        hoverable && "hover:border-primary/50 hover:shadow-md cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
