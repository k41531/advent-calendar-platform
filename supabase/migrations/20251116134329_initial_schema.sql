-- ============================================================
-- 1. profiles table
-- ============================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pen_name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. articles table
-- ============================================================
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  publish_date date NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, publish_date)
);

-- Indexes
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_publish_date ON articles(publish_date);
CREATE INDEX idx_articles_status ON articles(status);

-- ============================================================
-- 3. reactions table
-- ============================================================
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id, reaction_type)
);

-- Indexes
CREATE INDEX idx_reactions_article_id ON reactions(article_id);

-- ============================================================
-- 4. declarations table
-- ============================================================
CREATE TABLE declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  publish_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, publish_date)
);

-- Indexes
CREATE INDEX idx_declarations_publish_date ON declarations(publish_date);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- ------------------------------------------------------------
-- profiles table RLS
-- ------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view all profiles
CREATE POLICY "profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------
-- articles table RLS
-- ------------------------------------------------------------
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Published articles are viewable by everyone
CREATE POLICY "published articles are viewable by everyone"
  ON articles FOR SELECT
  USING ((status = 'published'::text) AND (publish_date <= ((now() AT TIME ZONE 'Asia/Tokyo'::text))::date));

-- Users can view their own articles (including drafts)
CREATE POLICY "users can view own articles"
  ON articles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own articles
CREATE POLICY "users can insert own articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete own articles"
  ON articles FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- reactions table RLS
-- ------------------------------------------------------------
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Reactions are viewable by everyone
CREATE POLICY "reactions are viewable by everyone"
  ON reactions FOR SELECT
  USING (true);

-- Authenticated users can insert reactions
CREATE POLICY "authenticated users can insert reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "users can delete own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- declarations table RLS
-- ------------------------------------------------------------
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;

-- Declarations are viewable by everyone
CREATE POLICY "declarations are viewable by everyone"
  ON declarations FOR SELECT
  USING (true);

-- Authenticated users can insert declarations
CREATE POLICY "authenticated users can insert declarations"
  ON declarations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
