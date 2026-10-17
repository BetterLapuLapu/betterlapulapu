import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

const issuesUrl = 'https://github.com/BetterLapuLapu/betterlapulapu/issues';
const linkClass = 'underline hover:text-primary-600';

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
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <Heading>{t('common.accessibility')}</Heading>
        <Text className="text-gray-600 mb-8">{t('accessibility.intro')}</Text>

        <div className="max-w-3xl space-y-10 text-gray-700">
          <div>
            <Heading level={2}>{t('accessibility.standardTitle')}</Heading>
            <p>
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
            <Heading level={2}>{t('accessibility.practicesTitle')}</Heading>
            <ul className="list-disc space-y-2 pl-6">
              {practices.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={2}>{t('accessibility.plainTextTitle')}</Heading>
            <p>
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
            <Heading level={2}>{t('accessibility.limitationsTitle')}</Heading>
            <ul className="list-disc space-y-2 pl-6">
              {limitations.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={2}>{t('accessibility.reportTitle')}</Heading>
            <p>
              <Trans
                i18nKey="accessibility.report"
                components={{
                  issue: (
                    <a
                      href={issuesUrl}
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
