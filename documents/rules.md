# 開発ルール - 社内アドベントカレンダーサイト

## 1. アーキテクチャ設計原則

### 1.1 レイヤー構造

```
View Layer (React Components)
    ↓
Service Layer (Use Cases)
    ↓
Repository Layer (Data Access)
    ↓
Domain Layer (Business Logic)
```

**各レイヤーの責務**:

- **Domain Layer**: 純粋なビジネスロジック（外部依存なし）
- **Repository Layer**: データアクセスの抽象化（Supabaseとの接続）
- **Service Layer**: ユースケースの実装（DomainとRepositoryを組み合わせ）
- **View Layer**: UI表示とユーザー操作

### 1.2 依存性注入

**原則**: 依存するオブジェクトはコンストラクタで注入する

```typescript
// Good ✅
export class ArticleRepository {
  constructor(private supabase: SupabaseClient<Database>) {}
}

export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private imageService: ImageService
  ) {}
}

// Bad ❌
export class ArticleService {
  private articleRepository = new ArticleRepository(); // 直接インスタンス化
}
```

---

## 2. Supabase連携ルール

### 2.1 データ取得の方針

| 用途 | 使用方法 | 実装場所 |
|------|----------|----------|
| **ページ初期表示** | Server Component で直接取得 | `app/**page.tsx` |
| **ユーザー操作後のデータ取得** | Server Actions | `app/_actions/*.ts` |
| **リアルタイム購読** | Client Component + Supabase Client | `components/*.tsx` |

### 2.2 データ更新の方針

| 用途 | 使用方法 | 実装場所 |
|------|----------|----------|
| **フォーム送信** | Server Actions | `app/_actions/*.ts` |
| **データ作成・更新・削除** | Server Actions | `app/_actions/*.ts` |

### 2.3 禁止事項

**❌ API Routes の不要な使用**

```typescript
// Bad ❌ - 不要なAPIエンドポイント
// app/api/articles/route.ts
export async function GET() {
  const articles = await getArticles();
  return NextResponse.json(articles);
}

// Good ✅ - Server Componentで直接取得
// app/page.tsx
export default async function Page() {
  const supabase = createServerClient();
  const repository = new ArticleRepository(supabase);
  const articles = await repository.getPublished();
  return <ArticleList articles={articles} />;
}
```

**例外**: 外部API公開、Webhook受信など、本当に必要な場合のみAPI Routesを使用

**❌ Client ComponentでのSupabase直接操作（データ取得・更新）**

```typescript
// Bad ❌
'use client';
export function ArticleList() {
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.from('articles').select('*').then(/* ... */);
  }, []);
}

// Good ✅
'use client';
export function ArticleList({ articles }: { articles: Article[] }) {
  // Server Componentから受け取る
  return <div>{/* render */}</div>;
}
```

**例外**: リアルタイムサブスクリプションのみ許可

---

## 3. ファイル配置規則

### 3.1 ディレクトリ構造

```
src/
  types/
    supabase.ts           # Supabaseが自動生成する型
    domain.ts             # ドメインモデルの型定義
  lib/
    supabase/
      client.ts           # クライアント用 Supabase Client
      server.ts           # サーバー用 Supabase Client
    domain/               # Pure Functions（ビジネスロジック）
      article.ts
      article.test.ts
      penName.ts
      penName.test.ts
      date.ts
      date.test.ts
      reaction.ts
      reaction.test.ts
      image.ts
      image.test.ts
    repositories/         # データアクセス層
      articleRepository.ts
      articleRepository.test.ts
      profileRepository.ts
      profileRepository.test.ts
      declarationRepository.ts
      declarationRepository.test.ts
      reactionRepository.ts
      reactionRepository.test.ts
    services/             # ユースケース層
      articleService.ts
      articleService.test.ts
      profileService.ts
      profileService.test.ts
      calendarService.ts
      calendarService.test.ts
      declarationService.ts
      declarationService.test.ts
      reactionService.ts
      reactionService.test.ts
      imageService.ts
      imageService.test.ts
  app/
    _actions/             # Server Actions
      articleActions.ts
      profileActions.ts
      declarationActions.ts
      reactionActions.ts
    (pages)/              # ページ
      page.tsx
      articles/
        page.tsx
        [id]/
          page.tsx
        new/
          page.tsx
  components/             # Reactコンポーネント
    Calendar.tsx
    ArticleList.tsx
    ArticleCard.tsx
    ArticleForm.tsx
    ReactionButton.tsx
```

