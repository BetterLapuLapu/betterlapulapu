/**
 * Splits a content page's markdown into its level-2 sections and recognises
 * the shapes the content template uses, so the page can show them as
 * components (summary list, tabs, step-by-step, accordion). Anything that
 * doesn't match its expected shape is left as markdown.
 */

import { slugify } from './utils';

export interface GuideSection {
  heading?: string;
  id?: string;
  body: string;
}

export interface KeyValue {
  key: string;
  value: string;
}

export interface Step {
  number: string;
  title: string;
  body: string;
}

export interface StepGroup {
  intro: string;
  steps: Step[];
  outro: string;
}

export interface ApplyOption {
  title: string;
  body: string;
}

export interface Faq {
  question: string;
  answer: string;
}

// Section headings used by the content template
export const SECTION = {
  summary: 'what you need to know',
  apply: 'how to apply',
  charter: "official citizen's charter",
  contact: 'contact information',
  faq: 'frequently asked questions',
  related: 'related services',
};

export const isSection = (section: GuideSection, name: string) =>
  section.heading?.toLowerCase().replace(/’/g, "'") === name;

// Heading text without markdown links, emphasis or code marks
export const plainText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();

const RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;

// Drops blank lines and horizontal rules at either end; rules only
// separate sections, which the layout already does.
function trimRules(markdown: string) {
  const lines = markdown.split('\n');
  while (lines.length && (!lines[0].trim() || RULE.test(lines[0]))) {
    lines.shift();
  }
  while (lines.length && (!lines.at(-1)!.trim() || RULE.test(lines.at(-1)!))) {
    lines.pop();
  }
  return lines.join('\n');
}

