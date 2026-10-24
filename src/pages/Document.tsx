import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import {
  isSection,
  parseLinkList,
  SECTION,
  splitSections,
} from '../lib/guideSections';
import GuideBody from '../components/guide/GuideBody';
import {
  getCategorySubcategories,
  isNestedCategory,
  type Subcategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import SEO from '../components/SEO';
import LinkList from '../components/ui/LinkList';
import RelatedLinks from '../components/ui/RelatedLinks';
import { useTranslation } from 'react-i18next';
import { useLocalizedCategories } from '../hooks/useLocalizedCategories';

interface DocumentProps {
  theme?: string;
  categoryType?: 'service' | 'government';
}

export default function Document({
  theme: initialTheme = 'default',
  categoryType,
}: DocumentProps) {
  const { documentSlug, category } = useParams();
  const { t } = useTranslation();
  const { lang, serviceCategories, governmentCategories } =
    useLocalizedCategories();
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [nestedIndex, setNestedIndex] = useState<CategoryIndex | null>(null);
  // Other pages in the same category, for the sidebar
  const [siblings, setSiblings] = useState<Subcategory[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: t('common.home'), href: '/' },
  ]);

  useEffect(() => {
    if (!documentSlug || !category || !categoryType) {
      setError(t('document.noneSpecified'));
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        setNestedIndex(null);
        setSiblings([]);

        const isGovernment = categoryType === 'government';
        const categories = isGovernment
          ? governmentCategories.categories
          : serviceCategories.categories;
        const sectionLabel = isGovernment
          ? t('nav.government')
          : t('nav.services');
        const sectionHref = isGovernment ? '/government' : '/services';
        const categoryData = categories.find(c => c.slug === category);
        setCategoryName(categoryData?.category ?? '');

        // If the slug maps to its own index, render it as a nested listing
        if (isNestedCategory(documentSlug)) {
          const index = await getCategorySubcategories(documentSlug, lang);
          setNestedIndex(index);
          setBreadcrumbs([
            { label: t('common.home'), href: '/' },
            { label: sectionLabel, href: sectionHref },
            {
              label: categoryData?.category ?? category,
              href: `${sectionHref}/${category}`,
            },
          ]);
          return;
        }

        const content = await loadMarkdownContent(
          documentSlug,
          category,
          categoryType
        );
        setMarkdownContent(content);
        getCategorySubcategories(category, lang)
          .then(index =>
            setSiblings(index.pages.filter(page => page.slug !== documentSlug))
          )
          .catch(() => setSiblings([]));

        setBreadcrumbs([
          { label: t('common.home'), href: '/' },
          { label: sectionLabel, href: sectionHref },
          {
            label: categoryData?.category ?? category,
            href: `${sectionHref}/${category}`,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('document.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [
    documentSlug,
    category,
    categoryType,
    lang,
    t,
    serviceCategories,
    governmentCategories,
  ]);

  if (loading) {
    return (
      <Section>
        <Text className="mt-[30px]">{t('common.loading')}</Text>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Breadcrumbs items={breadcrumbs} />
        <Heading>{t('document.notFound')}</Heading>
        <Text>{error}</Text>
      </Section>
    );
  }

  const sectionPath = categoryType === 'government' ? 'government' : 'services';
  const caption = categoryName && (
    <span className="type-lead mb-[5px] block text-ink-secondary">
      {categoryName}
    </span>
  );

  if (nestedIndex) {
    const nestedPages: Subcategory[] = nestedIndex.pages;
    return (
      <>
        <SEO
          title={nestedIndex.title ?? documentSlug}
          keywords={`${documentSlug}, government services, local government`}
        />
        <Section>
          <Breadcrumbs items={breadcrumbs} />
          <div className="max-w-[640px]">
            {caption}
            {nestedIndex.title && (
              <Heading className="tablet:mb-[30px]">
                {nestedIndex.title}
              </Heading>
            )}
            {nestedIndex.description && (
              <Text size="lg">{nestedIndex.description}</Text>
            )}
          </div>
          <LinkList
            layout={nestedIndex.layout}
            headingLevel={2}
            items={nestedPages.map((page, i) => ({
              key: page.slug ?? String(i),
              title: page.name,
              description: page.description,
            }))}
          />
        </Section>
      </>
    );
  }

  if (!markdownContent) {
    return null;
  }

  // Related Services links move to the sidebar
  const allSections = splitSections(markdownContent.body);
  const relatedSection = allSections.find(section =>
    isSection(section, SECTION.related)
  );
  const relatedLinks = relatedSection && parseLinkList(relatedSection.body);
  const sections = relatedLinks
    ? allSections.filter(section => section !== relatedSection)
    : allSections;
  const contents = sections.filter(section => section.heading);

  return (
    <>
      <SEO
        title={markdownContent.title || documentSlug}
        description={
          markdownContent.description ||
          t('document.seoDescription', { slug: documentSlug })
        }
        keywords={`${documentSlug}, government services, public services, local government`}
      />
      <Section>
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex flex-wrap items-start gap-x-[60px] gap-y-10">
          <article className="min-w-0 flex-[999_1_560px]">
            {caption}
            <Heading className="tablet:mb-[30px]">
              {markdownContent.title || documentSlug}
            </Heading>
            {markdownContent.description && (
              <Text size="lg">{markdownContent.description}</Text>
            )}

            {contents.length >= 3 && (
              <nav
                aria-labelledby="contents-title"
                className="mb-[30px] tablet:mb-10"
              >
                <h2 id="contents-title" className="type-s mb-2.5">
                  {t('document.contents')}
                </h2>
                <ol className="type-small space-y-[5px]">
                  {contents.map(item => (
                    <li key={item.id} className="flex gap-2.5">
                      <span aria-hidden="true">—</span>
                      <a href={`#${item.id}`} className="link">
                        {item.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <GuideBody sections={sections} theme={initialTheme} />
          </article>
          <div className="min-w-0 flex-[1_1_300px] space-y-10">
            {relatedLinks && (
              <RelatedLinks title={t('guide.related')} links={relatedLinks} />
            )}
            <RelatedLinks
              title={t('document.moreIn', { category: categoryName })}
              links={siblings.slice(0, 10).map(page => ({
                label: page.name,
                href: `/${sectionPath}/${category}/${page.slug}`,
              }))}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
