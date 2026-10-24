import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface LinkListItem {
  key: string;
  title: string;
  href?: string;
  description?: string;
}

interface LinkListProps {
  items: LinkListItem[];
  // grid: home page topic grid; list: document list
  layout?: 'grid' | 'list';
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

// Titled links with a short description under each, separated by rules.
export default function LinkList({
  items,
  layout = 'list',
  headingLevel = 3,
  className,
}: LinkListProps) {
  const isGrid = layout === 'grid';

  return (
    <ul
      className={cn(
        isGrid
          ? 'grid grid-cols-1 gap-[30px] tablet:grid-cols-2 md:grid-cols-3'
          : 'border-t border-rule',
        className
      )}
    >
      {items.map(item => (
        <li
          key={item.key}
          className={
            isGrid
              ? 'border-t border-rule pt-[15px]'
              : 'border-b border-rule py-5'
          }
        >
          {React.createElement(
            `h${headingLevel}`,
            { className: 'type-s mb-2.5' },
            item.href ? (
              <Link to={item.href} className="link">
                {item.title}
              </Link>
            ) : (
              item.title
            )
          )}
          {item.description && (
            <p className="type-small text-ink-secondary">{item.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
