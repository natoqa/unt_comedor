'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  label?: string;
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  label,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const starSize = sizeClasses[size];

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">
          {label}
        </p>
      )}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onMouseEnter={() => !readonly && setHovered(star)}
              onMouseLeave={() => !readonly && setHovered(0)}
              onClick={() => onChange?.(star)}
              className={`${starSize} transition-all duration-150 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              aria-label={`${star} estrellas`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={isFilled ? '#f59e0b' : 'none'}
                stroke={isFilled ? '#f59e0b' : 'hsl(var(--muted-foreground))'}
                strokeWidth="1.5"
                className="w-full h-full"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
        {!readonly && value > 0 && (
          <span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}

