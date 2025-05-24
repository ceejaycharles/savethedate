import React from 'react';
import { Check } from 'lucide-react';
import { themes, Theme } from '../../lib/themes';
import { Card } from '../ui/Card';

interface ThemeSelectorProps {
  currentTheme: string;
  onSelect: (themeId: string) => void;
}

export function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {themes.map((theme) => (
        <Card
          key={theme.id}
          className={`cursor-pointer p-4 ${
            currentTheme === theme.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelect(theme.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{theme.name}</h3>
            {currentTheme === theme.id && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex space-x-2">
              {Object.values(theme.colors).map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="text-sm text-gray-500">
              <p style={{ fontFamily: theme.fonts.heading }}>
                Heading Font
              </p>
              <p style={{ fontFamily: theme.fonts.body }}>
                Body Font
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default ThemeSelector;