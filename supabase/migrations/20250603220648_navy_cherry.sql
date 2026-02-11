/*
  # Add insert policy for shared workflows

  1. Changes
    - Add INSERT policy for shared_workflows table to allow authenticated users to create new shared links
    
  2. Security
    - Policy ensures users can only create shared links where they are the owner
    - Maintains existing RLS policies
*/

CREATE POLICY "Users can create shared workflows"
  ON shared_workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);