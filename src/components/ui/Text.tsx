import { cn } from '../../lib/utils';

// Body sizes: lg is the lead paragraph, md body copy, sm small print
const sizeStyles = {
  sm: 'type-small mb-[15px] tablet:mb-[20px]',
  md: 'type-body mb-[15px] tablet:mb-[20px]',
  lg: 'type-lead mb-[20px] tablet:mb-[30px]',
};

export function Text({
  size = 'md',
  className = '',
  id,
  children,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className={cn(sizeStyles[size], className)}>
      {children}
    </p>
  );
}
