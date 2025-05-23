import React from 'react';
import { LanguageSettings } from '../../components/settings/LanguageSettings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Customize your application preferences</p>
      </div>

      <div className="space-y-8">
        <LanguageSettings />
      </div>
    </div>
  );
}