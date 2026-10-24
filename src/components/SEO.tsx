import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// Open Graph locale and human-readable language name per UI language.
const LOCALE_META: Record<string, { og: string; name: string }> = {
  en: { og: 'en_US', name: 'English' },
  ceb: { og: 'ceb_PH', name: 'Cebuano' },
};

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = 'BetterLapuLapu',
}: SEOProps) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const locale = LOCALE_META[i18n.resolvedLanguage ?? 'en'] ?? LOCALE_META.en;
  const governmentName =
    import.meta.env.VITE_GOVERNMENT_NAME || 'Lapu-Lapu City';
  const defaultTitle = `${siteName} | ${t('seo.defaultTitle', { governmentName })}`;
  const defaultDescription =
    import.meta.env.VITE_SITE_DESCRIPTION ||
    t('seo.defaultDescription', { siteName, governmentName });
  const defaultKeywords =
    import.meta.env.VITE_SITE_KEYWORDS ||
    'government, local government, services, public services, civic services';

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const siteUrl = (import.meta.env.VITE_WEBSITE_URL || '').replace(/\/+$/, '');
  const path = pathname.replace(/\/+$/, '') || '/';
  const fullUrl = url || `${siteUrl}${path}`;
  // Share images are generated per page by scripts/build-og.js
  const fullImage =
    image || `${siteUrl}/og${path === '/' ? '/index' : path}.png`;
  const twitterHandle = import.meta.env.VITE_TWITTER_HANDLE || '';
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={siteName} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={locale.name} />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale.og} />
      {facebookAppId && <meta property="fb:app_id" content={facebookAppId} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#0066eb" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
    </Helmet>
  );
}
