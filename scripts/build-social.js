#!/usr/bin/env node
/**
 * Renders on-brand social media graphics from a YAML (or JSON) post spec.
 *
 *   npm run social -- path/to/post.yaml [--out out/social] [--formats square,story]
 *
 * A spec is one post, or `posts:` with several. Each post picks a template
 * (announcement, stat, list, event), a theme (blue, light, alert) and the
 * formats to render (square, portrait, story, landscape). For every post it
 * writes <out>/<slug>/<format>.png and <out>/<slug>/post.md with the caption,
 * alt text and link to paste alongside the image.
 *
 * Text that is too long to fit is shrunk, then cut short with an ellipsis,
 * and the script prints a warning naming the field.
 *
 * The fields of each template are documented in
 * .claude/skills/social-graphics/SKILL.md.
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import yaml from 'js-yaml';
import { rootDir, siteUrl } from './lib/content.js';
import {
  BLUE_GRADIENT,
  LOGO_ASPECT,
  SITE_NAME,
  colors,
  h,
  img,
  logo,
  renderPng,
  sun,
} from './lib/brand.js';

// ---------------------------------------------------------------------------
// Formats and themes

/**
 * pad is [top, right, bottom, left]. Stories keep clear of the profile bar
 * at the top and the reply box at the bottom, which cover about 250px and
 * 340px of the image.
 */
export const FORMATS = {
  square: {
    width: 1080,
    height: 1080,
    pad: [72, 80, 72, 80],
    scale: 1,
    use: 'Instagram and Facebook feed',
  },
  portrait: {
    width: 1080,
    height: 1350,
    pad: [80, 80, 80, 80],
    scale: 1.06,
    use: 'Instagram and Facebook feed (takes up the most screen)',
  },
  story: {
    width: 1080,
    height: 1920,
    pad: [250, 88, 340, 88],
    scale: 1.12,
    use: 'Instagram and Facebook Stories, Reels and TikTok covers',
  },
  landscape: {
    width: 1200,
    height: 675,
    pad: [52, 72, 52, 72],
    scale: 0.78,
    use: 'X, LinkedIn and Facebook link posts',
  },
};

const THEMES = {
  blue: {
    background: BLUE_GRADIENT,
    text: colors.white,
    muted: colors.primary100,
    faint: colors.primary50,
    highlight: colors.sun,
    accent: colors.sun,
    onAccent: colors.primary900,
    logo: 'white',
    sun: colors.white,
    sunOpacity: 0.12,
  },
  light: {
    background: colors.white,
    text: colors.primary800,
    muted: colors.primary600,
    faint: colors.inkSecondary,
    highlight: colors.primary600,
    accent: colors.sun,
    onAccent: colors.primary900,
    logo: 'colour',
    sun: colors.primary500,
    sunOpacity: 0.07,
    strip: colors.primary600,
  },
  alert: {
    background: `linear-gradient(135deg, ${colors.alert} 0%, ${colors.alertDark} 100%)`,
    text: colors.white,
    muted: '#fde2dd',
    faint: '#fde2dd',
    highlight: colors.sun,
    accent: colors.sun,
    onAccent: colors.ink,
    logo: 'white',
    sun: colors.white,
    sunOpacity: 0.1,
  },
};

const TEMPLATES = {
  announcement: { required: ['headline'] },
  stat: { required: ['value', 'headline'] },
  list: { required: ['headline', 'items'] },
  event: { required: ['headline', 'date'] },
};

const DEFAULT_FORMATS = ['square', 'portrait', 'story'];

// ---------------------------------------------------------------------------
// Text fitting

/** Arimo's average character width, as a share of the font size */
const CHAR_WIDTH = { 400: 0.5, 700: 0.55 };

/** Estimates how many lines text wraps to, wrapping at spaces */
function countLines(text, fontSize, width, weight = 700) {
  const perLine = width / (fontSize * CHAR_WIDTH[weight]);
  let lines = 0;
  for (const paragraph of String(text).split('\n')) {
    let used = Infinity;
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (used + 1 + word.length > perLine) {
        lines += Math.ceil(word.length / perLine);
        used = word.length % perLine;
      } else {
        used += 1 + word.length;
      }
    }
    if (used === Infinity) lines += 1;
  }
  return lines;
}

