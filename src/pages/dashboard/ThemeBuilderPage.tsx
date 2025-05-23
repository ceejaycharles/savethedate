import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ThemeSelector } from '../../components/customization/ThemeSelector';
import { themes, Theme } from '../../lib/themes';
import { supabase } from '../../lib/supabase';
import { Palette, Save, Undo } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ThemeBuilderPage() {
  const { eventId } = useParams();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [customColors, setCustomColors] = useState({
    primary: selectedTheme.colors.primary,
    secondary: selectedTheme.colors.secondary,
    accent: selectedTheme.colors.accent,
    background: selectedTheme.colors.background,
    text: selectedTheme.colors.text,
  });
  const [saving, setSaving] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setSelectedTheme(theme);
      setCustomColors(theme.colors);
    }
  };

  const handleColorChange = (key: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!eventId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          theme_id: selectedTheme.id,
          theme_colors: customColors
        })
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Theme saved successfully');
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCustomColors(selectedTheme.colors);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Theme Builder</h1>
          <p className="text-gray-600 mt-1">Customize your event's appearance</p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <Undo className="w-4 h-4 mr-2" />
            Reset Changes
          </Button>
          <Button
            onClick={handleSave}
            isLoading={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Theme Templates</h2>
              <ThemeSelector
                currentTheme={selectedTheme.id}
                onSelect={handleThemeSelect}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Color Customization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-12 h-12 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-12 h-12 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-12 h-12 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-12 h-12 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={customColors.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-12 h-12 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div 
                className="p-6 rounded-lg"
                style={{ backgroundColor: customColors.background }}
              >
                <h3 
                  className="text-2xl font-serif mb-4"
                  style={{ color: customColors.text }}
                >
                  Sample Heading
                </h3>
                <p
                  className="mb-4"
                  style={{ color: customColors.text }}
                >
                  This is how your text will look with the selected colors.
                </p>
                <div className="space-y-2">
                  <Button
                    style={{
                      backgroundColor: customColors.primary,
                      color: customColors.background
                    }}
                  >
                    Primary Button
                  </Button>
                  <Button
                    style={{
                      backgroundColor: customColors.secondary,
                      color: customColors.background
                    }}
                  >
                    Secondary Button
                  </Button>
                  <Button
                    style={{
                      backgroundColor: customColors.accent,
                      color: customColors.background
                    }}
                  >
                    Accent Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}