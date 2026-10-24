import { Fragment, useMemo, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useTranslation } from 'react-i18next';
import { createMarkdownComponents } from '../../lib/markdownComponents';
import { getTypographyTheme } from '../../lib/typographyThemes';
import {
  isSection,
  parseFaqs,
  parseKeyValueBlocks,
  parseNumberedSteps,
  parseOptions,
  parseSteps,
  parseSummaryTable,
  plainText,
  SECTION,
  type GuideSection,
} from '../../lib/guideSections';
import SummaryList from '../ui/SummaryList';
import StepList from '../ui/StepList';
import Tabs from '../ui/Tabs';
import Accordion from '../ui/Accordion';
import Details from '../ui/Details';

// Renders a content page's sections, showing the parts of the content
// template as components and everything else as plain markdown.
export default function GuideBody({
  sections,
  theme = 'default',
}: {
  sections: GuideSection[];
  theme?: string;
}) {
  const { t } = useTranslation();
  const typography = getTypographyTheme(theme);
  const components = useMemo(
    () => createMarkdownComponents(typography) as Components,
    [typography]
  );
  // For table cells and list values: no paragraph wrapper or margins
  const inlineComponents = useMemo<Components>(
    () => ({ ...components, p: ({ children }) => <>{children}</> }),
    [components]
  );

  const markdown = (text: string, inline = false): ReactNode =>
    text ? (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={inline ? inlineComponents : components}
      >
        {text}
      </ReactMarkdown>
    ) : null;

  const keyValues = (rows: { key: string; value: string }[]) => (
    <SummaryList
      rows={rows.map(row => ({
        key: row.key,
        value: markdown(row.value, true),
      }))}
    />
  );

  // `numbered` also reads a bold-titled ordered list as steps; only used
  // where the section is about applying
  const steps = (body: string, headingLevel: 3 | 4, numbered = false) => {
    const group =
      parseSteps(body) ?? (numbered ? parseNumberedSteps(body) : null);
    if (!group) return markdown(body);
    return (
      <>
        {markdown(group.intro)}
        <StepList
          headingLevel={headingLevel}
          steps={group.steps.map(step => ({
            number: step.number,
            title: step.title,
            content: markdown(step.body),
          }))}
        />
        {markdown(group.outro)}
      </>
    );
  };

  const content = (section: GuideSection): ReactNode => {
    const { body } = section;

    const isApply = isSection(section, SECTION.apply);

    if (isSection(section, SECTION.summary)) {
      const summary = parseSummaryTable(body);
      if (summary) {
        return (
          <>
            {keyValues(summary.rows)}
            {markdown(summary.rest)}
          </>
        );
      }
    }

    if (isSection(section, SECTION.contact)) {
      const blocks = parseKeyValueBlocks(body);
      if (blocks) {
        return blocks.map((block, index) => (
          <Fragment key={index}>
            {typeof block === 'string' ? markdown(block) : keyValues(block)}
          </Fragment>
        ));
      }
    }

    if (isSection(section, SECTION.charter)) {
      return (
        <Details summary={t('guide.charterSummary')}>{markdown(body)}</Details>
      );
    }

    if (isSection(section, SECTION.faq)) {
      const faqs = parseFaqs(body);
      if (faqs) {
        return (
          <Accordion
            items={faqs.map(faq => ({
              heading: plainText(faq.question),
              content: markdown(faq.answer),
            }))}
          />
        );
      }
    }

    // Ways to apply become tabs, each holding its own steps
    const options = parseOptions(body);
    if (options) {
      return (
        <>
          {markdown(options.intro)}
          <Tabs
            label={section.heading ?? ''}
            tabs={options.options.map(option => ({
              title: option.title,
              content: steps(option.body, 4, isApply),
            }))}
          />
        </>
      );
    }

    return steps(body, 3, isApply);
  };

  return (
    <>
      {sections.map((section, index) => (
        <section key={section.id ?? index} aria-labelledby={section.id}>
          {section.heading && (
            <h2 id={section.id} className={typography.components.h2}>
              {section.heading}
            </h2>
          )}
          {content(section)}
        </section>
      ))}
    </>
  );
}