/**
 * The largest font size from max down to min (in steps of 4px) at which
 * text fits in maxLines. Warns when even min doesn't fit.
 */
function fitText(ctx, field, text, { max, min, maxLines, width, weight }) {
  for (let size = max; size >= min; size -= 4) {
    if (countLines(text, size, width, weight) <= maxLines) return size;
  }
  ctx.warn(
    `"${field}" is too long for ${maxLines} lines; it will be cut short`
  );
  return min;
}

/** A block of text that stops after maxLines with an ellipsis */
const clamp = (style, maxLines, text) =>
  h(
    'div',
    {
      display: 'block',
      lineClamp: maxLines,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      ...style,
    },
    String(text)
  );

// ---------------------------------------------------------------------------
// Icons

const iconDir = path.join(rootDir, 'node_modules/lucide-react/dist/esm/icons');

/** A Lucide icon (by its React name, e.g. "Building2") as an SVG data URL */
async function lucideIcon(name, color) {
  const base = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .toLowerCase();
  const file = [base, base.replace(/-(\d)/g, '$1')]
    .map(n => path.join(iconDir, `${n}.js`))
    .find(f => fs.existsSync(f));
  if (!file) {
    throw new Error(`Unknown Lucide icon "${name}" (see https://lucide.dev)`);
  }
  const { __iconNode } = await import(pathToFileURL(file).href);
  const shapes = __iconNode
    .map(
      ([tag, attrs]) =>
        `<${tag} ${Object.entries(attrs)
          .filter(([key]) => key !== 'key')
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')}/>`
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ---------------------------------------------------------------------------
// Pieces shared by every template

const host = new URL(siteUrl()).host;

/**
 * The link shown in the footer: the post's url without https://, or just
 * the host when there's no url or it's too long for one line
 */
function footerLink(ctx, fontSize, width) {
  const { url } = ctx.post;
  if (!url) return host;
  const link = url.startsWith('/')
    ? `${host}${url}`
    : url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return link.length * fontSize * CHAR_WIDTH[400] <= width ? link : host;
}

/** The small label above the headline, with the post's icon if it has one */
async function kicker(ctx) {
  const { post, theme, s } = ctx;
  if (!post.kicker && !post.icon) return null;
  const size = Math.round(34 * s);
  return h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      gap: Math.round(16 * s),
      fontSize: size,
      fontWeight: 700,
      color: theme.muted,
    },
    [
      post.icon
        ? img(
            await lucideIcon(post.icon, theme.highlight),
            size * 1.4,
            size * 1.4
          )
        : null,
      post.kicker ? h('div', {}, post.kicker) : null,
    ]
  );
}

function headline(ctx, { max, min, maxLines }) {
  const { post, theme, contentWidth } = ctx;
  const size = fitText(ctx, 'headline', post.headline, {
    max,
    min,
    maxLines,
    width: contentWidth,
    weight: 700,
  });
  return clamp(
    { fontSize: size, fontWeight: 700, lineHeight: 1.12, color: theme.text },
    maxLines,
    post.headline
  );
}

function body(ctx, text, { size, maxLines, field = 'body' }) {
  if (!text) return null;
  const { theme, contentWidth, s } = ctx;
  const fontSize = Math.round(size * s);
  if (countLines(text, fontSize, contentWidth, 400) > maxLines) {
    ctx.warn(
      `"${field}" is too long for ${maxLines} lines; it will be cut short`
    );
  }
  return clamp(
    { fontSize, lineHeight: 1.35, color: theme.faint },
    maxLines,
    text
  );
}

/** A yellow call-to-action pill, e.g. "Check the requirements" */
async function cta(ctx) {
  const { post, theme, s } = ctx;
  if (!post.cta) return null;
  const size = Math.round(32 * s);
  return h('div', { display: 'flex' }, [
    h(
      'div',
      {
        display: 'flex',
        alignItems: 'center',
        gap: Math.round(12 * s),
        fontSize: size,
        fontWeight: 700,
        color: theme.onAccent,
        backgroundColor: theme.accent,
        padding: `${Math.round(18 * s)}px ${Math.round(32 * s)}px`,
        borderRadius: Math.round(12 * s),
      },
      [
        h('div', {}, post.cta),
        // Arimo has no arrow glyph, so draw one
        img(await lucideIcon('ArrowRight', theme.onAccent), size, size),
      ]
    ),
  ]);
}

