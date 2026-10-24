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
  // grid: topic grid with a short description under each title;
  // list: titles only, for lists of articles
  layout?: 'grid' | 'list';
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

const titleOf = (item: LinkListItem) =>
  item.href ? (
    <Link to={item.href} className="link">
      {item.title}
    </Link>
  ) : (
    item.title
  );

export default function LinkList({
  items,
  layout = 'list',
  headingLevel = 3,
  className,
}: LinkListProps) {
  if (layout === 'list') {
    return (
      <ul
        className={cn('type-body space-y-5 tablet:space-y-[25px]', className)}
      >
        {items.map(item => (
          <li key={item.key}>{titleOf(item)}</li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-[30px] tablet:grid-cols-2 md:grid-cols-3',
        className
      )}
    >
      {items.map(item => (
        <li key={item.key} className="border-t border-rule pt-[15px]">
          {React.createElement(
            `h${headingLevel}`,
            { className: 'type-s mb-2.5' },
            titleOf(item)
          )}
          {item.description && (
            <p className="type-small text-ink-secondary">{item.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
