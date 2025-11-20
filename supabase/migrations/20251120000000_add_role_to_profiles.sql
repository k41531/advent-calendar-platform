-- Add role field to profiles table for admin functionality
-- This migration creates a user_role enum type and adds it to the profiles table

-- 1. Create user_role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 2. Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- 3. Create index on role for better query performance
CREATE INDEX idx_profiles_role ON profiles(role);

-- 4. Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user (default) or admin';
