import type { VibeBuilderSite, VibeBuilderThemeConfig } from '@/modules/vibe-builder';

export interface VibeBuilderThemePreset {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  headingScale: number;
  bodyScale: number;
  pageBackground: string;
  surfaceBackground: string;
  heroBackground: string;
  accentColor: string;
  textColor: string;
  mutedTextColor: string;
}

export const vibeBuilderThemePresets: VibeBuilderThemePreset[] = [
  {
    id: 'simple',
    name: 'Simple',
    headingFont: 'system-ui, sans-serif',
    bodyFont: '"Nunito Sans", system-ui, sans-serif',
    headingScale: 1,
    bodyScale: 1,
    pageBackground: '#f8fafc',
    surfaceBackground: '#ffffff',
    heroBackground: '#37474f',
    accentColor: '#0ea5a4',
    textColor: '#0f172a',
    mutedTextColor: '#64748b',
  },
  {
    id: 'aristotle',
    name: 'Aristotle',
    headingFont: 'Georgia, "Times New Roman", serif',
    bodyFont: 'Georgia, "Times New Roman", serif',
    headingScale: 1,
    bodyScale: 1,
    pageBackground: '#f8f5ef',
    surfaceBackground: '#fffdf8',
    heroBackground: '#2f2a1f',
    accentColor: '#c59a3d',
    textColor: '#231f18',
    mutedTextColor: '#6b6257',
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    headingFont: '"Times New Roman", Georgia, serif',
    bodyFont: '"Nunito Sans", system-ui, sans-serif',
    headingScale: 1,
    bodyScale: 1,
    pageBackground: '#f5f2ec',
    surfaceBackground: '#ffffff',
    heroBackground: '#e7e0d4',
    accentColor: '#1f2937',
    textColor: '#111827',
    mutedTextColor: '#6b7280',
  },
  {
    id: 'vision',
    name: 'Vision',
    headingFont: '"Trebuchet MS", "Segoe UI", sans-serif',
    bodyFont: '"Nunito Sans", system-ui, sans-serif',
    headingScale: 1,
    bodyScale: 1,
    pageBackground: '#f3f6ff',
    surfaceBackground: '#ffffff',
    heroBackground: '#edf2ff',
    accentColor: '#4f6df5',
    textColor: '#1f2937',
    mutedTextColor: '#64748b',
  },
  {
    id: 'level',
    name: 'Level',
    headingFont: 'system-ui, sans-serif',
    bodyFont: '"Nunito Sans", system-ui, sans-serif',
    headingScale: 1,
    bodyScale: 1,
    pageBackground: '#211f28',
    surfaceBackground: '#2b2934',
    heroBackground: '#3a3545',
    accentColor: '#f3c14a',
    textColor: '#f8fafc',
    mutedTextColor: '#d1d5db',
  },
  {
    id: 'impression',
    name: 'Impression',
    headingFont: 'Arial, Helvetica, sans-serif',
    bodyFont: '"Nunito Sans", system-ui, sans-serif',
    headingScale: 1,
    bodyScale: 1,
    pageBackground: '#ffffff',
    surfaceBackground: '#ffffff',
    heroBackground: '#ffffff',
    accentColor: '#ef4444',
    textColor: '#111827',
    mutedTextColor: '#6b7280',
  },
];

export const defaultVibeBuilderTheme = vibeBuilderThemePresets[0];

export const vibeBuilderTypographyOptions = [
  {
    id: 'preset',
    label: 'Use preset font',
    headingValue: '',
    bodyValue: '',
  },
  {
    id: 'modern-sans',
    label: 'Modern Sans',
    headingValue: 'Inter, "Segoe UI", Arial, sans-serif',
    bodyValue: 'Inter, "Segoe UI", Arial, sans-serif',
  },
  {
    id: 'editorial-serif',
    label: 'Editorial Serif',
    headingValue: 'Georgia, "Times New Roman", serif',
    bodyValue: 'Georgia, "Times New Roman", serif',
  },
  {
    id: 'clean-humanist',
    label: 'Clean Humanist',
    headingValue: '"Trebuchet MS", "Segoe UI", sans-serif',
    bodyValue: '"Nunito Sans", system-ui, sans-serif',
  },
  {
    id: 'classic-mix',
    label: 'Classic Mix',
    headingValue: '"Times New Roman", Georgia, serif',
    bodyValue: 'Arial, Helvetica, sans-serif',
  },
] as const;

export const vibeBuilderTypographyScales = [
  { id: 'compact', label: 'Compact', headingScale: 0.9, bodyScale: 0.95 },
  { id: 'comfortable', label: 'Comfortable', headingScale: 1, bodyScale: 1 },
  { id: 'display', label: 'Display', headingScale: 1.15, bodyScale: 1.05 },
] as const;

export const parseRawThemeConfig = (
  themeConfig: VibeBuilderSite['ThemeConfig']
): VibeBuilderThemeConfig => {
  if (!themeConfig) {
    return {};
  }

  const config = typeof themeConfig === 'string' ? safeJsonParse(themeConfig) : themeConfig;

  return typeof config === 'object' && config ? (config as VibeBuilderThemeConfig) : {};
};

export const parseThemeConfig = (
  themeConfig: VibeBuilderSite['ThemeConfig']
): VibeBuilderThemePreset => {
  const config = parseRawThemeConfig(themeConfig);
  const presetId = typeof config?.presetId === 'string' ? config.presetId : 'simple';
  const preset = vibeBuilderThemePresets.find((item) => item.id === presetId) || defaultVibeBuilderTheme;

  return {
    ...preset,
    headingFont: config.fontHeading || preset.headingFont,
    bodyFont: config.fontBody || preset.bodyFont,
    headingScale: typeof config.headingScale === 'number' ? config.headingScale : preset.headingScale,
    bodyScale: typeof config.bodyScale === 'number' ? config.bodyScale : preset.bodyScale,
  };
};

export const buildThemeConfigPayload = (config: VibeBuilderThemeConfig) => JSON.stringify(config);

const safeJsonParse = (value: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
};
