-- Add notification settings to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT jsonb_build_object(
  'emailNotifications', true,
  'pushNotifications', false,
  'smsNotifications', false,
  'rsvpUpdates', true,
  'giftNotifications', true,
  'reminderNotifications', true
);

-- Add theme settings to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS theme_colors jsonb DEFAULT jsonb_build_object(
  'primary', '#4F46E5',
  'secondary', '#EC4899',
  'accent', '#F59E0B',
  'background', '#FFFFFF',
  'text', '#111827'
);