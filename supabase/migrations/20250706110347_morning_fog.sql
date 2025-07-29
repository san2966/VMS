/*
  # Initial Schema for Visitor Management System

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `logo` (text, optional)
      - `type` (text: 'government' or 'private')
      - `government_type` (text, optional: 'state' or 'central')
      - `ministry_name` (text, optional)
      - `created_by` (uuid, references admin_users)
      - `created_at` (timestamp)

    - `admin_users`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `username` (text, unique)
      - `password` (text)
      - `phone_number` (text)
      - `aadhar_number` (text)
      - `role` (text: 'admin' or 'superuser')
      - `profile_photo` (text, optional)
      - `created_at` (timestamp)

    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `designation` (text)
      - `department` (text)
      - `location` (text)
      - `phone_number` (text)
      - `image` (text, optional)
      - `organization_id` (uuid, references organizations)
      - `created_by` (uuid, references admin_users)
      - `created_at` (timestamp)

    - `visitors`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `mobile_number` (text)
      - `aadhar_number` (text)
      - `number_of_visitors` (integer)
      - `team_member_names` (text, optional)
      - `photo` (text, optional)
      - `department` (text)
      - `officer_name` (text)
      - `purpose_to_meet` (text)
      - `description` (text, optional)
      - `organization_id` (uuid, references organizations)
      - `visit_date` (date)
      - `visit_time` (time)
      - `qr_code` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create admin_users table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  phone_number text NOT NULL,
  aadhar_number text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'superuser')),
  profile_photo text,
  created_at timestamptz DEFAULT now()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  logo text,
  type text NOT NULL CHECK (type IN ('government', 'private')),
  government_type text CHECK (government_type IN ('state', 'central')),
  ministry_name text,
  created_by uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text NOT NULL,
  department text NOT NULL,
  location text NOT NULL,
  phone_number text NOT NULL,
  image text,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  mobile_number text NOT NULL,
  aadhar_number text NOT NULL,
  number_of_visitors integer NOT NULL DEFAULT 1,
  team_member_names text,
  photo text,
  department text NOT NULL,
  officer_name text NOT NULL,
  purpose_to_meet text NOT NULL,
  description text,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  visit_time time NOT NULL DEFAULT CURRENT_TIME,
  qr_code text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Admin users can read all users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super users can manage all admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'superuser'
    )
  );

-- Create policies for organizations
CREATE POLICY "Users can read organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage their organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Super users can manage all organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'superuser'
    )
  );

-- Create policies for employees
CREATE POLICY "Users can read employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage employees in their organizations"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Super users can manage all employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'superuser'
    )
  );

-- Create policies for visitors
CREATE POLICY "Users can read visitors"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create visitor records"
  ON visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can manage visitors in their organizations"
  ON visitors
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Super users can manage all visitors"
  ON visitors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'superuser'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_created_by ON employees(created_by);
CREATE INDEX IF NOT EXISTS idx_visitors_organization_id ON visitors(organization_id);
CREATE INDEX IF NOT EXISTS idx_visitors_aadhar_number ON visitors(aadhar_number);
CREATE INDEX IF NOT EXISTS idx_visitors_visit_date ON visitors(visit_date);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- Insert default super user
INSERT INTO admin_users (
  id,
  full_name,
  username,
  password,
  phone_number,
  aadhar_number,
  role
) VALUES (
  gen_random_uuid(),
  'Super Administrator',
  'User2966',
  'Admin@2966',
  '0000000000',
  '000000000000',
  'superuser'
) ON CONFLICT (username) DO NOTHING;