/** Lines per format, so longer formats can say more */
const lines = (ctx, byFormat) => byFormat[ctx.format];

// ---------------------------------------------------------------------------
// Templates. Each returns the middle of the image, between header and footer.

const templates = {
  async announcement(ctx) {
    const { s } = ctx;
    return [
      await kicker(ctx),
      headline(ctx, {
        max: Math.round(96 * s),
        min: Math.round(60 * s),
        maxLines: lines(ctx, {
          square: 5,
          portrait: 6,
          story: 7,
          landscape: 3,
        }),
      }),
      body(ctx, ctx.post.body, {
        size: 36,
        maxLines: lines(ctx, {
          square: 4,
          portrait: 5,
          story: 7,
          landscape: 2,
        }),
      }),
      await cta(ctx),
    ];
  },

  async stat(ctx) {
    const { post, theme, s, contentWidth } = ctx;
    const valueSize = fitText(ctx, 'value', post.value, {
      max: Math.round(220 * s),
      min: Math.round(110 * s),
      maxLines: 1,
      width: contentWidth,
      weight: 700,
    });
    return [
      await kicker(ctx),
      clamp(
        {
          fontSize: valueSize,
          fontWeight: 700,
          lineHeight: 1,
          color: theme.highlight,
          letterSpacing: -2,
        },
        1,
        post.value
      ),
      headline(ctx, {
        max: Math.round(64 * s),
        min: Math.round(44 * s),
        maxLines: lines(ctx, {
          square: 3,
          portrait: 4,
          story: 5,
          landscape: 2,
        }),
      }),
      body(ctx, post.body, {
        size: 34,
        maxLines: lines(ctx, {
          square: 3,
          portrait: 4,
          story: 6,
          landscape: 1,
        }),
      }),
      post.source
        ? body(ctx, `Source: ${post.source}`, {
            size: 26,
            maxLines: 2,
            field: 'source',
          })
        : null,
    ];
  },

  async list(ctx) {
    const { post, theme, s, contentWidth } = ctx;
    const maxItems = lines(ctx, {
      square: 5,
      portrait: 6,
      story: 7,
      landscape: 4,
    });
    if (post.items.length > maxItems) {
      ctx.warn(`only the first ${maxItems} of ${post.items.length} items fit`);
    }
    const items = post.items.slice(0, maxItems);
    const itemSize = Math.round(
      (items.length > 5 ? 36 : 40) * s * (ctx.format === 'landscape' ? 0.9 : 1)
    );
    const marker = Math.round(itemSize * 1.5);
    const numbered = post.numbered !== false;
    const textWidth = contentWidth - marker - Math.round(24 * s);
    items.forEach((item, i) => {
      if (countLines(item, itemSize, textWidth, 400) > 2) {
        ctx.warn(`item ${i + 1} is too long for 2 lines; it will be cut short`);
      }
    });

    return [
      await kicker(ctx),
      headline(ctx, {
        max: Math.round(80 * s),
        min: Math.round(52 * s),
        maxLines: lines(ctx, {
          square: 3,
          portrait: 3,
          story: 4,
          landscape: 2,
        }),
      }),
      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          gap: Math.round((ctx.format === 'landscape' ? 14 : 24) * s),
          marginTop: Math.round(8 * s),
        },
        items.map((item, i) =>
          h(
            'div',
            {
              display: 'flex',
              alignItems: 'flex-start',
              gap: Math.round(24 * s),
            },
            [
              h(
                'div',
                {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: marker,
                  height: marker,
                  borderRadius: marker,
                  backgroundColor: theme.accent,
                  color: theme.onAccent,
                  fontSize: Math.round(itemSize * 0.8),
                  fontWeight: 700,
                },
                numbered
                  ? String(i + 1)
                  : h('div', {
                      width: marker / 3,
                      height: marker / 3,
                      borderRadius: marker,
                      backgroundColor: theme.onAccent,
                    })
              ),
              clamp(
                {
                  fontSize: itemSize,
                  lineHeight: 1.3,
                  color: theme.text,
                  width: textWidth,
                  paddingTop: Math.round((marker - itemSize * 1.3) / 2),
                },
                2,
                item
              ),
            ]
          )
        )
      ),
    ];
  },

  async event(ctx) {
    const { post, theme, s } = ctx;
    const size = Math.round(38 * s * (ctx.format === 'landscape' ? 0.9 : 1));
    const rows = [
      ['Calendar', post.date],
      ['Clock', post.time],
      ['MapPin', post.venue],
    ].filter(([, value]) => value);
    return [
      await kicker(ctx),
      headline(ctx, {
        max: Math.round(88 * s),
        min: Math.round(56 * s),
        maxLines: lines(ctx, {
          square: 3,
          portrait: 4,
          story: 5,
          landscape: 2,
        }),
      }),
      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          gap: Math.round(18 * s),
          borderLeft: `${Math.round(8 * s)}px solid ${theme.accent}`,
          paddingLeft: Math.round(28 * s),
        },
        await Promise.all(
          rows.map(async ([icon, value]) =>
            h(
              'div',
              {
                display: 'flex',
                alignItems: 'center',
                gap: Math.round(20 * s),
                fontSize: size,
                fontWeight: 700,
                color: theme.text,
              },
              [
                img(await lucideIcon(icon, theme.highlight), size, size, {
                  flexShrink: 0,
                }),
                clamp({ lineHeight: 1.25 }, 2, value),
              ]
            )
          )
        )
      ),
      body(ctx, post.body, {
        size: 34,
        maxLines: lines(ctx, {
          square: 2,
          portrait: 3,
          story: 5,
          landscape: 1,
        }),
      }),
      await cta(ctx),
    ];
  },
};

