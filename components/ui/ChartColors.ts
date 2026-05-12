/* eslint-disable max-len */

export const CHART_COLOR_TOKENS = {
  primary: [
    { base: '#00BFA6', gradient: '#66D9CA' },
    { base: '#F2C644', gradient: '#F7DD8F' },
    { base: '#FF7800', gradient: '#FFAE66' },
  ],
  secondary: [
    { base: '#2380D3', gradient: '#7BB3E5' },
    { base: '#DD4014', gradient: '#EB8C72' },
  ],
  others: [
    { base: '#AE1AF8', gradient: '#CE76FB' },
    { base: '#F10091', gradient: '#F766BD' },
    { base: '#00A944', gradient: '#66CB8F' },
    { base: '#11698C', gradient: '#70A5BA' },
    { base: '#BE8B22', gradient: '#D8B97A' },
  ],
} as const;

/** ⭐ PUBLIC ORDERED PALETTE (use this everywhere) */
export const CHART_ORDERED_PALETTE = [
  ...CHART_COLOR_TOKENS.primary,
  ...CHART_COLOR_TOKENS.secondary,
  ...CHART_COLOR_TOKENS.others,
];

/** ⭐ Solid colors for line/pie */
export const CHART_ORDERED_SOLID = CHART_ORDERED_PALETTE.map(
  (c) => c.base,
);

/** ⭐ helper (recommended) */
export const getChartColor = (index: number) => CHART_ORDERED_SOLID[index % CHART_ORDERED_SOLID.length];
