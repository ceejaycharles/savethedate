import { supabase } from './supabase';

let translations = {};
let currentLanguage = 'en';

export async function loadTranslations(languageId: string) {
  const { data, error } = await supabase
    .from('translations')
    .select('key, value')
    .eq('language_id', languageId);

  if (error) throw error;

  translations = data.reduce((acc, { key, value }) => ({
    ...acc,
    [key]: value
  }), {});

  currentLanguage = languageId;
}

export function translate(key: string, variables: Record<string, string> = {}) {
  let text = translations[key] || key;

  Object.entries(variables).forEach(([name, value]) => {
    text = text.replace(`{{${name}}}`, value);
  });

  return text;
}

export async function getSupportedLanguages() {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data;
}