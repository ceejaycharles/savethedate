import { supabase } from './supabase';

let translations: Record<string, string> = {};

export async function initializeTranslations() {
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  const storedTranslations = localStorage.getItem('translations');

  if (storedTranslations) {
    translations = JSON.parse(storedTranslations);
  } else {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language_id', selectedLanguage);

      if (error) throw error;

      translations = data?.reduce((acc, { key, value }) => ({
        ...acc,
        [key]: value
      }), {});

      localStorage.setItem('translations', JSON.stringify(translations));
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }
}

export function translate(key: string, params: Record<string, string> = {}): string {
  let translation = translations[key] || key;

  // Replace parameters in translation string
  Object.entries(params).forEach(([param, value]) => {
    translation = translation.replace(`{${param}}`, value);
  });

  return translation;
}

export function getSelectedLanguage(): string {
  return localStorage.getItem('selectedLanguage') || 'en';
}