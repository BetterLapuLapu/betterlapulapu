import { useId, useState, type ReactNode } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface"
    >
      <ChevronUp
        className={cn('h-3.5 w-3.5 text-ink transition-transform', {
          'rotate-180': !open,
        })}
        strokeWidth={3}
      />
    </span>
  );
}

// Accordion with a "Show all sections" toggle.
export default function Accordion({
  items,
  headingLevel = 3,
}: {
  items: { heading: string; content: ReactNode }[];
  headingLevel?: 3 | 4;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState<boolean[]>(() => items.map(() => false));
  const allOpen = open.every(Boolean);
  const Heading = `h${headingLevel}` as 'h3' | 'h4';

  return (
    <div className="mb-[20px] tablet:mb-[30px]">
      <button
        type="button"
        aria-expanded={allOpen}
        onClick={() => setOpen(items.map(() => !allOpen))}
        className="type-body mb-2.5 inline-flex cursor-pointer items-center gap-2.5 py-[5px] text-link hover:underline hover:decoration-[3px] hover:underline-offset-[0.1578em]"
      >
        <Chevron open={allOpen} />
        {allOpen ? t('guide.hideAll') : t('guide.showAll')}
      </button>
      <div className="border-b border-rule">
        {items.map((item, index) => (
          <div key={item.heading} className="border-t border-rule">
            <Heading className="type-s">
              <button
                type="button"
                aria-expanded={open[index]}
                aria-controls={`${id}-${index}`}
                onClick={() =>
                  setOpen(
                    open.map((value, i) => (i === index ? !value : value))
                  )
                }
                className="group block w-full cursor-pointer py-[15px] text-left"
              >
                <span className="block font-bold group-hover:underline group-hover:decoration-[3px] group-hover:underline-offset-[0.1578em]">
                  {item.heading}
                </span>
                <span className="type-small mt-2 inline-flex items-center gap-2.5 font-normal text-link">
                  <Chevron open={open[index]} />
                  {open[index] ? t('guide.hide') : t('guide.show')}
                </span>
              </button>
            </Heading>
            <div
              id={`${id}-${index}`}
              hidden={!open[index]}
              className="pb-[30px] [&>*:last-child]:mb-0"
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
