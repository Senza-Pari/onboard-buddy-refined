/*
  # Missions Management Schema

  1. New Tables
    - `missions`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `deadline` (date)
      - `link` (text)
      - `progress` (integer)
      - `completed` (boolean)
      - `reward_type` (text)
      - `reward_value` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)
    
    - `mission_requirements`
      - `id` (uuid, primary key)
      - `mission_id` (uuid, references missions)
      - `tag` (text)
      - `count` (integer)
      - `current` (integer)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  deadline date,
  link text,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  reward_type text CHECK (reward_type IN ('points', 'badge', 'achievement')),
  reward_value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Create mission_requirements table
CREATE TABLE IF NOT EXISTS mission_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions ON DELETE CASCADE,
  tag text NOT NULL,
  count integer NOT NULL CHECK (count > 0),
  current integer DEFAULT 0,
  UNIQUE(mission_id, tag)
);

-- Enable RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_requirements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own missions"
  ON missions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their mission requirements"
  ON mission_requirements
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM missions 
    WHERE missions.id = mission_requirements.mission_id 
    AND missions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM missions 
    WHERE missions.id = mission_requirements.mission_id 
    AND missions.user_id = auth.uid()
  ));

-- Create updated_at trigger for missions
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();