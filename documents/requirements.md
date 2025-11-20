# 社内アドベントカレンダーサイト 要件定義書

## 1. プロジェクト概要

### 1.1 技術スタック
- **フロントエンド**: Next.js (App Router)
- **バックエンド**: Supabase
- **認証**: Supabase Auth
- **データベース**: PostgreSQL (Supabase)
- **ストレージ**: Supabase Storage
- **リッチテキストエディタ**: TipTap

### 1.2 目的
社内メンバーが12月1日〜25日の期間中、日替わりで記事を投稿できるアドベントカレンダーサイトを構築する。

---

## 2. 機能要件

### 2.1 記事管理機能

#### 2.1.1 記事の作成
- カレンダーのセルをクリックすることで、その日付の記事作成画面へ遷移
- 記事の入力項目
  - タイトル
  - 本文（TipTapによるリッチテキスト）
  - 画像アップロード（Supabase Storage使用）

#### 2.1.2 記事の保存
- **下書き保存**: `status = 'draft'` として保存
- **公開保存**: `status = 'published'` として保存
- 編集画面で下書き⇔公開の切り替えが可能
- 一度公開した記事も下書きに戻すことが可能

#### 2.1.3 記事の編集・削除
- 自分が書いた記事は編集・削除が可能
- **公開後の日付変更は不可**

#### 2.1.4 記事の閲覧
- **他のユーザーの記事**: 公開された記事のみ閲覧可能
- **自分の記事**: 下書きを含むすべての記事を閲覧可能
- 下書き一覧画面で自分の下書き記事を確認可能
- 自分が書いた記事一覧画面で全記事を確認可能

#### 2.1.5 記事の投稿制限
- **1人が複数の日付に記事を書ける**
- **同じ日には1人1本まで**
- 既に同じ日に記事を書いている場合、カレンダーのセルをクリックするとポップアップで通知

#### 2.1.6 公開制御
- `publish_date`が当日以前 かつ `status = 'published'` の記事のみ公開
- 下書き保存（`status = 'draft'`）のままであれば、日付が来ても公開されない

---

### 2.2 カレンダー機能

#### 2.2.1 カレンダー表示
- **期間**: 12月1日〜25日の固定カレンダー
- **表示内容**:
  - 宣言数: 「3人が宣言中」
  - 公開記事の有無: 視覚的に区別（色やアイコン）
  - 自分が宣言済みかどうか: バッジやアイコンで特別表示
- **非表示内容**:
  - 誰が書くか（記事が公開されるまで分からない）
  - 誰が宣言したか（件数のみ表示）

---

### 2.3 書きます宣言機能

#### 2.3.1 宣言の仕様
- ユーザーは指定した日に「書きます」と宣言できる
- 宣言は任意（宣言せずに記事を書いてもOK）
- 宣言だけして記事を書かなくてもペナルティなし
- **宣言後の解除は不可**
- 同じ日に複数人が宣言可能
- 宣言した日と違う日に記事を書いてもOK
- 記事を書いても宣言は自動解除されない（独立した機能）

#### 2.3.2 宣言の目的
あくまで「この日に誰か書きそうか」の目安となる機能

---

### 2.4 リアクション機能

#### 2.4.1 リアクションの種類
- 複数種類の「いいね」系リアクション
  - 例: いいね、ハート、拍手、炎 など

#### 2.4.2 リアクションの仕様
- 1記事に対して1人が複数種類のリアクションをつけられる
- リアクション数は非表示
- 誰がリアクションしたかも非表示（完全匿名）

---

### 2.5 ユーザー管理機能

#### 2.5.1 ペンネーム
- ユーザー登録時にペンネームを設定
- ペンネームは重複不可（UNIQUE制約）
- ペンネームは後から変更可能
- 記事の投稿者名としてペンネームを表示

---

### 2.6 オミット機能（実装しない機能）

以下の機能は初期バージョンでは実装しない:
- 検索・フィルタリング機能
- 通知機能（リマインド、投稿通知など）
- コメント機能
- リアクション数の表示
- リアクションした人の表示

---

## 3. データベース設計

### 3.1 テーブル定義

#### 3.1.1 `profiles` テーブル
ユーザーのプロフィール情報

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pen_name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**カラム説明**:
- `id`: Supabase Authの`auth.users(id)`と紐づく
- `pen_name`: ペンネーム（重複不可）
- `created_at`: 作成日時
- `updated_at`: 更新日時

---

#### 3.1.2 `articles` テーブル
記事データ

```sql
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

-- インデックス
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_publish_date ON articles(publish_date);
CREATE INDEX idx_articles_status ON articles(status);
```

**カラム説明**:
- `id`: 記事ID
- `user_id`: 投稿者（profilesテーブルへの外部キー）
- `publish_date`: 公開予定日
- `title`: 記事タイトル
- `content`: 記事本文（TipTapのJSON形式）
- `status`: ステータス（'draft' または 'published'）
- `UNIQUE(user_id, publish_date)`: 1人1日1本の制約

