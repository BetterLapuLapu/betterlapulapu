import yaml from 'js-yaml';

// Type definitions for the services data
export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
  // Slug of the index's group this page is listed under, if any
  group?: string;
}

// A heading that pages in an index can be grouped under (e.g. hospitals)
export interface IndexGroup {
  slug: string;
  name: string;
}

export interface Category {
  category: string;
  slug: string;
  description: string;
  // Shorter description for the home page grid; falls back to `description`
  summary?: string;
  icon: string;
  subcategories?: Subcategory[]; // Keep for backward compatibility
}

export interface CategoryData {
  categories: Category[];
  description: string;
}

export interface CategoryIndexData {
  title?: string;
  description?: string;
  layout?: 'grid' | 'list';
  groups?: IndexGroup[];
  pages: Subcategory[];
}

// Import the YAML file as raw text
import servicesYamlContent from './services.yaml?raw';
import governmentActivitiesYamlContent from './government.yaml?raw';

// Import all category index files statically
import healthServicesIndex from '../../content/services/health-services/index.yaml?raw';
import educationIndex from '../../content/services/education/index.yaml?raw';
import businessIndex from '../../content/services/business/index.yaml?raw';
import socialWelfareIndex from '../../content/services/social-welfare/index.yaml?raw';
import agricultureFisheriesIndex from '../../content/services/agriculture-fisheries/index.yaml?raw';
import infrastructurePublicWorksIndex from '../../content/services/infrastructure-public-works/index.yaml?raw';
import garbageWasteDisposalIndex from '../../content/services/garbage-waste-disposal/index.yaml?raw';
import environmentIndex from '../../content/services/environment/index.yaml?raw';
import disasterPreparednessIndex from '../../content/services/disaster-preparedness/index.yaml?raw';
import housingLandUseIndex from '../../content/services/housing-land-use/index.yaml?raw';
import governmentDepartmentsIndex from '../../content/government/departments/index.yaml?raw';
import governmentDepartmentsLegislativeIndex from '../../content/government/departments/legislative/index.yaml?raw';

// Create a mapping of category slugs to their YAML content
const categoryIndexMap: { [key: string]: string } = {
  'health-services': healthServicesIndex,
  education: educationIndex,
  business: businessIndex,
  'social-welfare': socialWelfareIndex,
  'agriculture-fisheries': agricultureFisheriesIndex,
  'infrastructure-public-works': infrastructurePublicWorksIndex,
  'garbage-waste-disposal': garbageWasteDisposalIndex,
  environment: environmentIndex,
  'disaster-preparedness': disasterPreparednessIndex,
  'housing-land-use': housingLandUseIndex,
  departments: governmentDepartmentsIndex,
  legislative: governmentDepartmentsLegislativeIndex,
};

// Parse the YAML content
export const serviceCategories: CategoryData = yaml.load(
  servicesYamlContent
) as CategoryData;

export const governmentCategories: CategoryData = yaml.load(
  governmentActivitiesYamlContent
) as CategoryData;

// Translations live in sparse overlay files next to the English YAML, e.g.
// services.ceb.yaml or content/services/business/index.ceb.yaml. Entries are
// matched by slug (or `en_name` for pages without one) and any field the
// overlay omits falls back to English.
interface CategoryOverlay {
  slug: string;
  category?: string;
  description?: string;
  summary?: string;
  subcategories?: { slug: string; name?: string }[];
}

interface PageOverlay {
  slug?: string;
  en_name?: string;
  name?: string;
  description?: string;
}

interface CategoryIndexOverlay {
  title?: string;
  description?: string;
  groups?: { slug: string; name?: string }[];
  pages?: PageOverlay[];
}

