#!/usr/bin/env node
/**
 * Gives every page its own link preview. Runs after `vite build`:
 *
 * - dist/og/<path>.png: a 1200×630 share image with the page title
 * - dist/<path>.html: the built app shell with that page's title,
 *   description, canonical URL and Open Graph / Twitter tags in it
 *
 * Link preview crawlers don't run JavaScript, so the tags the SEO
 * component adds in the browser never reach them; these static copies do.
 * Vercel serves <path>.html at /<path> (cleanUrls in vercel.json) before
 * falling back to the SPA rewrite. Tags carry data-rh so react-helmet replaces them once
 * the app loads.
 */

import fs from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import {
  collectContent,
  env,
  readYaml,
  rootDir,
  siteUrl,
} from './lib/content.js';

const distDir = path.join(rootDir, 'dist');
const SITE_NAME = 'BetterLapuLapu';
const WIDTH = 1200;
const HEIGHT = 630;

const baseUrl = siteUrl();
// Links shares of the site to a Facebook app (optional)
const facebookAppId = env.VITE_FACEBOOK_APP_ID;
const governmentName = env.VITE_GOVERNMENT_NAME || 'Lapu-Lapu City';
const locale = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'public/locales/en/common.json'), 'utf8')
);
const say = (text = '') =>
  text
    .replace(/\{\{governmentName\}\}/g, governmentName)
    .replace(/\{\{siteName\}\}/g, SITE_NAME);

// ---------------------------------------------------------------------------
// Pages

