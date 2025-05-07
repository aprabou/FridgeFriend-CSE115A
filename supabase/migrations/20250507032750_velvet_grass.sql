/*
  # Initial database schema for Fridge Friend

  1. New Tables
    - `profiles` - User profiles with basic information
    - `households` - Household groups that users can belong to
    - `food_items` - Food inventory items with expiration tracking
    - `storage_tips` - Tips for storing different food items

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for household members to see shared data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  members UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create food_items table
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  storage_location TEXT NOT NULL,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create storage_tips table
CREATE TABLE IF NOT EXISTS storage_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert some default storage tips
INSERT INTO storage_tips (food_name, category, tip) VALUES
('Bananas', 'fruits', 'Store bananas separately from other fruits as they release ethylene gas that speeds ripening.'),
('Leafy Greens', 'vegetables', 'Wrap leafy greens in paper towels to absorb excess moisture and keep them fresher longer.'),
('Berries', 'fruits', 'Don''t wash berries until you''re ready to eat them. Moisture speeds up spoilage.'),
('Bread', 'bakery', 'Freeze bread you won''t eat within a few days. Slice before freezing for easy toasting.'),
('Herbs', 'vegetables', 'Store herbs like cilantro and parsley with stems in a glass of water and cover loosely with a plastic bag in the refrigerator.');

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_tips ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Households policies
CREATE POLICY "Users can view households they belong to"
  ON households FOR SELECT
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = ANY(members)
  );

CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Household owners can update their household"
  ON households FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Household owners can delete their household"
  ON households FOR DELETE
  USING (auth.uid() = owner_id);

-- Food items policies
CREATE POLICY "Users can view their own food items"
  ON food_items FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM households 
      WHERE id = food_items.household_id 
      AND (auth.uid() = owner_id OR auth.uid() = ANY(members))
    ))
  );

CREATE POLICY "Users can create their own food items"
  ON food_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food items"
  ON food_items FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM households 
      WHERE id = food_items.household_id 
      AND (auth.uid() = owner_id OR auth.uid() = ANY(members))
    ))
  );

CREATE POLICY "Users can delete their own food items"
  ON food_items FOR DELETE
  USING (
    auth.uid() = user_id OR 
    (household_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM households 
      WHERE id = food_items.household_id 
      AND auth.uid() = owner_id
    ))
  );

-- Storage tips policies (public read-only)
CREATE POLICY "Anyone can view storage tips"
  ON storage_tips FOR SELECT
  USING (true);