/*
  # Add INSERT policy for subscriptions table

  1. Security Changes
    - Add INSERT policy for subscriptions table to allow authenticated users to create their own subscription records
    - This fixes the RLS violation error when new users sign up and try to create a default subscription

  The policy ensures that:
  - Only authenticated users can insert subscription records
  - Users can only create subscriptions for themselves (user_id must match auth.uid())
*/

-- Add INSERT policy for subscriptions table
CREATE POLICY "Users can create own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);