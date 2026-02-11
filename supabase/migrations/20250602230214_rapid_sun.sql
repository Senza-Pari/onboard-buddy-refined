/*
  # Add subscription management

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `plan` (text) - 'free' or 'premium'
      - `status` (text)
      - `current_period_end` (timestamptz)
      - `cancel_at_period_end` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on subscriptions table
    - Add policies for authenticated users
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL CHECK (plan IN ('free', 'premium')),
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add default free subscription for existing users
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE user_id = auth.users.id
);

-- Add special case for super admin
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'premium', 'active'
FROM auth.users
WHERE email = 'cam@dollen.com'
ON CONFLICT (user_id) 
DO UPDATE SET plan = 'premium', status = 'active';