// ---------------------------------------------------------------------------
// The frame: background, sun, header and footer around a template

async function renderPost(post, format, warn) {
  const fmt = FORMATS[format];
  const theme = THEMES[post.theme || 'blue'];
  const s = fmt.scale;
  const [top, right, bottom, left] = fmt.pad;
  const ctx = {
    post,
    format,
    theme,
    s,
    contentWidth: fmt.width - left - right,
    warn: message => warn(`${format}: ${message}`),
  };
  const middle = (await templates[post.template](ctx)).filter(Boolean);
  const logoHeight = Math.round(76 * s);
  const sunSize = Math.round(fmt.width * 0.58);

  const background = theme.background.startsWith('linear-gradient')
    ? { backgroundImage: theme.background }
    : { backgroundColor: theme.background };

  const element = h(
    'div',
    {
      width: fmt.width,
      height: fmt.height,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: `${top}px ${right}px ${bottom}px ${left}px`,
      color: theme.text,
      fontFamily: 'Arimo',
      position: 'relative',
      ...background,
    },
    [
      theme.strip
        ? h('div', {
            position: 'absolute',
            left: 0,
            top: 0,
            width: fmt.width,
            height: Math.round(18 * s),
            backgroundColor: theme.strip,
          })
        : null,
      img(sun(theme.sun), sunSize, sunSize, {
        position: 'absolute',
        right: -Math.round(sunSize * 0.25),
        top: format === 'story' ? 120 : -Math.round(sunSize * 0.1),
        opacity: theme.sunOpacity,
      }),
      h('div', { display: 'flex', alignItems: 'center', gap: 20 * s }, [
        img(
          logo(theme.logo, logoHeight * 2),
          Math.round(logoHeight * LOGO_ASPECT),
          logoHeight
        ),
        h('div', { fontSize: Math.round(36 * s), fontWeight: 700 }, SITE_NAME),
      ]),
      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          gap: Math.round((format === 'landscape' ? 20 : 32) * s),
          paddingTop: Math.round(32 * s),
          paddingBottom: Math.round(32 * s),
        },
        middle
      ),
      h('div', { display: 'flex', alignItems: 'center', gap: 20 * s }, [
        h('div', {
          width: Math.round(96 * s),
          height: Math.round(8 * s),
          backgroundColor: theme.accent,
          flexShrink: 0,
        }),
        h(
          'div',
          { fontSize: Math.round(28 * s), color: theme.faint },
          footerLink(
            ctx,
            Math.round(28 * s),
            ctx.contentWidth - Math.round(116 * s)
          )
        ),
      ]),
    ]
  );
  return renderPng(element, fmt.width, fmt.height);
}

