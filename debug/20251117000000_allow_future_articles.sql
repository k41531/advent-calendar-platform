-- Allow viewing published articles regardless of publish_date (for debugging)
-- This removes the publish_date <= CURRENT_DATE restriction

DROP POLICY IF EXISTS "published articles are viewable by everyone" ON articles;

CREATE POLICY "published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published');
