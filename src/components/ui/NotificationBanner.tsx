import { useId, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

// Notification banner: a titled box with a coloured border and title bar,
// for notes, tips and errors.
export default function NotificationBanner({
  title,
  tone = 'info',
  children,
  className,
}: {
  title: string;
  tone?: 'info' | 'error';
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'region'}
      aria-labelledby={id}
      className={cn(
        'mb-[20px] max-w-[640px] border-[5px] tablet:mb-[30px]',
        isError ? 'border-alert bg-alert' : 'border-primary-600 bg-primary-600',
        className
      )}
    >
      <h2
        id={id}
        className="type-s px-2.5 pt-0.5 pb-[5px] text-white tablet:px-[15px]"
      >
        {title}
      </h2>
      <div className="type-body bg-white p-[15px] tablet:p-5 [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