/** Every route with its title, the label shown above it, and description. */
function collectPages() {
  const pages = [
    {
      path: '/',
      title: governmentName,
      caption: say(locale.seo.defaultTitle),
      htmlTitle: `${SITE_NAME} | ${say(locale.seo.defaultTitle)}`,
      description: say(locale.seo.homeDescription),
    },
    {
      path: '/services',
      title: locale.services.allTitle,
      caption: locale.nav.services,
      description: say(locale.services.allDescription),
    },
    {
      path: '/government',
      title: locale.government.allTitle,
      caption: locale.nav.government,
      description: say(locale.government.allDescription),
    },
    {
      path: '/search',
      title: locale.common.search,
      description: say(locale.search.seoDescription),
    },
    {
      path: '/sitemap',
      title: locale.common.sitemap,
      description: say(locale.sitemap.seoDescription),
    },
    {
      path: '/accessibility',
      title: locale.common.accessibility,
      description: say(locale.accessibility.seoDescription),
    },
  ];

  const { sections } = collectContent();
  for (const section of sections) {
    for (const category of section.categories) {
      pages.push({
        path: category.url,
        title: category.name,
        caption: section.label,
        description: category.description,
      });
      for (const page of category.pages) {
        pages.push({
          path: page.url,
          title: page.title || page.name,
          caption: category.name,
          description: page.description,
          type: 'article',
        });
      }
    }
  }

  // Dashboards rendered by their own pages (Reports and Statistics, FY 2027
  // Budget Projects) list their sections as subcategories in government.yaml
  const { categories = [] } = readYaml(
    path.join(rootDir, 'src/data/government.yaml')
  );
  for (const slug of ['reports-and-statistics', 'budget-projects']) {
    const dashboard = categories.find(c => c.slug === slug);
    for (const sub of dashboard?.subcategories || []) {
      pages.push({
        path: `/government/${slug}/${sub.slug}`,
        title: sub.name,
        caption: dashboard.category,
        description: dashboard.description,
      });
    }
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Share image

const font = weight =>
  fs.readFileSync(
    path.join(
      rootDir,
      `node_modules/@fontsource/arimo/files/arimo-latin-${weight}-normal.woff`
    )
  );
const fonts = [
  { name: 'Arimo', data: font(400), weight: 400, style: 'normal' },
  { name: 'Arimo', data: font(700), weight: 700, style: 'normal' },
];

// The white logo, rasterised once and embedded in every image
const logo = `data:image/png;base64,${new Resvg(
  fs.readFileSync(path.join(rootDir, 'public/logo-white.svg'), 'utf8'),
  { fitTo: { mode: 'height', value: 160 }, font: { loadSystemFonts: false } }
)
  .render()
  .asPng()
  .toString('base64')}`;

// The sun from the flag, drawn faintly behind the title
const sun = (() => {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const point = (r, da) =>
      `${(300 + r * Math.cos(a + da)).toFixed(1)},${(300 + r * Math.sin(a + da)).toFixed(1)}`;
    return `<polygon points="${point(300, 0)} ${point(130, 0.2)} ${point(130, -0.2)}"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" fill="#ffffff">${rays}<circle cx="300" cy="300" r="115"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
})();

const h = (type, style, children) => ({ type, props: { style, children } });

// The image shows the title without the "— Lapu-Lapu City" most pages
// carry; the logo already says where it's from.
const imageTitle = title =>
  title.replace(/\s+[—–-]\s+Lapu[\s-]?Lapu City\b/i, '').trim();

function titleSize(title) {
  if (title.length > 70) return 52;
  if (title.length > 40) return 60;
  return 72;
}

async function renderImage(page) {
  const title = imageTitle(page.title);
  const svg = await satori(
    h(
      'div',
      {
        width: WIDTH,
        height: HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        backgroundImage: 'linear-gradient(135deg, #0052bc 0%, #003d8d 100%)',
        color: '#ffffff',
        fontFamily: 'Arimo',
        position: 'relative',
      },
      [
        {
          type: 'img',
          props: {
            src: sun,
            width: 620,
            height: 620,
            style: {
              position: 'absolute',
              right: -150,
              top: -60,
              opacity: 0.12,
            },
          },
        },
        h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
          {
            type: 'img',
            props: { src: logo, height: 80, style: { height: 80 } },
          },
          h('div', { fontSize: 38, fontWeight: 700 }, SITE_NAME),
        ]),
        h('div', { display: 'flex', flexDirection: 'column', gap: 16 }, [
          page.caption
            ? h('div', { fontSize: 30, color: '#cce0fb' }, page.caption)
            : null,
          h(
            'div',
            {
              fontSize: titleSize(title),
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 960,
            },
            title.length > 110 ? `${title.slice(0, 107)}…` : title
          ),
        ]),
        h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
          h('div', {
            width: 96,
            height: 8,
            backgroundColor: '#f2c91d',
          }),
          h('div', { fontSize: 26, color: '#e6f0fd' }, new URL(baseUrl).host),
        ]),
      ]
    ),
    { width: WIDTH, height: HEIGHT, fonts }
  );
  // Satori draws text as paths, so resvg needs no fonts of its own
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
}

// ---------------------------------------------------------------------------
// HTML

const escape = (text = '') =>
  text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const imagePath = page => `/og${page.path === '/' ? '/index' : page.path}.png`;

// Tags the build replaces: the title, description, canonical link and any
// Open Graph or Twitter tags already in index.html
const REPLACED =
  /\s*<(?:title>[^<]*<\/title>|meta\s+(?:name|property)="(?:description|og:[^"]*|fb:[^"]*|twitter:[^"]*)"[^>]*>|link\s+rel="canonical"[^>]*>)/g;

function headTags(page) {
  const url = `${baseUrl}${page.path === '/' ? '/' : page.path}`;
  const title = page.htmlTitle || `${page.title} | ${SITE_NAME}`;
  const description = page.description || say(locale.seo.homeDescription);
  const image = `${baseUrl}${imagePath(page)}`;
  const meta = (attr, key, value) =>
    `<meta ${attr}="${key}" content="${escape(value)}" data-rh="true" />`;

  return [
    `<title>${escape(title)}</title>`,
    meta('name', 'description', description),
    `<link rel="canonical" href="${escape(url)}" data-rh="true" />`,
    meta('property', 'og:type', page.type || 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    ...(facebookAppId ? [meta('property', 'fb:app_id', facebookAppId)] : []),
    meta('property', 'og:locale', 'en_US'),
    meta('property', 'og:url', url),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:image', image),
    meta('property', 'og:image:type', 'image/png'),
    meta('property', 'og:image:width', String(WIDTH)),
    meta('property', 'og:image:height', String(HEIGHT)),
    meta('property', 'og:image:alt', imageTitle(page.title)),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', imageTitle(page.title)),
  ]
    .map(tag => `    ${tag}`)
    .join('\n');
}

// ---------------------------------------------------------------------------

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

async function main() {
  const shellPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(shellPath)) {
    throw new Error('dist/index.html not found: run `vite build` first');
  }
  const shell = fs.readFileSync(shellPath, 'utf8').replace(REPLACED, '');

  const pages = collectPages();
  for (const page of pages) {
    write(path.join(distDir, imagePath(page)), await renderImage(page));
    const html = shell.replace('</head>', `${headTags(page)}\n  </head>`);
    write(
      page.path === '/' ? shellPath : path.join(distDir, `${page.path}.html`),
      html
    );
  }

  console.log(`✅ Share images and page metadata for ${pages.length} pages`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
