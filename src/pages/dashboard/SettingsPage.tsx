import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { LanguageSettings } from '../../components/settings/LanguageSettings';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">Settings</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <LanguageSettings />

        {/* Theme Settings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
            <p className="text-gray-600">
              Customize the appearance of your dashboard and event pages.
            </p>
            {/* Add theme settings controls here */}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
            <p className="text-gray-600">
              Control how and when you receive notifications about your events.
            </p>
            {/* Add notification settings controls here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}