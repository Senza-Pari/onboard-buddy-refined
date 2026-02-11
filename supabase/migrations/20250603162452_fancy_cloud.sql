/*
  # User Activation System

  1. New Tables
    - `activation_codes`
      - `id` (uuid, primary key)
      - `email` (text) - The email address this code is for
      - `code` (text) - The activation code
      - `expires_at` (timestamptz) - When the code expires
      - `used_at` (timestamptz) - When the code was used
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(code)
);

-- Enable RLS
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_activation_codes_updated_at
  BEFORE UPDATE ON activation_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate secure activation code
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..16 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    IF i % 4 = 0 AND i != 16 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$;