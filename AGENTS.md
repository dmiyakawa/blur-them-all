# Blur Them All - AI開発者向けガイド

このドキュメントは、本プロジェクト「Blur Them All」に携わるAI開発者および人間の開発者に向けて、プロジェクトの立ち位置、開発思想、コーディング規約を示すものです。

## プロジェクト概要

**Blur Them All** は、ブラウザ上で動作するモザイク・ブラー処理に特化したシンプルな画像編集ツールです。

### プロジェクトの目的

1. **プライバシー保護**: スクリーンショットや画像に含まれる個人情報・機密情報を手軽にモザイク・ブラー処理できるツールを提供
2. **シンプルさ**: 複雑な画像編集ソフトではなく、特定のタスクに特化した使いやすいツール
3. **アクセシビリティ**: インストール不要、ブラウザだけで動作する
4. **安全性**: 完全クライアントサイドで動作し、画像データを外部に送信しない

### プロジェクトが目指さないこと

- 高度な画像編集機能（レイヤー管理、フィルター多数、エフェクトなど）
- PhotoshopやGIMPの代替
- サーバーサイド処理やクラウド連携
- 商用レベルの画像編集機能

本ツールは「特定のタスク（モザイク・ブラー）を素早く簡単に行う」ことに焦点を当てています。

## 設計書

詳細な設計については以下のドキュメントを参照してください：

- [設計書 (.ai/design.md)](.ai/design.md)

設計書には以下の情報が含まれています：
- システムアーキテクチャ
- 技術スタック
- 機能設計
- データモデル
- ファイル構成
- 開発フェーズ

## 技術スタック

### 選定理由

| 技術 | 理由 |
|------|------|
| **TypeScript** | 型安全性によるバグの早期発見、IDEサポートの向上、保守性の向上 |
| **Vue.js 3** | リアクティブなUIを簡潔に記述可能、学習コストが低い、Composition APIによる再利用可能なロジック |
| **Vite** | 高速な開発サーバー、最適化されたビルド、優れたHMR |
| **Tailwind CSS** | ユーティリティファーストで迅速なUI構築、カスタマイズ性が高い、一貫性のあるデザイン |
| **Canvas API** | ブラウザネイティブな画像処理、高いパフォーマンス、外部依存なし |
| **IndexedDB** | 大容量データの保存、非同期API、広いブラウザサポート |

### 依存ライブラリの方針

- **最小限の依存**: 必要最小限のライブラリのみを使用
- **メンテナンス性**: 活発にメンテナンスされているライブラリを選択
- **バンドルサイズ**: 軽量なライブラリを優先
- **型定義**: TypeScript型定義が提供されているものを優先

## コーディング規約

### TypeScript

#### 型定義
```typescript
// Good: 明示的な型定義
interface ImageState {
  id: string;
  width: number;
  height: number;
}

function loadImage(file: File): Promise<ImageState> {
  // ...
}

// Bad: anyの使用（特別な理由がない限り避ける）
function processData(data: any): any {
  // ...
}
```

#### null/undefinedの扱い
```typescript
// Good: オプショナルチェーンとNull合体演算子
const width = image?.width ?? 0;

// Good: 明示的なnullチェック
if (image !== null && image !== undefined) {
  // ...
}

// Bad: 暗黙的なfalsy判定（0やfalseも除外される）
if (image) {
  // ...
}
```

### Vue.js

#### Composition API優先
```typescript
// Good: Composition API使用
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

// 避ける: Options API（既存コードの保守を除く）
```

#### コンポーネント命名
```typescript
// Good: PascalCase、説明的な名前
AppHeader.vue
CanvasEditor.vue
ColorPicker.vue

// Bad: 単語1つ、不明瞭な名前
Header.vue
Canvas.vue
Picker.vue
```

#### Props定義
```typescript
// Good: 型定義とデフォルト値
interface Props {
  width: number;
  color?: string;
  enabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#000000',
  enabled: true,
});

// Bad: 型なし、バリデーションなし
```

### CSS (Tailwind)

#### クラス名の順序
```html
<!-- Good: レイアウト → サイズ → スタイル の順 -->
<div class="flex items-center justify-between w-full p-4 bg-gray-100 rounded-lg">

<!-- Bad: 無秩序 -->
<div class="bg-gray-100 flex rounded-lg p-4 w-full items-center justify-between">
```

#### カスタムクラスの使用
```html
<!-- Good: 繰り返しが多い場合はコンポーネント化またはカスタムクラス -->
<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition;
}
</style>

<!-- 避ける: 過度に長いクラス名の繰り返し -->
```