### 3.2 命名規則

**ファイル名**:
- コンポーネント: PascalCase（`ArticleCard.tsx`）
- 関数・ユーティリティ: camelCase（`validatePenName.ts`）
- 型定義: camelCase（`domain.ts`）
- テストファイル: 元のファイル名 + `.test.ts`

**クラス名**:
- Repository: `XxxRepository`
- Service: `XxxService`

**関数名**:
- バリデーション: `validateXxx`
- チェック: `isXxx`, `canXxx`, `hasXxx`
- 取得: `getXxx`
- 作成: `createXxx`
- 更新: `updateXxx`
- 削除: `deleteXxx`

### 3.3 コロケーション原則

**テストファイルは実装ファイルと同じディレクトリに配置**

```
lib/
  domain/
    article.ts
    article.test.ts      # ← 同じディレクトリ
```

---

## 4. テスト規則

### 4.1 TDDサイクル

すべてのロジックは **Red → Green → Refactor** で実装する

1. **Red**: 失敗するテストを書く
2. **Green**: 最小限のコードでテストを通す
3. **Refactor**: コードをきれいにする

### 4.2 実装フェーズ

**Phase 0: 型定義**
- Supabase型の自動生成
- ドメイン型の定義

**Phase 1: ドメインロジック**
- Pure Functions（外部依存なし）
- 最も簡単で価値のあるものから実装

**Phase 2: リポジトリ層**
- Supabaseクライアントをモックしてテスト
- データアクセスの抽象化

**Phase 3: サービス層**
- ドメインとリポジトリを組み合わせる
- ユースケースの実装

### 4.3 テストの原則

**Domain Layer**:
- モック不要（Pure Functions）
- すべてのエッジケースをテスト

```typescript
describe('isPublishable', () => {
  it('公開設定で公開日が今日の場合、公開可能', () => {
    const article = { status: 'published' as const, publishDate: new Date('2025-11-16') };
    const today = new Date('2025-11-16');
    expect(isPublishable(article, today)).toBe(true);
  });
});
```

**Repository Layer**:
- Supabaseクライアントをモック
- 正常系・異常系をテスト

```typescript
describe('ArticleRepository', () => {
  it('公開記事を取得できる', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: [/* ... */], error: null })
          })
        })
      })
    } as any;
    
    const repository = new ArticleRepository(mockSupabase);
    const articles = await repository.getPublished();
    expect(articles).toHaveLength(1);
  });
});
```

**Service Layer**:
- リポジトリをモック
- ユースケース全体の動作をテスト

---

## 5. 型定義ルール

### 5.1 型の配置

**Supabase型**: `src/types/supabase.ts`（自動生成）

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

**ドメイン型**: `src/types/domain.ts`（手動定義）

```typescript
export type Article = {
  id: string;
  userId: string;
  publishDate: Date;
  title: string;
  content: object;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
};
```

### 5.2 型変換

**Repository層でSupabase型 → ドメイン型に変換**

```typescript
export class ArticleRepository {
  private toDomain(raw: Database['public']['Tables']['articles']['Row']): Article {
    return {
      id: raw.id,
      userId: raw.user_id,
      publishDate: new Date(raw.publish_date),
      title: raw.title,
      content: raw.content,
      status: raw.status as 'draft' | 'published',
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }
}
```

**原則**: アプリケーション内ではドメイン型を使用し、DB型はRepository層でのみ扱う

---

## 6. Server Component / Server Actions パターン

### 6.1 Server Component パターン

**用途**: ページ初期表示でのデータ取得

```typescript
// app/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { ArticleRepository } from '@/lib/repositories/articleRepository';

export default async function HomePage() {
  const supabase = createServerClient();
  const repository = new ArticleRepository(supabase);
  
  // 直接データ取得
  const articles = await repository.getPublished();
  
  return <ArticleList articles={articles} />;
}
```

**ルール**:
- `async` 関数として定義
- リポジトリを直接使用してデータ取得
- 取得したデータをPropsでClient Componentに渡す

---

### 6.2 Server Actions パターン

**用途**: データ更新、ユーザー操作後のデータ取得