const categoryOverlayFiles = import.meta.glob<string>('./*.*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Keyed by `${lang}:${folder}`, e.g. `ceb:business`.
const indexOverlayLoaders: Record<string, () => Promise<string>> = {};
for (const [path, load] of Object.entries(
  import.meta.glob<string>('../../content/**/index.*.yaml', {
    query: '?raw',
    import: 'default',
  })
)) {
  const match = path.match(/\/([^/]+)\/index\.([^.]+)\.yaml$/);
  if (match) indexOverlayLoaders[`${match[2]}:${match[1]}`] = load;
}

const pageKey = (page: { slug?: string; name?: string }) =>
  page.slug || page.name;

function mergeBySlug<T extends { slug?: string; name?: string }, O>(
  base: T[],
  overlay: O[] | undefined,
  keyOf: (entry: O) => string | undefined,
  merge: (entry: T, translated: O) => T
): T[] {
  if (!overlay?.length) return base;
  const byKey = new Map(overlay.map(entry => [keyOf(entry), entry]));
  return base.map(entry => {
    const translated = byKey.get(pageKey(entry));
    return translated ? merge(entry, translated) : entry;
  });
}

const localizedCategories = new Map<string, CategoryData>();

/** Service or government categories with the overlay for `lang` applied. */
export function getCategories(
  kind: 'services' | 'government',
  lang: string
): CategoryData {
  const base = kind === 'services' ? serviceCategories : governmentCategories;
  const raw = categoryOverlayFiles[`./${kind}.${lang}.yaml`];
  if (!raw) return base;

  const cacheKey = `${lang}:${kind}`;
  const cached = localizedCategories.get(cacheKey);
  if (cached) return cached;

  const overlay = yaml.load(raw) as { categories?: CategoryOverlay[] };
  const result: CategoryData = {
    ...base,
    categories: mergeBySlug(
      base.categories,
      overlay.categories,
      entry => entry.slug,
      (category, translated) => ({
        ...category,
        category: translated.category || category.category,
        description: translated.description || category.description,
        summary: translated.summary || category.summary,
        subcategories:
          category.subcategories &&
          mergeBySlug(
            category.subcategories,
            translated.subcategories,
            entry => entry.slug,
            (sub, t) => ({ ...sub, name: t.name || sub.name })
          ),
      })
    ),
  };
  localizedCategories.set(cacheKey, result);
  return result;
}

export interface CategoryIndex {
  title?: string;
  description?: string;
  layout: 'grid' | 'list';
  groups?: IndexGroup[];
  pages: Subcategory[];
}

async function loadIndexOverlay(
  categorySlug: string,
  lang: string
): Promise<CategoryIndexOverlay | null> {
  const load = indexOverlayLoaders[`${lang}:${categorySlug}`];
  if (!load) return null;
  try {
    return yaml.load(await load()) as CategoryIndexOverlay;
  } catch (error) {
    console.warn(`Failed to load ${lang} overlay for ${categorySlug}:`, error);
    return null;
  }
}

// Function to load category index data
export async function loadCategoryIndex(
  categorySlug: string,
  lang = 'en'
): Promise<CategoryIndex> {
  const yamlContent = categoryIndexMap[categorySlug];
  if (!yamlContent) {
    return { layout: 'list', pages: [] };
  }
  try {
    const indexData: CategoryIndexData = yaml.load(
      yamlContent
    ) as CategoryIndexData;
    const overlay = await loadIndexOverlay(categorySlug, lang);
    return {
      title: overlay?.title || indexData.title,
      description: overlay?.description || indexData.description,
      layout: indexData.layout ?? 'list',
      groups:
        indexData.groups &&
        mergeBySlug(
          indexData.groups,
          overlay?.groups,
          entry => entry.slug,
          (group, translated) => ({
            ...group,
            name: translated.name || group.name,
          })
        ),
      pages: mergeBySlug(
        indexData.pages || [],
        overlay?.pages,
        entry => entry.slug || entry.en_name,
        (page, translated) => ({
          ...page,
          name: translated.name || page.name,
          description: translated.description || page.description,
        })
      ),
    };
  } catch (parseError) {
    console.warn(
      `Failed to parse YAML content for category ${categorySlug}:`,
      parseError
    );
    return { layout: 'list', pages: [] };
  }
}

// Function to get subcategories for a category (with caching)
const categoryCache = new Map<string, CategoryIndex>();

export async function getCategorySubcategories(
  categorySlug: string,
  lang = 'en'
): Promise<CategoryIndex> {
  const cacheKey = `${lang}:${categorySlug}`;
  if (categoryCache.has(cacheKey)) {
    return categoryCache.get(cacheKey)!;
  }

  const result = await loadCategoryIndex(categorySlug, lang);
  categoryCache.set(cacheKey, result);
  return result;
}

/** Returns true if a slug has a registered index in categoryIndexMap */
export function isNestedCategory(slug: string): boolean {
  return slug in categoryIndexMap;
}
