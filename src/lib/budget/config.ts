/**
 * What the FY 2027 budget projects section lists, and why. Adapted from the
 * configuration contract of github.com/bettergovph/transparency-portal.
 *
 * Lapu-Lapu City's DPWH office (Cebu 6th District Engineering Office) also
 * serves Mandaue City and Cebu's 6th district, so the office's whole ledger
 * is not brought in: that would list other places' projects as the City's.
 * Projects are found by title instead, and the office is shown whole (never
 * split) on its card, with a link to all of its lines.
 */

/** The four programs the FY 2027 House bill lists project by project. */
export type DatasetKey = 'dpwh' | 'fmr' | 'hfep' | 'nia';
export const DATASET_KEYS: readonly DatasetKey[] = [
  'dpwh',
  'fmr',
  'hfep',
  'nia',
];

/** A place whose name, in a project's title, brings the project in. */
export interface PlaceQuery {
  /** What readers see. */
  label: string;
  /** The API search: every word must appear. Defaults to `label`. */
  q?: string;
  /** A region key ("VII") to keep a common name to one region. */
  region?: string;
  /** Programs to search. Defaults to all four. */
  datasets?: DatasetKey[];
}

/** A line removed by hand. Every exclusion is published on the About page. */
export interface Exclusion {
  /** `<dataset>:<id>`, e.g. "dpwh:house-reading:848". */
  key: string;
  /** Why, in a sentence a reader can check. */
  reason: string;
}

export interface PortalConfig {
  id: string;
  name: string;
  shortName: string;
  scope: {
    /** DPWH offices, named exactly as the documents publish them. */
    offices?: string[];
    places?: PlaceQuery[];
    /** Legislative districts to show cards for: "leg:lapu-lapu-city:lone". */
    districts?: string[];
    exclude?: Exclusion[];
  };
}

export const portalConfig: PortalConfig = {
  id: 'lapu-lapu-city',
  name: 'Lapu-Lapu City',
  shortName: 'Lapu-Lapu City',
  scope: {
    // "Lapu Lapu" (both words) also matches "Lapu-Lapu" and "Lapu- Lapu".
    places: [{ label: 'Lapu-Lapu', q: 'Lapu Lapu', region: 'VII' }],
    districts: ['leg:lapu-lapu-city:lone'],
    exclude: [
      {
        key: 'dpwh:house-reading:539',
        reason:
          'Camp Lapu-Lapu Road is a road in Cebu City, maintained by the Cebu City District Engineering Office.',
      },
      {
        key: 'dpwh:house-reading:1174',
        reason:
          'Lapu-Lapu Street is a street in Cebu City, maintained by the Cebu City District Engineering Office.',
      },
    ],
  },
};

export const DEFAULT_API = 'https://budget.bettergov.ph';
export const API_BASE = (
  import.meta.env.VITE_BUDGET_API_BASE || DEFAULT_API
).replace(/\/+$/, '');

/** Where the open-source portal this section is built on lives. */
export const SOURCE_CODE_URL =
  'https://github.com/bettergovph/transparency-portal';
/** The national FY 2027 House bill section on budget.bettergov.ph. */
export const NATIONAL_URL = 'https://budget.bettergov.ph/hgab/2027/overview';

export const BUDGET_PATH = '/government/budget-projects';
export const BUDGET_TITLE = 'FY 2027 Budget Projects';
export const BUDGET_DESCRIPTION =
  'Every project in the proposed FY 2027 national budget whose title names Lapu-Lapu City, in the NEP and the House bill (House Bill 10858), which are not yet law: amounts, status and the source page for each.';

export const projectPath = (dataset: string, id: string) =>
  `${BUDGET_PATH}/projects/${dataset}/${encodeURIComponent(id)}`;