```typescript
// app/_actions/articleActions.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { ArticleService } from '@/lib/services/articleService';
import { ArticleRepository } from '@/lib/repositories/articleRepository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createArticle(formData: FormData) {
  const supabase = createServerClient();
  const repository = new ArticleRepository(supabase);
  const service = new ArticleService(repository);
  
  const result = await service.createArticle({
    title: formData.get('title') as string,
    content: JSON.parse(formData.get('content') as string),
    publishDate: new Date(formData.get('publishDate') as string),
    status: formData.get('status') as 'draft' | 'published',
  });
  
  // キャッシュを再検証
  revalidatePath('/');
  revalidatePath('/articles');
  
  // リダイレクト
  redirect(`/articles/${result.id}`);
}
```

**ルール**:
- ファイルの先頭に `'use server'` を記述
- エラーハンドリングを適切に行う
- 成功後は `revalidatePath` でキャッシュを更新
- 必要に応じて `redirect` でページ遷移

---

### 6.3 Client Component パターン

**用途**: Server Actionsの呼び出し、UI状態管理

```typescript
// components/ArticleForm.tsx
'use client';

import { createArticle } from '@/app/_actions/articleActions';
import { useFormStatus } from 'react-dom';

export function ArticleForm() {
  return (
    <form action={createArticle}>
      <input name="title" required />
      <textarea name="content" required />
      <input type="date" name="publishDate" required />
      <select name="status">
        <option value="draft">下書き</option>
        <option value="published">公開</option>
      </select>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '保存中...' : '保存'}
    </button>
  );
}
```

**ルール**:
- ファイルの先頭に `'use client'` を記述
- Server Actionsは `action` プロパティで渡す
- `useFormStatus` で送信状態を管理
- できるだけロジックを含めず、UIに専念

---

## 7. エラーハンドリング

### 7.1 Domain Layer

```typescript
export type ValidationResult<T> = 
  | { isValid: true; value: T }
  | { isValid: false; error: string };

export function validatePenName(penName: string): ValidationResult<string> {
  if (penName.trim() === '') {
    return { isValid: false, error: 'ペンネームを入力してください' };
  }
  if (penName.length < 2) {
    return { isValid: false, error: 'ペンネームは2文字以上で入力してください' };
  }
  return { isValid: true, value: penName };
}
```

### 7.2 Repository Layer

```typescript
export class ArticleRepository {
  async getById(id: string): Promise<Article | null> {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Failed to fetch article:', error);
      throw new Error('記事の取得に失敗しました');
    }
    
    return data ? this.toDomain(data) : null;
  }
}
```

### 7.3 Service Layer

```typescript
export class ArticleService {
  async createArticle(input: CreateArticleInput): Promise<Article> {
    // バリデーション
    const titleValidation = validateArticleTitle(input.title);
    if (!titleValidation.isValid) {
      throw new Error(titleValidation.error);
    }
    
    // ビジネスルールチェック
    const canCreate = await this.canCreateArticleOnDate(
      input.userId, 
      input.publishDate
    );
    if (!canCreate) {
      throw new Error('この日付には既に記事が存在します');
    }
    
    // 作成
    return await this.articleRepository.create(input);
  }
}
```

### 7.4 Server Actions

```typescript
'use server';

export async function createArticle(formData: FormData) {
  try {
    const supabase = createServerClient();
    const service = new ArticleService(supabase);
    
    const result = await service.createArticle({
      title: formData.get('title') as string,
      // ...
    });
    
    revalidatePath('/articles');
    redirect(`/articles/${result.id}`);
  } catch (error) {
    console.error('Failed to create article:', error);
    return { 
      error: error instanceof Error ? error.message : '記事の作成に失敗しました' 
    };
  }
}
```

**Client Componentでのエラー表示**:

```typescript
'use client';

import { useFormState } from 'react-dom';
import { createArticle } from '@/app/_actions/articleActions';

export function ArticleForm() {
  const [state, formAction] = useFormState(createArticle, { error: null });
  
  return (
    <form action={formAction}>
      {state?.error && <p className="error">{state.error}</p>}
      {/* form fields */}
    </form>
  );
}
```

---

## 8. コーディング規約

### 8.1 非同期処理

**原則**: `async/await` を使用（Promiseチェーンは避ける）

