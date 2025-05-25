import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Bell, Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    rsvpUpdates: true,
    giftNotifications: true,
    reminderNotifications: true
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('notification_settings')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data?.notification_settings) {
        setSettings(data.notification_settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { error } = await supabase
        .from('users')
        .update({ notification_settings: newSettings })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <p className="text-gray-600 mb-6">
          Control how and when you receive notifications about your events.
        </p>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Notification Channels</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <Mail className="h-5 w-5 text-gray-400" />
                <span>Email Notifications</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <Bell className="h-5 w-5 text-gray-400" />
                <span>Push Notifications</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <Phone className="h-5 w-5 text-gray-400" />
                <span>SMS Notifications</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Notification Types</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.rsvpUpdates}
                  onChange={(e) => handleSettingChange('rsvpUpdates', e.target.checked)}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <span>RSVP Updates</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.giftNotifications}
                  onChange={(e) => handleSettingChange('giftNotifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <span>Gift Registry Updates</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.reminderNotifications}
                  onChange={(e) => handleSettingChange('reminderNotifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <span>Event Reminders</span>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}