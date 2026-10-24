import Section from '../components/ui/Section';
import { useParams } from 'react-router-dom';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  getCategorySubcategories,
  type CategoryIndex,
} from '../data/yamlLoader';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import LinkList from '../components/ui/LinkList';
import RelatedLinks from '../components/ui/RelatedLinks';
import SEO from '../components/SEO';
import Directory from '../components/government/Directory';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedCategories } from '../hooks/useLocalizedCategories';

const Government: React.FC = () => {
  const { category } = useParams();
  const { t } = useTranslation();
  const { lang, governmentCategories } = useLocalizedCategories();
  const governmentName = import.meta.env.VITE_GOVERNMENT_NAME;
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex>({
    layout: 'list',
    pages: [],
  });
  const [loading, setLoading] = useState(false);

  const categoryData = governmentCategories.categories.find(
    c => c.slug === category
  );

  useEffect(() => {
    if (category && categoryData) {
      setLoading(true);
      getCategorySubcategories(category, lang)
        .then(setCategoryIndex)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category, categoryData, lang]);

  if (!category) {
    return (
      <>
        <SEO
          title={t('government.seoTitle')}
          description={t('government.allDescription', { governmentName })}
          keywords="government services, public services, local government, civic services"
        />
        <Section>
          <Breadcrumbs />
          <Heading>{t('government.allTitle')}</Heading>
          <Text size="lg" className="max-w-[640px]">
            {t('government.allDescription', { governmentName })}
          </Text>
          <LinkList
            layout="grid"
            headingLevel={2}
            items={governmentCategories.categories.map(c => ({
              key: c.slug,
              title: c.category,
              href: `/government/${c.slug}`,
              description: c.description,
            }))}
          />
        </Section>
      </>
    );
  }
  if (!categoryData) {
    return (
      <Section>
        <Breadcrumbs />
        <Heading>{t('common.categoryNotFound')}</Heading>
        <Text>{t('common.categoryNotFoundDescription')}</Text>
      </Section>
    );
  }

  const seo = (
    <SEO
      title={categoryData.category || category}
      description={categoryData.description}
      keywords={`${categoryData.category}, government services, public services, local government`}
    />
  );
  const caption = (
    <span className="type-lead mb-[5px] block text-ink-secondary">
      {t('nav.government')}
    </span>
  );

  // An index with groups (departments) is a full-width directory
  if (!loading && categoryIndex.groups?.length) {
    return (
      <>
        {seo}
        <Section>
          <Breadcrumbs />
          <div className="max-w-[640px]">
            {caption}
            <Heading className="tablet:mb-[30px]">
              {categoryData.category || category}
            </Heading>
            <Text size="lg">{categoryData.description}</Text>
          </div>
          <Directory
            groups={categoryIndex.groups}
            pages={categoryIndex.pages}
            basePath={`/government/${category}`}
          />
        </Section>
      </>
    );
  }

  return (
    <>
      {seo}
      <Section>
        <Breadcrumbs />
        <div className="flex flex-wrap items-start gap-x-[60px] gap-y-10">
          <div className="min-w-0 flex-[999_1_560px]">
            {caption}
            <Heading className="tablet:mb-[30px]">
              {categoryData.category || category}
            </Heading>
            <Text size="lg">{categoryData.description}</Text>

            {loading ? (
              <Text>{t('common.loading')}</Text>
            ) : (
              <>
                {categoryIndex.title && (
                  <Heading level={2} size="m">
                    {categoryIndex.title}
                  </Heading>
                )}
                {categoryIndex.description && (
                  <Text>{categoryIndex.description}</Text>
                )}
                <LinkList
                  layout={categoryIndex.layout}
                  headingLevel={categoryIndex.title ? 3 : 2}
                  items={categoryIndex.pages.map(page => ({
                    key: page.slug,
                    title: page.name,
                    href: `/government/${category}/${page.slug}`,
                    description: page.description,
                  }))}
                />
              </>
            )}
          </div>
          <div className="min-w-0 flex-[1_1_300px]">
            <RelatedLinks
              title={t('government.otherCategories')}
              links={governmentCategories.categories
                .filter(c => c.slug !== category)
                .map(c => ({
                  label: c.category,
                  href: `/government/${c.slug}`,
                }))}
            />
          </div>
        </div>
      </Section>
    </>
  );
};

export default Government;
