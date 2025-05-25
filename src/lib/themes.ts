import { type Theme } from '../lib/database.types'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  heading: string
}

export interface ThemeFonts {
  heading: string
  body: string
}

export const defaultThemeColors: ThemeColors = {
  primary: '#4F46E5',
  secondary: '#10B981',
  accent: '#F59E0B',
  background: '#FFFFFF',
  text: '#1F2937',
  heading: '#111827'
}

export const defaultThemeFonts: ThemeFonts = {
  heading: 'serif',
  body: 'sans-serif'
}

export const themes: Theme[] = [
  {
    id: 'elegant',
    name: 'Elegant',
    colors: {
      primary: '#2D3748',
      secondary: '#718096',
      accent: '#E2E8F0',
      background: '#FFFFFF',
      text: '#1A202C',
      heading: '#2D3748'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Lato, sans-serif'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD',
      background: '#F8FAFC',
      text: '#334155',
      heading: '#1E3A8A'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    }
  },
  {
    id: 'romantic',
    name: 'Romantic',
    colors: {
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#FDF2F8',
      background: '#FFFFFF',
      text: '#831843',
      heading: '#BE185D'
    },
    fonts: {
      heading: 'Dancing Script, cursive',
      body: 'Quicksand, sans-serif'
    }
  },
  {
    id: 'rustic',
    name: 'Rustic',
    colors: {
      primary: '#92400E',
      secondary: '#B45309',
      accent: '#FDE68A',
      background: '#FFFBEB',
      text: '#78350F',
      heading: '#92400E'
    },
    fonts: {
      heading: 'Bitter, serif',
      body: 'Source Sans Pro, sans-serif'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#18181B',
      secondary: '#27272A',
      accent: '#52525B',
      background: '#FAFAFA',
      text: '#18181B',
      heading: '#09090B'
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif'
    }
  }
]

export const getThemeById = (id: string): Theme => {
  return themes.find(theme => theme.id === id) || themes[0]
}

export const getThemeColors = (themeId: string, customColors?: Partial<ThemeColors>): ThemeColors => {
  const baseTheme = getThemeById(themeId)
  return {
    ...defaultThemeColors,
    ...baseTheme.colors,
    ...customColors
  }
}

export const getThemeFonts = (themeId: string, customFonts?: Partial<ThemeFonts>): ThemeFonts => {
  const baseTheme = getThemeById(themeId)
  return {
    ...defaultThemeFonts,
    ...baseTheme.fonts,
    ...customFonts
  }
}