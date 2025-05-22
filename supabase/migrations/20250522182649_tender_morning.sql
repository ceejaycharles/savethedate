/*
  # Initial database schema for SaveTheDate

  1. New Tables
    - `users`: Stores user information (id, email, full_name, etc.)
    - `events`: Stores event details (name, type, date, location, etc.)
    - `guests`: Stores guest information for events
    - `invitations`: Tracks invitations sent to guests
    - `rsvps`: Records guest responses to invitations
    - `gift_items`: Stores gift registry items
    - `transactions`: Records payment transactions for gifts
    - `photos`: Stores event photos
    - `subscription_tiers`: Defines subscription plans
    - `user_subscriptions`: Links users to their subscription plans

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  profile_picture_url TEXT,
  subscription_tier_id INTEGER DEFAULT 1, -- Default to free tier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ,
  location TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  privacy_setting TEXT NOT NULL DEFAULT 'private',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent',
  invitation_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RSVPs table
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  guest_count INTEGER DEFAULT 1,
  dietary_restrictions TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gift items table
CREATE TABLE IF NOT EXISTS gift_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  desired_price DECIMAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  purchased_quantity INTEGER DEFAULT 0,
  external_link TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_item_id UUID NOT NULL REFERENCES gift_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  fee_amount DECIMAL NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id_uploader UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  privacy_setting TEXT NOT NULL DEFAULT 'event',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price DECIMAL NOT NULL,
  annual_price DECIMAL NOT NULL,
  max_events INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  transaction_fee_percentage DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id INTEGER NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, monthly_price, annual_price, max_events, max_guests, transaction_fee_percentage)
VALUES
  ('Free', 0, 0, 2, 50, 5),
  ('Silver', 2500, 24000, 5, 250, 3),
  ('Gold', 5000, 48000, 999999, 999999, 1.5);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Users can CRUD their own events"
  ON events FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view public events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (privacy_setting = 'public');

-- Guests policies
CREATE POLICY "Users can CRUD guests for their events"
  ON guests FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- Invitations policies
CREATE POLICY "Users can CRUD invitations for their events"
  ON invitations FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- RSVPs policies
CREATE POLICY "Users can read RSVPs for their events"
  ON rsvps FOR SELECT
  TO authenticated
  USING (
    invitation_id IN (
      SELECT i.id FROM invitations i
      JOIN events e ON i.event_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can create and update their own RSVPs"
  ON rsvps FOR ALL
  TO authenticated
  USING (
    invitation_id IN (
      SELECT id FROM invitations
    )
  );

-- Gift items policies
CREATE POLICY "Users can CRUD gift items for their events"
  ON gift_items FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view gift items"
  ON gift_items FOR SELECT
  TO anon, authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE privacy_setting = 'public'
      UNION
      SELECT event_id FROM invitations WHERE id IN (
        SELECT invitation_id FROM rsvps
      )
    )
  );

-- Transactions policies
CREATE POLICY "Users can view transactions for their events"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    gift_item_id IN (
      SELECT gi.id FROM gift_items gi
      JOIN events e ON gi.event_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Photos policies
CREATE POLICY "Users can CRUD photos for their events"
  ON photos FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public photos"
  ON photos FOR SELECT
  TO anon, authenticated
  USING (
    (privacy_setting = 'public')
    OR 
    (event_id IN (
      SELECT id FROM events WHERE privacy_setting = 'public'
    ))
  );

-- Subscription tiers policies
CREATE POLICY "Anyone can view subscription tiers"
  ON subscription_tiers FOR SELECT
  TO anon, authenticated
  USING (true);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create functions

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_events
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_guests
BEFORE UPDATE ON guests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_invitations
BEFORE UPDATE ON invitations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_rsvps
BEFORE UPDATE ON rsvps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_gift_items
BEFORE UPDATE ON gift_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_transactions
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_photos
BEFORE UPDATE ON photos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_subscription_tiers
BEFORE UPDATE ON subscription_tiers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_user_subscriptions
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();