### ファイル・ディレクトリ構成

#### ファイル命名
- **コンポーネント**: PascalCase (`CanvasEditor.vue`)
- **サービス/ユーティリティ**: PascalCase (`ImageProcessor.ts`)
- **型定義**: camelCase (`image.ts`, `tool.ts`)
- **設定ファイル**: kebab-case (`vite.config.ts`)

#### インポート順序
```typescript
// 1. Vue関連
import { ref, computed, onMounted } from 'vue';

// 2. 外部ライブラリ
import axios from 'axios';

// 3. 内部モジュール（型）
import type { ImageState, ToolType } from '@/types';

// 4. 内部モジュール（サービス）
import { ImageProcessor } from '@/services/ImageProcessor';

// 5. 内部モジュール（コンポーネント）
import Button from '@/components/common/Button.vue';

// 6. スタイル
import '@/assets/styles.css';
```

### コメント規約

#### コメントが必要な場合
```typescript
// Good: 複雑なアルゴリズムの説明
/**
 * ガウシアンブラーをかける
 * カーネルサイズは strength * 2 + 1 で計算
 */
function applyGaussianBlur(imageData: ImageData, strength: number): ImageData {
  // ...
}

// Good: 非自明な制約・理由の説明
// IndexedDBの制限により、5MBを超える画像は分割保存が必要
const MAX_CHUNK_SIZE = 5 * 1024 * 1024;
```

#### 不要なコメント
```typescript
// Bad: 自明なコード
// count を 1 増やす
count++;

// Bad: 古いコード（削除すべき）
// const oldMethod = () => { ... }

// Bad: TODO（課題管理システムを使用）
// TODO: ここを修正する
```

### エラーハンドリング

#### エラーの種類
```typescript
// Good: カスタムエラークラス
class ImageLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

// Good: エラーの適切な処理
async function loadImage(file: File): Promise<ImageState> {
  try {
    // ...
  } catch (error) {
    if (error instanceof ImageLoadError) {
      // 特定のエラーハンドリング
      console.error('画像の読み込みに失敗しました:', error.message);
      throw error;
    }
    // 予期しないエラー
    console.error('予期しないエラー:', error);
    throw new Error('画像処理中にエラーが発生しました');
  }
}
```

#### ユーザーへのフィードバック
```typescript
// Good: ユーザーフレンドリーなエラーメッセージ
showError('画像の読み込みに失敗しました。ファイル形式を確認してください。');

// Bad: 技術的すぎるメッセージ
showError('ImageLoadError: Failed to decode image data at offset 0x1234');
```

## 開発ワークフロー

### ブランチ戦略（Git使用時）

```
main          ← 本番用（常に動作する状態）
  ↑
develop       ← 開発用（統合ブランチ）
  ↑
feature/*     ← 機能追加
fix/*         ← バグ修正
```

### コミットメッセージ

```
# Good
feat: モザイク処理機能を追加
fix: ペン描画時のメモリリークを修正
refactor: ImageProcessor を関数型に変更
docs: README に使用方法を追加

# 参考形式
<type>: <subject>

type: feat, fix, refactor, docs, style, test, chore
subject: 変更内容の簡潔な説明（日本語OK、50文字以内推奨）
```

### テスト方針

#### ユニットテスト
- コアロジック（ImageProcessor, ToolManager等）は必ずテストを書く
- テストカバレッジ80%以上を目標
- エッジケースを含める

```typescript
// 例: モザイク処理のテスト
describe('ImageProcessor.applyMosaic', () => {
  it('指定された領域にモザイクがかかること', () => {
    // ...
  });

  it('領域外の画像は変更されないこと', () => {
    // ...
  });

  it('ブロックサイズ0の場合はエラーをスローすること', () => {
    // ...
  });
});
```

#### コンポーネントテスト
- ユーザーインタラクションが多いコンポーネントをテスト
- イベントの発火・伝播を確認

### パフォーマンス指標

#### 目標
- 初回ロード: 3秒以内
- 画像読み込み（1MB程度）: 1秒以内
- モザイク処理（1024x768）: 0.5秒以内
- Undo/Redo: 100ms以内

#### 最適化チェックリスト
- [ ] 画像処理は非同期で実行
- [ ] 大きな画像は段階的に処理
- [ ] Canvas再描画は必要最小限
- [ ] 不要なオブジェクトは即座に解放
- [ ] バンドルサイズは500KB以下（gzip後）