```typescript
// Good ✅
async function getArticle(id: string) {
  const article = await repository.getById(id);
  const reactions = await reactionRepository.getByArticleId(id);
  return { article, reactions };
}

// Bad ❌
function getArticle(id: string) {
  return repository.getById(id)
    .then(article => reactionRepository.getByArticleId(id)
      .then(reactions => ({ article, reactions }))
    );
}
```

### 8.2 型安全性

**原則**: `any` は使用禁止、`unknown` を使う

```typescript
// Good ✅
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// Bad ❌
function parseJSON(json: string): any {
  return JSON.parse(json);
}
```

### 8.3 定数の管理

**原則**: マジックナンバー・マジックストリングは定数化

```typescript
// Good ✅
export const ADVENT_START_DATE = { month: 12, day: 1 };
export const ADVENT_END_DATE = { month: 12, day: 25 };
export const REACTION_TYPES = ['like', 'love', 'clap', 'fire'] as const;

// Bad ❌
if (date.getMonth() === 11 && date.getDate() >= 1 && date.getDate() <= 25) {
  // ...
}
```

---

## 9. データフローの具体例

### 9.1 記事一覧の表示（読み取り）

```
1. User が /articles にアクセス
   ↓
2. Server Component (app/articles/page.tsx)
   - createServerClient() でSupabaseクライアント作成
   - ArticleRepository インスタンス作成
   - repository.getPublished() でデータ取得
   ↓
3. Client Component (components/ArticleList.tsx)
   - Propsで記事データを受け取る
   - UIをレンダリング
```

### 9.2 記事の作成（書き込み）

```
1. User がフォームを送信
   ↓
2. Server Action (app/_actions/articleActions.ts)
   - createServerClient() でSupabaseクライアント作成
   - ArticleService インスタンス作成
   - service.createArticle() で記事作成
   - revalidatePath() でキャッシュ更新
   - redirect() でページ遷移
   ↓
3. 新しいページが表示される
```

### 9.3 リアクションの追加（リアルタイム）

```
1. User がリアクションボタンをクリック
   ↓
2. Client Component
   - Server Action (addReaction) を呼び出し
   ↓
3. Server Action
   - ReactionService.addReaction() を実行
   - revalidatePath() でキャッシュ更新
   ↓
4. (オプション) リアルタイムサブスクリプション
   - Client Component がSupabase Realtime で変更を購読
   - 他のユーザーのリアクションをリアルタイム表示
```

---

## 10. 禁止事項まとめ

### ❌ 絶対にやってはいけないこと

1. **API Routesの不要な使用**
   - Server ComponentやServer Actionsで十分な場合はAPI Routes不要

2. **Client ComponentでのSupabase直接操作（データ取得・更新）**
   - リアルタイムサブスクリプション以外は禁止

3. **グローバル状態の乱用**
   - Server Componentからのデータ受け渡しで十分

4. **any型の使用**
   - 型安全性を損なうため禁止

5. **マジックナンバー・マジックストリング**
   - 必ず定数化する

6. **テストなしの実装**
   - TDD原則に従い、必ずテストを先に書く

---

## 11. 開発の進め方

### 11.1 新機能の追加手順

1. **要件を明確化**
2. **型定義を追加** (`src/types/domain.ts`)
3. **TDDでDomain層を実装** (Phase 1)
4. **TDDでRepository層を実装** (Phase 2)
5. **TDDでService層を実装** (Phase 3)
6. **Server Actionsを実装**
7. **UI (React Components) を実装**
8. **動作確認**

### 11.2 バグ修正手順

1. **バグを再現するテストを書く** (Red)
2. **テストが通るように修正** (Green)
3. **リファクタリング** (Refactor)

---

## 12. レビュー観点

### 12.1 コードレビューチェックリスト

- [ ] テストが先に書かれているか
- [ ] すべてのテストがパスしているか
- [ ] 型安全性が保たれているか（`any` が使われていないか）
- [ ] エラーハンドリングが適切か
- [ ] Server Component / Server Actions / Client Componentの使い分けが正しいか
- [ ] 不要なAPI Routesが作られていないか
- [ ] Client ComponentでSupabaseを直接操作していないか
- [ ] 定数化すべき値が定数化されているか
- [ ] ファイル配置が規則に従っているか

---

**作成日**: 2025年11月16日  
**バージョン**: 1.0