import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Step by step: numbered circles joined by a vertical line.
export default function StepList({
  steps,
  headingLevel = 3,
}: {
  steps: { number: string; title: string; content: ReactNode }[];
  headingLevel?: 3 | 4 | 5;
}) {
  const { t } = useTranslation();

  return (
    <ol className="mb-[20px] tablet:mb-[30px]">
      {steps.map((step, index) => (
        <li key={step.number} className="relative pb-[25px] pl-[50px]">
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-[35px] bottom-0 left-4 w-0.5 bg-rule"
            />
          )}
          <span className="type-s absolute top-[-3px] left-0 flex h-[35px] w-[35px] items-center justify-center rounded-full border-2 border-rule bg-white">
            <span className="sr-only">{t('guide.step')} </span>
            {step.number}
          </span>
          {React.createElement(
            `h${headingLevel}`,
            { className: 'type-s mb-2.5' },
            step.title || `${t('guide.step')} ${step.number}`
          )}
          <div className="[&>*:last-child]:mb-0">{step.content}</div>
        </li>
      ))}
    </ol>
  );
}
