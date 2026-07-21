import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full min-h-[200px] p-8 text-muted-foreground", className)}>
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