const headingOf = (line: string) => line.match(/^(#{1,6})\s+(.+?)\s*#*$/);

/** Splits markdown at its `## ` headings, ignoring fenced code. */
export function splitSections(markdown: string): GuideSection[] {
  const sections: GuideSection[] = [];
  let current: { heading?: string; lines: string[] } = { lines: [] };
  let inFence = false;

  const flush = () => {
    const body = trimRules(current.lines.join('\n'));
    if (current.heading || body) {
      const text = current.heading && plainText(current.heading);
      sections.push({
        heading: text,
        id: text ? slugify(text) : undefined,
        body,
      });
    }
  };

  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const heading = !inFence && headingOf(line);
    if (heading && heading[1].length === 2) {
      flush();
      current = { heading: heading[2], lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  flush();
  return sections;
}

const cellsOf = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map(cell => cell.trim());

const unbold = (text: string) =>
  text
    .replace(/^\*\*(.+?)\*\*:?$/, '$1')
    .replace(/:$/, '')
    .trim();

/**
 * A two-column table at the start of the body, as key/value rows, and the
 * markdown after it.
 */
export function parseSummaryTable(
  body: string
): { rows: KeyValue[]; rest: string } | null {
  const lines = body.split('\n');
  const end = lines.findIndex(line => !line.trim().startsWith('|'));
  const table = end === -1 ? lines : lines.slice(0, end);
  if (table.length < 3) return null;
  const rows = table
    .slice(1)
    .filter(line => !/^\|?[\s:|-]+\|?$/.test(line.trim()))
    .map(cellsOf);
  if (!rows.every(cells => cells.length === 2) || !rows[0][0]) return null;
  // A row with an empty key continues the value above it
  const merged: KeyValue[] = [];
  for (const [key, value] of rows) {
    if (key) merged.push({ key: unbold(key), value });
    else merged[merged.length - 1].value += `<br>${value}`;
  }
  return {
    rows: merged,
    rest: end === -1 ? '' : trimRules(lines.slice(end).join('\n')),
  };
}

const KEY_VALUE = /^[-*+]\s+\*\*(.+?):?\*\*:?\s*(.*)$/;

/**
 * Splits a body into runs of `- **Key**: value` lines (as key/value rows)
 * and the markdown between them. Null when there are no such lines.
 */
export function parseKeyValueBlocks(
  body: string
): (KeyValue[] | string)[] | null {
  const blocks: (KeyValue[] | string)[] = [];
  for (const line of body.split('\n')) {
    const row = line.match(KEY_VALUE);
    const last = blocks.at(-1);
    if (row) {
      const entry = { key: unbold(row[1]), value: row[2].trim() };
      if (Array.isArray(last)) last.push(entry);
      else blocks.push([entry]);
    } else if (typeof last === 'string') {
      blocks[blocks.length - 1] = `${last}\n${line}`;
    } else if (!(Array.isArray(last) && !line.trim())) {
      blocks.push(line);
    }
  }
  if (!blocks.some(Array.isArray)) return null;
  return blocks
    .map(block => (Array.isArray(block) ? block : trimRules(block)))
    .filter(block => block.length);
}

/** A body that is only `- [label](href) note` lines. */
export function parseLinkList(
  body: string
): { label: string; href: string; note?: string }[] | null {
  const lines = body.split('\n').filter(line => line.trim());
  const links = lines.map(line =>
    line.match(/^[-*+]\s+\[([^\]]+)\]\(([^)\s]+)\)\s*(.*)$/)
  );
  if (!links.length || links.some(link => !link)) return null;
  return links.map(link => ({
    label: link![1],
    href: link![2],
    note: link![3].trim() || undefined,
  }));
}

/** `**Q: question**` lines each followed by an `A: answer`. */
export function parseFaqs(body: string): Faq[] | null {
  const [before, ...chunks] = body.split(/^\*\*Q:\s*/m);
  if (before.trim() || !chunks.length) return null;
  const faqs = chunks.map(chunk => {
    const match = chunk.match(/^(.+?)\*\*\s*\n+\s*A:\s*([\s\S]+)$/);
    return match && { question: match[1].trim(), answer: match[2].trim() };
  });
  return faqs.every(Boolean) ? (faqs as Faq[]) : null;
}

/** `### Option A: …` subsections, when there are at least two. */
export function parseOptions(
  body: string
): { intro: string; options: ApplyOption[] } | null {
  const parts = body.split(/^###\s+(Option\s+[A-Z0-9]+\b.*)$/m);
  if (parts.length < 5) return null;
  const options: ApplyOption[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    options.push({
      title: plainText(parts[i]).replace(
        /^Option\s+[A-Z0-9]+\s*[:.–—-]\s*/,
        ''
      ),
      body: trimRules(parts[i + 1]),
    });
  }
  return { intro: trimRules(parts[0]), options };
}

const STEP = /^(#{3,5})\s+Step\s+(\d+)\s*[:.–—-]?\s*(.*?)\s*#*$/i;

/** Numbered `### Step 1: …` (or `####`) headings and what follows each. */
export function parseSteps(body: string): StepGroup | null {
  const lines = body.split('\n');
  const first = lines.findIndex(line => STEP.test(line));
  if (first === -1) return null;
  const level = lines[first].match(STEP)![1].length;

  const steps: Step[] = [];
  let end = lines.length;
  for (let i = first; i < lines.length; i++) {
    const step = lines[i].match(STEP);
    const heading = headingOf(lines[i]);
    if (step && step[1].length === level) {
      steps.push({ number: step[2], title: plainText(step[3]), body: '' });
    } else if (heading && heading[1].length <= level) {
      // A heading at the steps' level that isn't a step ends them
      end = i;
      break;
    } else {
      const last = steps.at(-1)!;
      last.body += `${lines[i]}\n`;
    }
  }
  if (steps.length < 2) return null;

  return {
    intro: trimRules(lines.slice(0, first).join('\n')),
    steps: steps.map(step => ({ ...step, body: trimRules(step.body) })),
    outro: trimRules(lines.slice(end).join('\n')),
  };
}

const NUMBERED = /^(\d+)\.\s+\*\*(.+?)\*\*:?\s*$/;

/**
 * An ordered list whose items open with a bold title line
 * (`1. **Get a priority number**`), the details indented beneath.
 */
export function parseNumberedSteps(body: string): StepGroup | null {
  const lines = body.split('\n');
  const first = lines.findIndex(line => NUMBERED.test(line));
  if (first === -1) return null;

  const steps: Step[] = [];
  let indent = 0;
  let end = lines.length;
  for (let i = first; i < lines.length; i++) {
    const line = lines[i];
    const item = line.match(NUMBERED);
    if (item) {
      steps.push({ number: item[1], title: plainText(item[2]), body: '' });
      indent = item[1].length + 2;
    } else if (!line.trim() || /^\s/.test(line)) {
      steps.at(-1)!.body +=
        `${line.replace(new RegExp(`^ {0,${indent}}`), '')}\n`;
    } else {
      end = i;
      break;
    }
  }
  if (steps.length < 2) return null;

  return {
    intro: trimRules(lines.slice(0, first).join('\n')),
    steps: steps.map(step => ({ ...step, body: trimRules(step.body) })),
    outro: trimRules(lines.slice(end).join('\n')),
  };
}
