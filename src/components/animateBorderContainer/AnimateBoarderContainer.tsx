import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import "./style.css";

interface AnimateBorderContainerProps {
  children: ReactNode;
  className?: string;
}

export default function AnimateBorderContainer({
  children,
  className,
}: AnimateBorderContainerProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "animate-rotate-border from-blue flex h-full w-full max-w-sm cursor-pointer items-center justify-center rounded-sm bg-conic/[from_var(--border-angle)] via-blue-600 via-90% p-px hover:scale-[1.03]",
        className,
      )}
    >
      <div className="h-[calc(100%-4px)] w-[calc(100%-4px)] rounded-sm border border-blue-400 bg-neutral-50">
        {children}
      </div>
    </div>
  );
}
