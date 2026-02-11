/*
  # Role-Based Access Control Schema

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Role name (e.g., 'company_admin', 'new_hire')
      - `description` (text) - Role description
      - `created_at` (timestamptz)
    
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `role_id` (uuid) - References roles
      - `created_at` (timestamptz)
    
    - `permissions`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Permission name
      - `description` (text)
      - `resource` (text) - Resource type (e.g., 'missions', 'tasks', 'gallery')
      - `action` (text) - Allowed action (e.g., 'create', 'read', 'update', 'delete')
      - `created_at` (timestamptz)
    
    - `role_permissions`
      - `id` (uuid, primary key)
      - `role_id` (uuid) - References roles
      - `permission_id` (uuid) - References permissions
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for specific roles
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role_id uuid REFERENCES roles NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles NOT NULL,
  permission_id uuid REFERENCES permissions NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to authenticated users"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to authenticated users"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to own user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow read access to role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('company_admin', 'Full access to manage onboarding framework and users'),
  ('new_hire', 'Access to complete onboarding tasks and track progress');

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('manage_missions', 'Create and manage missions', 'missions', 'write'),
  ('view_missions', 'View available missions', 'missions', 'read'),
  ('manage_tasks', 'Create and manage tasks', 'tasks', 'write'),
  ('view_tasks', 'View and complete tasks', 'tasks', 'read'),
  ('manage_gallery', 'Full gallery management', 'gallery', 'write'),
  ('add_gallery_items', 'Add items to gallery', 'gallery', 'create'),
  ('manage_users', 'Manage user accounts', 'users', 'write'),
  ('view_analytics', 'View onboarding analytics', 'analytics', 'read');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'company_admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'new_hire'
AND p.name IN ('view_missions', 'view_tasks', 'add_gallery_items');