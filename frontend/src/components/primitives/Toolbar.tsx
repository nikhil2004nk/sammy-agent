import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 bg-surface border border-border p-2 rounded-lg mb-6", className)}>
      {children}
    </div>
  );
}
