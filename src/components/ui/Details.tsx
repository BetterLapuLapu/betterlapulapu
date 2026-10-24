import type { ReactNode } from 'react';

// Details: a link-style summary that reveals the content beneath it.
export default function Details({
  summary,
  children,
}: {
  summary: string;
  children: ReactNode;
}) {
  return (
    <details className="group mb-[20px] tablet:mb-[30px]">
      <summary className="type-body inline-flex cursor-pointer list-none items-baseline gap-2 text-link [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="inline-block h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-current transition-transform group-open:rotate-90"
        />
        <span className="underline underline-offset-[0.1578em] hover:decoration-[3px]">
          {summary}
        </span>
      </summary>
      <div className="mt-2.5 border-l-[5px] border-rule pt-[15px] pl-[15px] tablet:pl-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </details>
  );
}