## 開発時の注意点

### セキュリティ

#### XSS対策
```typescript
// Good: Vue.jsのテンプレートは自動エスケープ
<template>
  <div>{{ userInput }}</div>
</template>

// Bad: v-html の不用意な使用
<template>
  <div v-html="userInput"></div>
</template>
```

#### ファイルアップロード
```typescript
// Good: ファイルタイプの検証
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

function validateFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type);
}

// Good: ファイルサイズの制限
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('ファイルサイズが大きすぎます');
}
```

### アクセシビリティ

```html
<!-- Good: 適切なARIA属性とalt -->
<button
  aria-label="モザイク処理を適用"
  @click="applyMosaic"
>
  <img src="icon.svg" alt="" role="presentation" />
</button>

<!-- Good: キーボード操作サポート -->
<div
  role="button"
  tabindex="0"
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space.prevent="handleClick"
>
```

### ブラウザ互換性

```typescript
// Good: 機能検出
if ('indexedDB' in window) {
  // IndexedDBを使用
} else {
  // LocalStorageへフォールバック
  console.warn('IndexedDBが利用できません。LocalStorageを使用します。');
}

// Good: Canvasフィルターのフォールバック
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

if (ctx && 'filter' in ctx) {
  // filter プロパティを使用
  ctx.filter = `blur(${strength}px)`;
} else {
  // カスタム実装にフォールバック
  applyCustomBlur(ctx, strength);
}
```

## トラブルシューティング

### よくある問題

#### Canvas のメモリリーク
```typescript
// Bad: 使い終わったCanvasを放置
const canvas = document.createElement('canvas');
// ... 処理 ...
// canvasが参照され続ける

// Good: 明示的にクリア
const canvas = document.createElement('canvas');
// ... 処理 ...
canvas.width = 0;
canvas.height = 0;
// または適切にnull化
```

#### IndexedDB のトランザクション
```typescript
// Bad: トランザクション外でアクセス
const transaction = db.transaction(['images'], 'readwrite');
const store = transaction.objectStore('images');
setTimeout(() => {
  store.add(data); // トランザクションが既に終了している可能性
}, 1000);

// Good: トランザクション内で完結
const transaction = db.transaction(['images'], 'readwrite');
const store = transaction.objectStore('images');
store.add(data);
```

## AI開発者への特記事項

### コード生成時の指針

1. **設計書を参照**: 実装前に必ず `.ai/design.md` を確認し、設計意図を理解する
2. **既存コードの調査**: 新機能追加時は類似機能の実装を参考にする
3. **段階的な実装**: 大きな機能は小さなステップに分割して実装する
4. **テスト駆動**: 可能な限りテストを先に書く（TDD）
5. **ドキュメント更新**: コード変更時は関連ドキュメントも更新する

### 質問すべきタイミング

以下の場合は、ユーザーに確認を取ることを推奨：

- 設計書に記載のない新機能を追加する場合
- パフォーマンスとコード品質のトレードオフが発生する場合
- 外部ライブラリの追加が必要な場合
- 既存の動作を変更する可能性がある場合
- セキュリティやプライバシーに影響する変更の場合

### 開発の優先順位

1. **機能の正確性**: まず正しく動作することを優先
2. **ユーザー体験**: 次にUXの向上を図る
3. **パフォーマンス**: その後最適化を行う
4. **リファクタリング**: 最後にコードの整理を行う

「動作するコードを書く → 改善する」の順序を守る。

## リソース

### 参考ドキュメント
- [Vue.js 公式ドキュメント](https://vuejs.org/)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [MDN Web Docs - Canvas API](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [MDN Web Docs - IndexedDB](https://developer.mozilla.org/ja/docs/Web/API/IndexedDB_API)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)

### プロジェクト固有ドキュメント
- [設計書](.ai/design.md) - システムの詳細設計
- [README.md](README.md) - ユーザー向けドキュメント（未作成の場合は開発完了時に作成）

## まとめ

本プロジェクトは「シンプルで使いやすいモザイク・ブラー処理ツール」という明確な目的を持っています。機能を追加する際は、常にこの目的に立ち返り、本当に必要な機能かどうかを検討してください。

**シンプルさは機能**: 多機能よりも、限定された機能を確実に、使いやすく提供することを目指します。

開発を進める際は、本ドキュメントと設計書を参照し、プロジェクトの方向性を見失わないようにしてください。

---

**Happy Coding!**
