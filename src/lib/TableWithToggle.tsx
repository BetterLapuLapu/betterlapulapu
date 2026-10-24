/**
 * Table component with view toggle functionality
 */

import {
  type ReactNode,
  type HTMLAttributes,
  type ReactElement,
  Children,
  isValidElement,
  useState,
  useMemo,
} from 'react';
import { Table, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type TypographyTheme } from './typographyThemes';
import { cn, textOf } from './utils';

type ElementProps = {
  children?: ReactNode;
  node?: { tagName?: string };
};

// react-markdown passes the source hast node to custom components, which
// identifies the element regardless of how it is styled or keyed
const tagNameOf = (element: ReactElement<ElementProps>): string | undefined =>
  element.props.node?.tagName ??
  (typeof element.type === 'string' ? element.type : undefined);

// Collect each row's cells (keeping their rich content) and note which rows
// come from the table head
const extractRows = (
  children: ReactNode
): Array<{ cells: ReactNode[]; isHeader: boolean }> => {
  const rows: Array<{ cells: ReactNode[]; isHeader: boolean }> = [];

  const walk = (node: ReactNode, inHead: boolean): void => {
    Children.forEach(node, child => {
      if (!isValidElement<ElementProps>(child)) return;
      const tag = tagNameOf(child);

      if (tag === 'tr') {
        const cells: ReactNode[] = [];
        Children.forEach(child.props.children, cell => {
          if (!isValidElement<ElementProps>(cell)) return;
          const cellTag = tagNameOf(cell);
          if (cellTag === 'td' || cellTag === 'th') {
            cells.push(cell.props.children);
          }
        });
        rows.push({ cells, isHeader: inHead });
      } else {
        walk(child.props.children, inHead || tag === 'thead');
      }
    });
  };

  walk(children, false);
  return rows;
};

// Custom Table Component with view toggle
export const TableWithToggle = ({
  children,
  theme,
  ...props
}: {
  children: ReactNode;
  theme: TypographyTheme;
} & HTMLAttributes<HTMLTableElement>) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'table' | 'list'>('list');

  // Extract table data for list view
  const tableData = useMemo(() => {
    const rows = extractRows(children);
    const headers = rows.find(row => row.isHeader)?.cells ?? [];
    const bodyRows = rows
      .filter(row => !row.isHeader)
      .map(row => row.cells)
      .filter(cells => cells.some(cell => textOf(cell).trim()));
    const isNamed = headers.map(header => Boolean(textOf(header).trim()));
    const hasHeaders = isNamed.some(Boolean);

    return { headers, rows: bodyRows, hasHeaders, isNamed };
  }, [children]);

  const showTable = viewMode === 'table' || tableData.rows.length === 0;

  // Secondary buttons; the pressed one is filled black
  const toggleClass = (mode: 'table' | 'list') =>
    cn(
      'button button-secondary type-small mb-0 py-[5px] tablet:text-base',
      viewMode === mode && 'bg-ink text-white shadow-none hover:bg-ink'
    );

  return (
    <div className="mb-[20px] tablet:mb-[30px]">
      {/* View Toggle Buttons */}
      <div className="mb-[15px] flex justify-end gap-2.5">
        <button
          type="button"
          aria-pressed={viewMode === 'table'}
          onClick={() => setViewMode('table')}
          className={toggleClass('table')}
        >
          <Table size={16} aria-hidden="true" />
          {t('common.table')}
        </button>
        <button
          type="button"
          aria-pressed={viewMode === 'list'}
          onClick={() => setViewMode('list')}
          className={toggleClass('list')}
        >
          <List size={16} aria-hidden="true" />
          {t('common.list')}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table
            className={`${theme.components.table} sticky-table`}
            style={
              {
                '--first-col-width': '12rem',
              } as React.CSSProperties
            }
            {...props}
          >
            {children}
          </table>
        </div>
      ) : tableData.hasHeaders ? (
        // Summary cards: one card per row, headers as keys
        <div className="space-y-[20px]">
          {tableData.rows.map((cells, index) => (
            <div key={index} className="border border-rule">
              {/* Cells under blank headers (e.g. a row number or item
                  name) have no label, so they become the card's title */}
              {cells.some(
                (cell, cellIndex) =>
                  !tableData.isNamed[cellIndex] && textOf(cell).trim()
              ) && (
                <div className="type-s border-b border-rule bg-surface px-[15px] py-2.5 tablet:px-5 tablet:py-[15px]">
                  {cells.map(
                    (cell, cellIndex) =>
                      !tableData.isNamed[cellIndex] && (
                        <span key={cellIndex} className="mr-1">
                          {cell}
                        </span>
                      )
                  )}
                </div>
              )}
              <dl className="type-body px-[15px] tablet:px-5">
                {tableData.headers.map((header, headerIndex) =>
                  !tableData.isNamed[headerIndex] ? null : (
                    <div
                      key={headerIndex}
                      className="flex flex-col border-b border-rule py-2.5 last:border-b-0 tablet:flex-row"
                    >
                      <dt className="mb-[5px] font-bold tablet:mb-0 tablet:w-1/3 tablet:pr-5">
                        {header}
                      </dt>
                      <dd className="tablet:w-2/3">{cells[headerIndex]}</dd>
                    </div>
                  )
                )}
              </dl>
            </div>
          ))}
        </div>
      ) : (
        // Header-less tables are label/value lists: the first cell of each
        // row is the label and the remaining cells are its value. Shown as
        // a summary list.
        <dl className="type-body border-t border-rule">
          {tableData.rows.map(([label, ...values], index) => (
            <div
              key={index}
              className="flex flex-col border-b border-rule py-2.5 tablet:flex-row"
            >
              <dt className="mb-[5px] font-bold tablet:mb-0 tablet:w-1/3 tablet:pr-5">
                {label}
              </dt>
              <dd className="tablet:w-2/3">
                {values.map((value, valueIndex) => (
                  <div key={valueIndex}>{value}</div>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
