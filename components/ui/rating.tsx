"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  className?: string;
}

export function Rating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  className,
}: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="평점"
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star}점`}
          disabled={readOnly}
          className={cn(
            "text-muted-foreground transition-colors disabled:cursor-default",
            !readOnly && "cursor-pointer hover:text-primary",
          )}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onClick={() => !readOnly && onChange?.(star)}
        >
          <Star
            className={cn(
              "size-5",
              star <= display && "fill-primary text-primary",
            )}
          />
        </button>
      ))}
    </div>
  );
}
