/**
 * The BetterLapuLapu look for generated images, shared by the link preview
 * images (build-og.js) and the social media graphics (build-social.js):
 * colours, the Arimo font, the white logo, the flag sun, and rendering a
 * satori element tree to PNG.
 */

import fs from 'fs';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { rootDir } from './content.js';

export const SITE_NAME = 'BetterLapuLapu';

/** Brand colours, matching the tokens in src/index.css */
export const colors = {
  primary50: '#e6f0fd',
  primary100: '#cce0fb',
  primary200: '#99c2f7',
  primary500: '#0066eb',
  primary600: '#0052bc',
  primary700: '#003d8d',
  primary800: '#00295e',
  primary900: '#00142f',
  ink: '#0b0c0c',
  inkSecondary: '#505a5f',
  surface: '#f3f2f1',
  white: '#ffffff',
  // The sun yellow from the logo
  sun: '#f2c91d',
  alert: '#d4351c',
  alertDark: '#942514',
  go: '#00703c',
};

/** The blue diagonal behind every share image */
export const BLUE_GRADIENT = `linear-gradient(135deg, ${colors.primary600} 0%, ${colors.primary700} 100%)`;

const font = (name, subset, weight) => ({
  name,
  data: fs.readFileSync(
    path.join(
      rootDir,
      `node_modules/@fontsource/arimo/files/arimo-${subset}-${weight}-normal.woff`
    )
  ),
  weight,
  style: 'normal',
});

// Satori takes a glyph from the first font with the family name it's after,
// so latin-ext, which has the peso sign (₱), is a family of its own that
// satori falls back to
export const fonts = [400, 700].flatMap(weight => [
  font('Arimo', 'latin', weight),
  font('Arimo Ext', 'latin-ext', weight),
]);

const svgToPng = (svg, fitTo) =>
  new Resvg(svg, { fitTo, font: { loadSystemFonts: false } }).render().asPng();

const dataUrl = (type, data) =>
  `data:${type};base64,${Buffer.from(data).toString('base64')}`;

/** Width ÷ height of the logo, from the viewBox of public/logo.svg */
export const LOGO_ASPECT = (() => {
  const svg = fs.readFileSync(path.join(rootDir, 'public/logo.svg'), 'utf8');
  const [, , w, hgt] = svg
    .match(/viewBox="([^"]+)"/)[1]
    .split(/\s+/)
    .map(Number);
  return w / hgt;
})();

/** A logo from public/, rasterised to a PNG data URL at the given height */
export function logo(variant = 'white', height = 160) {
  const file = variant === 'white' ? 'logo-white.svg' : 'logo.svg';
  const svg = fs.readFileSync(path.join(rootDir, 'public', file), 'utf8');
  return dataUrl('image/png', svgToPng(svg, { mode: 'height', value: height }));
}

/** The eight-rayed sun from the flag, as an SVG data URL */
export function sun(color = colors.white) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const point = (r, da) =>
      `${(300 + r * Math.cos(a + da)).toFixed(1)},${(300 + r * Math.sin(a + da)).toFixed(1)}`;
    return `<polygon points="${point(300, 0)} ${point(130, 0.2)} ${point(130, -0.2)}"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" fill="${color}">${rays}<circle cx="300" cy="300" r="115"/></svg>`;
  return dataUrl('image/svg+xml', svg);
}

/** A satori element: h('div', { ...style }, children) */
export const h = (type, style, children) => ({
  type,
  props: { style, children },
});

/** An <img> element for satori */
export const img = (src, width, height, style = {}) => ({
  type: 'img',
  props: { src, width, height, style: { width, height, ...style } },
});

/** Renders a satori element tree to a PNG buffer */
export async function renderPng(element, width, height) {
  const svg = await satori(element, { width, height, fonts });
  // Satori draws text as paths, so resvg needs no fonts of its own
  return svgToPng(svg, { mode: 'width', value: width });
}
