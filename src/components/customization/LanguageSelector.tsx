import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Language {
  id: string;
  name: string;
  native_name: string;
  active: boolean;
}

export function LanguageSelector() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (languageId: string) => {
    try {
      setSelectedLanguage(languageId);
      
      // Fetch translations for the selected language
      const { data: translations, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language_id', languageId);

      if (error) throw error;

      // Update the app's translations
      const translationMap = translations?.reduce((acc, { key, value }) => ({
        ...acc,
        [key]: value
      }), {});

      // Store selected language and translations
      localStorage.setItem('selectedLanguage', languageId);
      localStorage.setItem('translations', JSON.stringify(translationMap));

      // Reload the page to apply translations
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-12">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium">Select Language</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((language) => (
            <Button
              key={language.id}
              variant={selectedLanguage === language.id ? 'primary' : 'outline'}
              size="sm"
              className="justify-start"
              onClick={() => handleLanguageChange(language.id)}
            >
              <span className="truncate">{language.native_name}</span>
              <span className="text-xs text-gray-500 ml-1">({language.name})</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}