// ---------------------------------------------------------------------------
// Spec, caption file, CLI

function validate(post, index) {
  const name = post.slug || `post ${index + 1}`;
  const errors = [];
  if (!post.slug || !/^[a-z0-9-]+$/.test(post.slug)) {
    errors.push('needs a slug of lowercase letters, numbers and hyphens');
  }
  const template = TEMPLATES[post.template];
  if (!template) {
    errors.push(
      `template must be one of: ${Object.keys(TEMPLATES).join(', ')}`
    );
  } else {
    for (const field of template.required) {
      if (!post[field] || (Array.isArray(post[field]) && !post[field].length)) {
        errors.push(`the ${post.template} template needs "${field}"`);
      }
    }
  }
  if (post.theme && !THEMES[post.theme]) {
    errors.push(`theme must be one of: ${Object.keys(THEMES).join(', ')}`);
  }
  for (const format of post.formats || []) {
    if (!FORMATS[format]) {
      errors.push(
        `unknown format "${format}"; use ${Object.keys(FORMATS).join(', ')}`
      );
    }
  }
  if (!post.alt) errors.push('needs alt text ("alt") for screen reader users');
  return errors.map(error => `${name}: ${error}`);
}

function postFile(post, files) {
  const link = post.url
    ? post.url.startsWith('/')
      ? `${siteUrl()}${post.url}`
      : post.url
    : null;
  return [
    `# ${post.headline}`,
    '',
    '## Caption',
    '',
    (post.caption || '').trim() || '_No caption in the spec._',
    ...(post.hashtags?.length
      ? ['', post.hashtags.map(t => `#${t.replace(/^#/, '')}`).join(' ')]
      : []),
    ...(link ? ['', '## Link', '', link] : []),
    '',
    '## Alt text',
    '',
    post.alt.trim(),
    '',
    '## Images',
    '',
    ...files.map(
      ({ format, file }) =>
        `- \`${file}\`: ${FORMATS[format].width}×${FORMATS[format].height}, ${FORMATS[format].use}`
    ),
    '',
  ].join('\n');
}

function parseArgs(argv) {
  const args = { out: path.join(rootDir, 'out/social'), specs: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = path.resolve(argv[++i]);
    else if (argv[i] === '--formats') args.formats = argv[++i].split(',');
    else args.specs.push(argv[i]);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.specs.length) {
    console.error(
      'Usage: npm run social -- <spec.yaml> [--out dir] [--formats square,story]'
    );
    console.error(`Formats: ${Object.keys(FORMATS).join(', ')}`);
    process.exit(1);
  }

  const posts = args.specs.flatMap(spec => {
    const data = yaml.load(fs.readFileSync(spec, 'utf8'));
    return data.posts || [data];
  });
  const errors = posts.flatMap(validate);
  if (errors.length) {
    console.error(errors.map(e => `❌ ${e}`).join('\n'));
    process.exit(1);
  }

  let warnings = 0;
  for (const post of posts) {
    const dir = path.join(args.out, post.slug);
    fs.mkdirSync(dir, { recursive: true });
    const warn = message => {
      warnings++;
      console.warn(`⚠️  ${post.slug} ${message}`);
    };
    const files = [];
    for (const format of args.formats || post.formats || DEFAULT_FORMATS) {
      if (!FORMATS[format]) throw new Error(`Unknown format "${format}"`);
      const file = path.join(dir, `${format}.png`);
      fs.writeFileSync(file, await renderPost(post, format, warn));
      const relative = path.relative(rootDir, file);
      files.push({
        format,
        file: relative.startsWith('..') ? file : relative,
      });
    }
    fs.writeFileSync(path.join(dir, 'post.md'), postFile(post, files));
    console.log(`✅ ${post.slug}: ${files.map(f => f.file).join(', ')}`);
  }
  if (warnings) console.warn(`${warnings} warning(s) above`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
