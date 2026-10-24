import Section from '../ui/Section';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import LinkList from '../ui/LinkList';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocalizedCategories } from '../../hooks/useLocalizedCategories';

export default function ServicesSection() {
  const { t } = useTranslation();
  const { serviceCategories } = useLocalizedCategories();

  return (
    <Section
      className="py-[30px] tablet:pt-[50px] tablet:pb-[60px]"
      labelledBy="services-title"
    >
      <Heading level={2} id="services-title">
        {t('services.title')}
      </Heading>
      <Text className="max-w-[640px]">{t('services.description')}</Text>
      <LinkList
        layout="grid"
        items={serviceCategories.categories.map(category => ({
          key: category.slug,
          title: category.category,
          href: `/services/${category.slug}`,
          description: category.description,
        }))}
      />
    </Section>
  );
}
