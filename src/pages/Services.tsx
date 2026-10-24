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
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedCategories } from '../hooks/useLocalizedCategories';

const Services: React.FC = () => {
  const { category } = useParams();
  const { t } = useTranslation();
  const { lang, serviceCategories } = useLocalizedCategories();
  const governmentName = import.meta.env.VITE_GOVERNMENT_NAME;
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex>({
    layout: 'list',
    pages: [],
  });
  const [loading, setLoading] = useState(false);

  const categoryData = serviceCategories.categories.find(
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
          title={t('services.seoTitle')}
          description={t('services.allDescription', { governmentName })}
          keywords="government services, public services, local government, civic services"
        />
        <Section>
          <Breadcrumbs />
          <Heading>{t('services.allTitle')}</Heading>
          <Text size="lg" className="max-w-[640px]">
            {t('services.allDescription', { governmentName })}
          </Text>
          <LinkList
            layout="grid"
            headingLevel={2}
            items={serviceCategories.categories.map(c => ({
              key: c.slug,
              title: c.category,
              href: `/services/${c.slug}`,
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

  return (
    <>
      <SEO
        title={categoryData.category || category}
        description={categoryData.description}
        keywords={`${categoryData.category}, government services, public services, local government`}
      />
      <Section>
        <Breadcrumbs />
        <div className="flex flex-wrap items-start gap-x-[60px] gap-y-10">
          <div className="min-w-0 flex-[999_1_560px]">
            <span className="type-lead mb-[5px] block text-ink-secondary">
              {t('nav.services')}
            </span>
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
                    href: `/services/${category}/${page.slug}`,
                    description: page.description,
                  }))}
                />
              </>
            )}
          </div>
          <div className="min-w-0 flex-[1_1_300px]">
            <RelatedLinks
              title={t('services.otherCategories')}
              links={serviceCategories.categories
                .filter(c => c.slug !== category)
                .map(c => ({ label: c.category, href: `/services/${c.slug}` }))}
            />
          </div>
        </div>
      </Section>
    </>
  );
};

export default Services;
