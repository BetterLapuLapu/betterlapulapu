import Section from '../ui/Section';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import LinkList from '../ui/LinkList';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocalizedCategories } from '../../hooks/useLocalizedCategories';

export default function GovernmentActivitySection() {
  const { t } = useTranslation();
  const { governmentCategories } = useLocalizedCategories();

  return (
    <Section
      id="government"
      className="bg-surface py-[30px] tablet:pt-[50px] tablet:pb-[60px]"
      labelledBy="government-title"
    >
      <Heading level={2} id="government-title">
        {t('governmentActivity.title')}
      </Heading>
      <Text className="max-w-[640px]">
        {t('governmentActivity.description')}
      </Text>
      <LinkList
        layout="grid"
        items={governmentCategories.categories.map(category => ({
          key: category.slug,
          title: category.category,
          href: `/government/${category.slug}`,
          description: category.description,
        }))}
      />
    </Section>
  );
}
