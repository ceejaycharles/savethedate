import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { LanguageSelector } from '../customization/LanguageSelector';

export function LanguageSettings() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Language Settings</h2>
        <p className="text-gray-600 mb-6">
          Choose your preferred language for the application interface.
        </p>
        <LanguageSelector />
      </CardContent>
    </Card>
  );
}