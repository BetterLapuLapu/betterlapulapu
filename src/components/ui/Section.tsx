import { cn } from '../../lib/utils';

// A full-width band holding the width container. The default padding
// suits a page that opens with breadcrumbs; home page bands pass their own.
export default function Section({
  children,
  className,
  id,
  labelledBy,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      className={cn('pt-[15px] pb-[30px] tablet:pb-[60px]', className)}
      id={id}
      aria-labelledby={labelledBy}
    >
      <div className="width-container">{children}</div>
    </section>
  );
}
