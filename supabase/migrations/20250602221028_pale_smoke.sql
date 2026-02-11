/*
  # Tasks Management Schema

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `due_date` (date)
      - `completed` (boolean)
      - `notes` (text)
      - `link` (text)
      - `priority` (text)
      - `department` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)
    
    - `task_tags`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `tag` (text)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  completed boolean DEFAULT false,
  notes text,
  link text,
  priority text CHECK (priority IN ('high', 'medium', 'low')),
  department text CHECK (department IN ('HR', 'IT', 'Manager')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Create task_tags table
CREATE TABLE IF NOT EXISTS task_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks ON DELETE CASCADE,
  tag text NOT NULL,
  UNIQUE(task_id, tag)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their task tags"
  ON task_tags
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = task_tags.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();