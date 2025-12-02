-- Fix foreign key constraints for reactions and declarations tables
-- to reference auth.users(id) instead of profiles(id)
-- This allows authenticated users to react and declare without having a profile

-- First, perform safety checks to ensure all existing user_ids are valid
DO $$
DECLARE
  invalid_reactions_count INTEGER;
  invalid_declarations_count INTEGER;
BEGIN
  -- Check reactions table
  SELECT COUNT(*) INTO invalid_reactions_count
  FROM reactions r
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = r.user_id
  );

  IF invalid_reactions_count > 0 THEN
    RAISE EXCEPTION 'Found % invalid user_id(s) in reactions table', invalid_reactions_count;
  END IF;

  -- Check declarations table
  SELECT COUNT(*) INTO invalid_declarations_count
  FROM declarations d
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = d.user_id
  );

  IF invalid_declarations_count > 0 THEN
    RAISE EXCEPTION 'Found % invalid user_id(s) in declarations table', invalid_declarations_count;
  END IF;

  RAISE NOTICE 'Safety checks passed. All user_ids are valid.';
END $$;

-- Update reactions table foreign key constraint
ALTER TABLE reactions
  DROP CONSTRAINT reactions_user_id_fkey;

ALTER TABLE reactions
  ADD CONSTRAINT reactions_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Update declarations table foreign key constraint
ALTER TABLE declarations
  DROP CONSTRAINT declarations_user_id_fkey;

ALTER TABLE declarations
  ADD CONSTRAINT declarations_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Update RLS policies to reflect the change (auth.uid() already returns auth.users.id, so no changes needed)
-- The existing policies are already correct:
-- - reactions: WITH CHECK (auth.uid() = user_id)
-- - declarations: WITH CHECK (auth.uid() = user_id)

COMMENT ON CONSTRAINT reactions_user_id_fkey ON reactions IS 'Foreign key to auth.users to allow any authenticated user to react';
COMMENT ON CONSTRAINT declarations_user_id_fkey ON declarations IS 'Foreign key to auth.users to allow any authenticated user to declare';
