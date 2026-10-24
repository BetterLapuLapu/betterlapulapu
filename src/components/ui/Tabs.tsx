import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';

// Tabs. Below the tablet breakpoint every panel shows, one after
// another, each under its own heading; from tablet up only the chosen one.
export default function Tabs({
  label,
  tabs,
}: {
  label: string;
  tabs: { title: string; content: ReactNode }[];
}) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs, as in the WAI-ARIA tabs pattern
  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (selected + step + tabs.length) % tabs.length;
    setSelected(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="mb-[20px] tablet:mb-[30px]">
      <div
        role="tablist"
        aria-label={label}
        className="relative hidden flex-wrap gap-[5px] tablet:flex"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => {
          const active = index === selected;
          return (
            <button
              key={tab.title}
              ref={el => {
                buttons.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={active}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(index)}
              className={cn(
                'type-body -mb-px cursor-pointer border px-5 py-2.5 text-left',
                active
                  ? 'relative z-10 border-rule border-b-white bg-white text-ink'
                  : 'border-surface bg-surface text-link underline underline-offset-[0.1578em] hover:decoration-[3px]'
              )}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.title}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          className={cn(
            'mb-[30px] tablet:mb-0 tablet:border tablet:border-rule tablet:px-5 tablet:pt-[30px] tablet:pb-2.5',
            index !== selected && 'tablet:hidden'
          )}
        >
          <h3 className="type-m mb-[15px] tablet:mb-[20px]">{tab.title}</h3>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
