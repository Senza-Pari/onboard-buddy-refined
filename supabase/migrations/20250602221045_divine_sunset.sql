/*
  # Gallery Management Schema

  1. New Tables
    - `gallery_items`
      - `id` (uuid, primary key)
      - `type` (text)
      - `title` (text)
      - `description` (text)
      - `content` (text)
      - `location` (text)
      - `date` (date)
      - `image_url` (text)
      - `alt_text` (text)
      - `metadata` (jsonb)
      - `permissions` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)
    
    - `gallery_tags`
      - `id` (uuid, primary key)
      - `item_id` (uuid, references gallery_items)
      - `tag` (text)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('photo', 'note')) NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  location text,
  date date NOT NULL,
  image_url text,
  alt_text text,
  metadata jsonb DEFAULT '{}',
  permissions jsonb DEFAULT '{"public": false, "editable": true, "allowComments": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Create gallery_tags table
CREATE TABLE IF NOT EXISTS gallery_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES gallery_items ON DELETE CASCADE,
  tag text NOT NULL,
  UNIQUE(item_id, tag)
);

-- Enable RLS
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own gallery items"
  ON gallery_items
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (permissions->>'public')::boolean = true
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their gallery tags"
  ON gallery_tags
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM gallery_items 
    WHERE gallery_items.id = gallery_tags.item_id 
    AND gallery_items.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM gallery_items 
    WHERE gallery_items.id = gallery_tags.item_id 
    AND gallery_items.user_id = auth.uid()
  ));

-- Create updated_at trigger for gallery items
CREATE TRIGGER update_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();