import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { IndexGroup, Subcategory } from '../../data/yamlLoader';

const OTHER = 'other';

// Departments and offices under their group headings, with a count for each
// group and a box that filters the list by name as you type.
export default function Directory({
  groups,
  pages,
  basePath,
}: {
  groups: IndexGroup[];
  pages: Subcategory[];
  basePath: string;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  const known = new Set(groups.map(group => group.slug));
  const sections = [...groups, { slug: OTHER, name: t('directory.other') }].map(
    group => ({
      ...group,
      pages: pages.filter(
        page =>
          (page.group && known.has(page.group) ? page.group : OTHER) ===
            group.slug && page.name.toLowerCase().includes(term)
      ),
    })
  );
  const shown = sections.filter(section => section.pages.length > 0);
  const total = shown.reduce((sum, section) => sum + section.pages.length, 0);

  return (
    <>
      <div className="mb-[30px] max-w-[640px] tablet:mb-10">
        <label htmlFor="directory-filter" className="type-s mb-[5px] block">
          {t('directory.filterLabel')}
        </label>
        <input
          id="directory-filter"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="type-body h-10 w-full rounded-none border-2 border-ink px-[5px]"
        />
      </div>

      <p role="status" className="sr-only">
        {t('directory.resultCount', { count: total })}
      </p>

      {shown.length > 0 ? (
        <>
          <ul className="mb-10 grid grid-cols-2 gap-[15px] tablet:grid-cols-4 tablet:gap-5">
            {shown.map(section => (
              <li key={section.slug}>
                <a
                  href={`#${section.slug}`}
                  className="link-plain block h-full border-t-[5px] border-primary-600 bg-surface px-[15px] pt-2.5 pb-[15px] text-ink"
                >
                  <span className="type-xl block">{section.pages.length}</span>
                  <span className="type-body">{section.name}</span>
                </a>
              </li>
            ))}
          </ul>

          {shown.map(section => (
            <section
              key={section.slug}
              id={section.slug}
              aria-labelledby={`${section.slug}-title`}
              className="mb-10 border-t border-rule pt-[15px] tablet:mb-[50px]"
            >
              <h2
                id={`${section.slug}-title`}
                className="type-l mb-[20px] tablet:mb-[30px]"
              >
                {section.name}{' '}
                <span className="font-normal text-ink-secondary">
                  ({section.pages.length})
                </span>
              </h2>
              <ul className="grid grid-cols-1 gap-x-[30px] gap-y-5 tablet:grid-cols-2 md:grid-cols-3">
                {section.pages.map(page => (
                  <li
                    key={page.slug}
                    className="type-body border-l-[3px] border-primary-600 pl-2.5"
                  >
                    <Link
                      to={`${basePath}/${page.slug}`}
                      className="link-text font-bold"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      ) : (
        <p className="type-body">
          {t('directory.noResults', { query: query.trim() })}
        </p>
      )}
    </>
  );
}
