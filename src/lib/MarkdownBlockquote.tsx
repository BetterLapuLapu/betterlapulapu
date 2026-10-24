/**
 * Markdown blockquote: a quote that opens with a label becomes a
 * notification banner; any other quote stays a quote.
 */

import {
  type ReactNode,
  type HTMLAttributes,
  Children,
  cloneElement,
  isValidElement,
} from 'react';
import { useTranslation } from 'react-i18next';
import NotificationBanner from '../components/ui/NotificationBanner';
import { textOf } from './utils';

// A quote that opens with a label (`> Tip: …`, `> **Note:** …` or GitHub's
// `> [!NOTE]`) is a callout and shows as a notification banner.
const CALLOUT =
  /^\s*(?:\[!(note|tip|important|warning|caution)\]|(note|tip|important|warning|caution):)\s*/i;

export function Blockquote({
  children,
  className,
  ...props
}: { children?: ReactNode } & HTMLAttributes<HTMLQuoteElement>) {
  const { t } = useTranslation();
  const blocks = Children.toArray(children).filter(
    child => typeof child !== 'string' || child.trim()
  );
  const [first, ...rest] = blocks;

  // The label is the first text in the first paragraph, possibly bold
  if (isValidElement<{ children?: ReactNode }>(first)) {
    const [lead, ...inline] = Children.toArray(first.props.children);
    const leadText = isValidElement(lead) ? textOf(lead) : lead;
    const match = typeof leadText === 'string' && leadText.match(CALLOUT);
    if (match) {
      const kind = (match[1] ?? match[2]).toLowerCase();
      const remainder = isValidElement(lead)
        ? []
        : [(lead as string).slice(match[0].length)];
      const body = [...remainder, ...inline].filter(
        part => typeof part !== 'string' || part.trim()
      );
      return (
        <NotificationBanner title={t(`alert.${kind}`)}>
          {body.length > 0 && cloneElement(first, {}, ...body)}
          {rest}
        </NotificationBanner>
      );
    }
  }

  return (
    <blockquote className={className} {...props}>
      {children}
    </blockquote>
  );
}
