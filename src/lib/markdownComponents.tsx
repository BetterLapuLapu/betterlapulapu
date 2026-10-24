/**
 * ReactMarkdown components with configurable typography themes
 */

import { type TypographyTheme } from './typographyThemes';
import {
  type ReactNode,
  type HTMLAttributes,
  Children,
  isValidElement,
} from 'react';
import { TableWithToggle } from './TableWithToggle';
import { slugify, textOf } from './utils';
import { Blockquote } from './MarkdownBlockquote';

/**
 * Creates ReactMarkdown components with custom styling based on typography theme
 */
export function createMarkdownComponents(theme: TypographyTheme) {
  return {
    h1: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={theme.components.h1} {...props}>
        {children}
      </h1>
    ),
    h2: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h2
        id={slugify(textOf(children))}
        className={theme.components.h2}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className={theme.components.h3} {...props}>
        {children}
      </h3>
    ),
    h4: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className={theme.components.h4} {...props}>
        {children}
      </h4>
    ),
    h5: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h5 className={theme.components.h5} {...props}>
        {children}
      </h5>
    ),
    h6: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h6 className={theme.components.h6} {...props}>
        {children}
      </h6>
    ),
    p: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLParagraphElement>) => (
      <p className={theme.components.p} {...props}>
        {children}
      </p>
    ),
    small: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLElement>) => (
      <small className={theme.components.small} {...props}>
        {children}
      </small>
    ),
    ul: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    } & HTMLAttributes<HTMLUListElement>) => (
      <ul
        className={
          className?.includes('contains-task-list')
            ? 'mb-[20px] space-y-2.5'
            : theme.components.ul
        }
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLOListElement>) => (
      <ol className={theme.components.ol} {...props}>
        {children}
      </ol>
    ),
    li: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    } & HTMLAttributes<HTMLLIElement>) => {
      // Checklist items (- [ ]) become checkboxes the reader can tick
      // off; nothing is saved
      if (className?.includes('task-list-item')) {
        const label = Children.toArray(children).filter(
          child =>
            !(
              isValidElement<{ type?: string }>(child) &&
              child.props.type === 'checkbox'
            )
        );
        return (
          <li className={theme.components['li.task-list-item']} {...props}>
            <label className="flex cursor-pointer items-start gap-[15px]">
              <input type="checkbox" className="checkbox" />
              <span className="pt-2">{label}</span>
            </label>
          </li>
        );
      }

      return (
        <li className={theme.components.li} {...props}>
          {children}
        </li>
      );
    },
    blockquote: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLQuoteElement>) => (
      <Blockquote className={theme.components.blockquote} {...props}>
        {children}
      </Blockquote>
    ),
    code: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    } & HTMLAttributes<HTMLElement>) => {
      // Check if it's inline code or code block
      const isInline = !className?.includes('language-');
      return isInline ? (
        <code className={theme.components.code} {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLPreElement>) => (
      <pre className={theme.components.pre} {...props}>
        {children}
      </pre>
    ),
    a: ({
      children,
      href,
      ...props
    }: {
      children?: ReactNode;
      href?: string;
    } & HTMLAttributes<HTMLAnchorElement>) => {
      // Check if it's an external link
      const isExternal =
        href && (href.startsWith('http://') || href.startsWith('https://'));

      return (
        <a
          href={href}
          className={theme.components.a}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
    strong: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLElement>) => (
      <strong className={theme.components.strong} {...props}>
        {children}
      </strong>
    ),
    em: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLElement>) => (
      <em className={theme.components.em} {...props}>
        {children}
      </em>
    ),
    hr: ({ ...props }: HTMLAttributes<HTMLHRElement>) => (
      <hr className={theme.components.hr} {...props} />
    ),
    table: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableElement>) => (
      <TableWithToggle theme={theme} {...props}>
        {children}
      </TableWithToggle>
    ),
    thead: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className={theme.components.thead} {...props}>
        {children}
      </thead>
    ),
    tbody: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody className={theme.components.tbody} {...props}>
        {children}
      </tbody>
    ),
    tr: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableRowElement>) => (
      <tr className={theme.components.tr} {...props}>
        {children}
      </tr>
    ),
    th: ({
      children,
      ...props
    }: {
      children?: ReactNode;
    } & HTMLAttributes<HTMLTableHeaderCellElement>) => (
      <th className={theme.components.th} {...props}>
        {children}
      </th>
    ),
    td: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableDataCellElement>) => (
      <td className={theme.components.td} {...props}>
        {children}
      </td>
    ),
  };
}
