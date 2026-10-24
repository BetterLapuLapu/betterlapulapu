import React from 'react';
import { cn } from '../../lib/utils';

type HeadingSize = 'xl' | 'l' | 'm' | 's';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  // Visual size; defaults to the size for the heading level
  size?: HeadingSize;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<HeadingSize, string> = {
  xl: 'type-xl mb-[30px] tablet:mb-[50px]',
  l: 'type-l mb-[15px] tablet:mb-[20px]',
  m: 'type-m mb-[15px] tablet:mb-[20px]',
  s: 'type-s mb-[15px] tablet:mb-[20px]',
};

const defaultSizes: Record<number, HeadingSize> = {
  1: 'xl',
  2: 'l',
  3: 'm',
  4: 's',
  5: 's',
  6: 's',
};

export function Heading({
  level = 1,
  size,
  id,
  children,
  className,
}: HeadingProps) {
  const combinedClasses = cn(
    sizeStyles[size ?? defaultSizes[level]],
    className
  );

  const HeadingTag = `h${level}`;

  return React.createElement(
    HeadingTag,
    { className: combinedClasses, id },
    children
  );
}
