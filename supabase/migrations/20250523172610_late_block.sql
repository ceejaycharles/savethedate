/*
  # Add remaining feature tables

  1. New Tables
    - `meal_options`: Stores available meal choices for events
    - `guest_meals`: Links guests to their meal selections
    - `custom_questions`: Stores custom RSVP questions
    - `question_responses`: Stores guest responses to custom questions
    - `photo_albums`: Organizes photos into collections
    - `photo_tags`: Stores photo tags and categories
    - `event_budgets`: Tracks event expenses and budget
    - `vendors`: Stores vendor information
    - `tasks`: Stores event planning tasks and timeline
    - `languages`: Stores supported languages for translations
    - `translations`: Stores translated content

  2. Changes
    - Add new columns to existing tables for enhanced functionality
    - Add necessary foreign key relationships
    - Enable RLS on all new tables
*/

-- Meal Options
CREATE TABLE IF NOT EXISTS public.meal_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    dietary_info text,
    max_quantity integer DEFAULT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guest_meals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    meal_id uuid REFERENCES public.meal_options(id) ON DELETE CASCADE,
    quantity integer DEFAULT 1,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(guest_id, meal_id)
);

-- Custom RSVP Questions
CREATE TABLE IF NOT EXISTS public.custom_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    question text NOT NULL,
    type text NOT NULL, -- 'text', 'multiple_choice', 'yes_no'
    options jsonb DEFAULT NULL, -- For multiple choice questions
    required boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.question_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid REFERENCES public.custom_questions(id) ON DELETE CASCADE,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    response text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(question_id, guest_id)
);

-- Photo Organization
CREATE TABLE IF NOT EXISTS public.photo_albums (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    cover_photo_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photo_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id uuid REFERENCES public.photos(id) ON DELETE CASCADE,
    tag text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Event Planning
CREATE TABLE IF NOT EXISTS public.event_budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    category text NOT NULL,
    item_name text NOT NULL,
    estimated_amount numeric NOT NULL,
    actual_amount numeric,
    paid_amount numeric DEFAULT 0,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL,
    contact_name text,
    contact_email text,
    contact_phone text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    due_date timestamptz,
    status text DEFAULT 'pending',
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    priority text DEFAULT 'medium',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Internationalization
CREATE TABLE IF NOT EXISTS public.languages (
    id text PRIMARY KEY,
    name text NOT NULL,
    native_name text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    language_id text REFERENCES public.languages(id) ON DELETE CASCADE,
    key text NOT NULL,
    value text NOT NULL,
    context text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(language_id, key)
);

-- Add columns to existing tables
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS plus_one_allowed boolean DEFAULT false;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS plus_one_name text;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS plus_one_email text;

ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES public.photo_albums(id) ON DELETE SET NULL;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.meal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their event meal options"
    ON public.meal_options
    FOR ALL
    TO authenticated
    USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
    WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage guest meals for their events"
    ON public.guest_meals
    FOR ALL
    TO authenticated
    USING (guest_id IN (SELECT id FROM public.guests WHERE event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid())))
    WITH CHECK (guest_id IN (SELECT id FROM public.guests WHERE event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage custom questions for their events"
    ON public.custom_questions
    FOR ALL
    TO authenticated
    USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
    WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage question responses for their events"
    ON public.question_responses
    FOR ALL
    TO authenticated
    USING (question_id IN (SELECT id FROM public.custom_questions WHERE event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid())))
    WITH CHECK (question_id IN (SELECT id FROM public.custom_questions WHERE event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage photo albums for their events"
    ON public.photo_albums
    FOR ALL
    TO authenticated
    USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
    WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage photo tags for their photos"
    ON public.photo_tags
    FOR ALL
    TO authenticated
    USING (photo_id IN (SELECT id FROM public.photos WHERE event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid())))
    WITH CHECK (photo_id IN (SELECT id FROM public.photos WHERE event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage budgets for their events"
    ON public.event_budgets
    FOR ALL
    TO authenticated
    USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
    WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage vendors for their events"
    ON public.vendors
    FOR ALL
    TO authenticated
    USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
    WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage tasks for their events"
    ON public.tasks
    FOR ALL
    TO authenticated
    USING (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()))
    WITH CHECK (event_id IN (SELECT id FROM public.events WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read languages"
    ON public.languages
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Anyone can read translations"
    ON public.translations
    FOR SELECT
    TO public
    USING (true);

-- Insert default languages
INSERT INTO public.languages (id, name, native_name) VALUES
    ('en', 'English', 'English'),
    ('fr', 'French', 'Français'),
    ('es', 'Spanish', 'Español'),
    ('de', 'German', 'Deutsch')
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meal_options_event_id ON public.meal_options(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_meals_guest_id ON public.guest_meals(guest_id);
CREATE INDEX IF NOT EXISTS idx_custom_questions_event_id ON public.custom_questions(event_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_guest_id ON public.question_responses(guest_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_event_id ON public.photo_albums(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_tags_photo_id ON public.photo_tags(photo_id);
CREATE INDEX IF NOT EXISTS idx_event_budgets_event_id ON public.event_budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON public.vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_translations_language_key ON public.translations(language_id, key);