import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { ISSUES_URL } from '../data/navigation';

const linkClass = 'link';
const listClass = 'type-body list-disc space-y-[5px] pl-5';

export default function Accessibility() {
  const { t } = useTranslation();
  const practices = t('accessibility.practices', {
    returnObjects: true,
  }) as string[];
  const limitations = t('accessibility.limitations', {
    returnObjects: true,
  }) as string[];

  return (
    <>
      <SEO
        title={t('common.accessibility')}
        description={t('accessibility.seoDescription', {
          governmentName: import.meta.env.VITE_GOVERNMENT_NAME,
        })}
      />
      <Section>
        <Breadcrumbs />
        <div className="max-w-[640px]">
          <Heading>{t('common.accessibility')}</Heading>
          <Text size="lg">{t('accessibility.intro')}</Text>
        </div>

        <div className="max-w-[640px] space-y-[30px] tablet:space-y-[45px]">
          <div>
            <Heading level={2} size="m">
              {t('accessibility.standardTitle')}
            </Heading>
            <p className="type-body">
              <Trans
                i18nKey="accessibility.standard"
                components={{
                  wcag: (
                    <a
                      href="https://www.w3.org/TR/WCAG21/"
                      className={linkClass}
                    />
                  ),
                }}
              />
            </p>
          </div>

          <div>
            <Heading level={2} size="m">
              {t('accessibility.practicesTitle')}
            </Heading>
            <ul className={listClass}>
              {practices.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={2} size="m">
              {t('accessibility.plainTextTitle')}
            </Heading>
            <p className="type-body">
              <Trans
                i18nKey="accessibility.plainText"
                components={{
                  code: <code />,
                  sitemap: <Link to="/sitemap" className={linkClass} />,
                  llms: <a href="/llms-full.txt" className={linkClass} />,
                }}
              />
            </p>
          </div>

          <div>
            <Heading level={2} size="m">
              {t('accessibility.limitationsTitle')}
            </Heading>
            <ul className={listClass}>
              {limitations.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={2} size="m">
              {t('accessibility.reportTitle')}
            </Heading>
            <p className="type-body">
              <Trans
                i18nKey="accessibility.report"
                components={{
                  issue: (
                    <a
                      href={ISSUES_URL}
                      className={linkClass}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
