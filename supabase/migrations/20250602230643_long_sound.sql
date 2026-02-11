/*
  # Add sharing functionality for onboarding workflows

  1. New Tables
    - `shared_workflows`
      - `id` (uuid, primary key)
      - `owner_id` (uuid) - References auth.users
      - `access_code` (text) - Unique code for accessing the workflow
      - `expires_at` (timestamptz) - When the share link expires
      - `permissions` (jsonb) - Configurable permissions
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
*/

CREATE TABLE IF NOT EXISTS shared_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL,
  access_code text UNIQUE NOT NULL,
  expires_at timestamptz,
  permissions jsonb DEFAULT '{"can_view": true, "can_edit": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shared_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their shared workflows"
  ON shared_workflows
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create updated_at trigger
CREATE TRIGGER update_shared_workflows_updated_at
  BEFORE UPDATE ON shared_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();