---

#### 3.1.3 `reactions` テーブル
記事へのリアクション

```sql
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id, reaction_type)
);

-- インデックス
CREATE INDEX idx_reactions_article_id ON reactions(article_id);
```

**カラム説明**:
- `id`: リアクションID
- `article_id`: 記事ID
- `user_id`: リアクションしたユーザー
- `reaction_type`: リアクションの種類（'like', 'love', 'clap' など）
- `UNIQUE(article_id, user_id, reaction_type)`: 同じ記事に同じリアクションは1回まで

---

#### 3.1.4 `declarations` テーブル
書きます宣言

```sql
CREATE TABLE declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  publish_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, publish_date)
);

-- インデックス
CREATE INDEX idx_declarations_publish_date ON declarations(publish_date);
```

**カラム説明**:
- `id`: 宣言ID
- `user_id`: 宣言したユーザー
- `publish_date`: 宣言した日付
- `UNIQUE(user_id, publish_date)`: 1人が同じ日に複数回宣言できない

---

### 3.2 Row Level Security (RLS) ポリシー

#### 3.2.1 `profiles` テーブル

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 誰でも全員のペンネームは見られる
CREATE POLICY "profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

#### 3.2.2 `articles` テーブル

```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 公開記事は誰でも見られる
CREATE POLICY "published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published' AND publish_date <= CURRENT_DATE);

-- 自分の記事（下書き含む）は見られる
CREATE POLICY "users can view own articles"
  ON articles FOR SELECT
  USING (auth.uid() = user_id);

-- 自分の記事のみ作成・更新・削除可能
CREATE POLICY "users can insert own articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete own articles"
  ON articles FOR DELETE
  USING (auth.uid() = user_id);
```

---

#### 3.2.3 `reactions` テーブル

```sql
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- リアクションは誰でも見られる（数・ユーザーは非表示だが、フロント側で制御）
CREATE POLICY "reactions are viewable by everyone"
  ON reactions FOR SELECT
  USING (true);

-- ログインユーザーはリアクション可能
CREATE POLICY "authenticated users can insert reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のリアクションのみ削除可能
CREATE POLICY "users can delete own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);
```

---

#### 3.2.4 `declarations` テーブル

```sql
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;

-- 宣言は誰でも見られる（カレンダーに件数表示するため）
CREATE POLICY "declarations are viewable by everyone"
  ON declarations FOR SELECT
  USING (true);

-- ログインユーザーは宣言可能
CREATE POLICY "authenticated users can insert declarations"
  ON declarations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 宣言の削除は不可（解除できないため、DELETEポリシーなし）
```

---

## 4. Supabase Storage設定

### 4.1 バケット: `article-images`

**設定**:
- Public access
- パス構造: `{user_id}/{article_id}/{filename}`

**画像管理方針**:
- TipTapのJSONに直接URL埋め込み
- 記事削除時にStorageから該当フォルダごと削除

---

## 5. 画面仕様

### 5.1 カレンダー画面

各日付セルに表示する情報:
1. **日付**: 12月1日〜25日
2. **宣言数**: 「3人が宣言中」
3. **公開記事の有無**: 色やアイコンで視覚的に区別
4. **自分が宣言済みかどうか**: バッジやアイコンで特別表示

非表示情報:
- 誰が書くか
- 誰が宣言したか

---

### 5.2 記事作成・編集画面

入力項目:
- タイトル
- 本文（TipTapエディタ）
- 画像アップロード

アクション:
- 下書き保存
- 公開保存
- 削除

---

### 5.3 記事詳細画面

表示内容:
- タイトル
- 投稿者（ペンネーム）
- 公開日
- 本文
- リアクションボタン（複数種類）

---

### 5.4 下書き一覧画面

表示内容:
- 自分の下書き記事一覧
- タイトル、作成日、公開予定日

---

### 5.5 マイ記事一覧画面

表示内容:
- 自分が書いた全記事（下書き・公開含む）
- タイトル、ステータス、公開予定日

---

## 6. 補足事項

### 6.1 リアクション表示について
- リアクション数・リアクションした人は非表示
- フロントエンド側でリアクション情報を取得しても、UIには表示しない
- リアクションボタンのみ表示し、押せるようにする

### 6.2 公開制御の実装
- クエリ時に `publish_date <= CURRENT_DATE AND status = 'published'` で判定
- バッチ処理は不要

### 6.3 画像アップロードの実装
- TipTapエディタでの画像アップロード時、Supabase Storageに保存
- 保存したURLをTipTapのJSONに埋め込み
- 記事削除時、Storageから該当画像も削除

---

## 7. 今後の拡張案（将来的に検討）

- 検索・フィルタリング機能
- 通知機能（リマインド、投稿通知）
- コメント機能
- リアクション数の表示
- 管理者機能（記事の強制削除、ユーザー管理）
- 年度・イベント管理（毎年使い回す機能）

---

**作成日**: 2025年11月16日  
**バージョン**: 1.0