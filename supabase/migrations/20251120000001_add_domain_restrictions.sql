-- 許可するドメインを管理するテーブル
CREATE TABLE IF NOT EXISTS public.allowed_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期ドメインを追加
INSERT INTO public.allowed_domains (domain) VALUES
    ('kaisei.dev')
ON CONFLICT (domain) DO NOTHING;

-- ドメインチェック用のトリガー関数
CREATE OR REPLACE FUNCTION check_allowed_email_domain()
RETURNS TRIGGER AS $$
DECLARE
    email_domain TEXT;
    is_allowed BOOLEAN;
BEGIN
    -- メールアドレスからドメインを抽出
    IF NEW.email IS NOT NULL THEN
        email_domain := SPLIT_PART(NEW.email, '@', 2);

        -- ドメインが許可リストに存在するかチェック
        SELECT EXISTS(
            SELECT 1
            FROM public.allowed_domains
            WHERE domain = email_domain
        ) INTO is_allowed;

        -- 許可されていないドメインの場合はエラー
        IF NOT is_allowed THEN
            RAISE EXCEPTION 'Email domain % is not allowed. Please use an allowed email domain.', email_domain
                USING HINT = 'Contact your administrator to add this domain to the allowed list.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルにトリガーを設定
CREATE TRIGGER enforce_allowed_email_domain
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION check_allowed_email_domain();

-- RLSポリシーを設定（管理者のみがドメインを管理できるように）
ALTER TABLE public.allowed_domains ENABLE ROW LEVEL SECURITY;

-- 管理者のみが許可ドメインを閲覧・管理できるポリシー
CREATE POLICY "Admins can view allowed domains"
ON public.allowed_domains
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can insert allowed domains"
ON public.allowed_domains
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can update allowed domains"
ON public.allowed_domains
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can delete allowed domains"
ON public.allowed_domains
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
