import { supabase } from './supabase';

export interface EventTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  styles: {
    borderRadius: string;
    spacing: string;
  };
}

export const defaultThemes: EventTheme[] = [
  {
    id: 'elegant',
    name: 'Elegant',
    colors: {
      primary: '#2D3748',
      secondary: '#718096',
      accent: '#F6AD55',
      background: '#FFFFFF',
      text: '#1A202C'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    styles: {
      borderRadius: '0.5rem',
      spacing: '1.5rem'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#3182CE',
      secondary: '#63B3ED',
      accent: '#F687B3',
      background: '#F7FAFC',
      text: '#2D3748'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    styles: {
      borderRadius: '1rem',
      spacing: '2rem'
    }
  },
  {
    id: 'romantic',
    name: 'Romantic',
    colors: {
      primary: '#D53F8C',
      secondary: '#ED64A6',
      accent: '#9F7AEA',
      background: '#FFF5F7',
      text: '#2D3748'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    styles: {
      borderRadius: '0.75rem',
      spacing: '1.75rem'
    }
  }
];

export async function getEventTheme(eventId: string): Promise<EventTheme> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('theme_id')
      .eq('id', eventId)
      .single();

    if (error) throw error;

    return defaultThemes.find(theme => theme.id === data.theme_id) || defaultThemes[0];
  } catch (error) {
    console.error('Error fetching event theme:', error);
    return defaultThemes[0];
  }
}

export async function updateEventTheme(eventId: string, themeId: string) {
  try {
    const { error } = await supabase
      .from('events')
      .update({ theme_id: themeId })
      .eq('id', eventId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating event theme:', error);
    throw error;
  }
}