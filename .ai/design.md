# Blur Them All - 設計書

## 1. プロジェクト概要

### 1.1 目的
ブラウザ上で動作する、モザイク・ブラー処理に特化したシンプルな画像編集ツールを提供する。

### 1.2 主な特徴
- 完全クライアントサイド実装（バックエンド不要）
- プライバシー重視（画像データは外部に送信されない）
- シンプルで直感的なUI
- ブラウザストレージによる作業の自動保存

## 2. 技術スタック

### 2.1 フロントエンド
- **TypeScript**: 型安全性とコード品質の向上
- **Vue.js 3**: リアクティブなUI構築（Composition API使用）
- **Vite**: 高速な開発サーバーとビルドツール
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク

### 2.2 画像処理
- **HTML5 Canvas API**: 画像の描画・編集処理
- **File API**: ローカルファイルの読み込み
- **Blob API**: 編集済み画像のダウンロード

### 2.3 ストレージ
- **IndexedDB**: 画像データと編集履歴の永続化
- **LocalStorage**: アプリケーション設定の保存

### 2.4 デプロイメント
- **Apache 2.4**: 静的ファイルホスティング
- **SPA対応**: .htaccessによるルーティング設定

## 3. システムアーキテクチャ

### 3.1 全体構成
```
┌─────────────────────────────────────┐
│         ブラウザ（クライアント）        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      Vue.js Application       │ │
│  │  ┌─────────────────────────┐  │ │
│  │  │   UI Components        │  │ │
│  │  │  - FileUploader        │  │ │
│  │  │  - Canvas Editor       │  │ │
│  │  │  - Toolbar             │  │ │
│  │  │  - PropertyPanel       │  │ │
│  │  └─────────────────────────┘  │ │
│  │  ┌─────────────────────────┐  │ │
│  │  │   Core Services        │  │ │
│  │  │  - ImageProcessor      │  │ │
│  │  │  - ToolManager         │  │ │
│  │  │  - StorageService      │  │ │
│  │  │  - ExportService       │  │ │
│  │  └─────────────────────────┘  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Browser Storage            │ │
│  │  - IndexedDB (画像データ)      │ │
│  │  - LocalStorage (設定)        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 3.2 レイヤー構成

#### プレゼンテーション層
- Vue.jsコンポーネント
- Tailwind CSSによるスタイリング
- ユーザーインタラクションの処理

#### ビジネスロジック層
- 画像編集処理
- ツール操作の制御
- データの検証・変換

#### データアクセス層
- IndexedDBへのアクセス
- LocalStorageへのアクセス
- ファイルI/O処理

## 4. 機能設計

### 4.1 機能一覧

#### 4.1.1 画像管理機能
- **画像の読み込み**
  - ファイルドラッグ&ドロップ対応
  - ファイル選択ダイアログ
  - 対応形式: JPEG, PNG, GIF, WebP
- **画像のリサイズ**
  - 幅・高さの指定
  - アスペクト比の保持/非保持
  - プリセットサイズ選択
- **画像の保存**
  - PNG形式でのエクスポート
  - ファイル名の指定
  - 品質設定（該当する場合）

#### 4.1.2 編集機能

##### モザイク・ブラー処理
- **矩形選択**
  - マウスドラッグによる範囲指定
  - 座標・サイズの数値入力
- **モザイク処理**
  - ピクセレーション（ブロックサイズ指定可能）
  - プレビュー機能
- **ブラー処理**
  - ガウシアンブラー
  - ブラー強度の調整
  - プレビュー機能

##### ペン（注釈）機能
- **描画**
  - 自由曲線の描画
  - 線の色選択（カラーピッカー）
  - 線の太さ調整（1-20px）
  - スムージング処理
- **消しゴム**
  - 描画した注釈の削除（Undo機能で代替可）

##### 矢印配置機能
- **矢印の作成**
  - 始点・終点のドラッグ操作
  - 矢印スタイル設定
    - 色選択
    - 線の太さ
    - 矢印ヘッドのサイズ
- **矢印の編集**
  - 選択・移動
  - サイズ変更
  - 削除

#### 4.1.3 操作管理機能
- **Undo/Redo**
  - 操作履歴の管理（最大30ステップ）
  - キーボードショートカット対応（Ctrl+Z / Ctrl+Y）
- **自動保存**
  - 編集内容の定期的な保存（30秒間隔）
  - ブラウザストレージへの保存
- **セッション復元**
  - ページ再読み込み時の作業内容復元

### 4.2 ユーザーインターフェース設計

#### 4.2.1 レイアウト
```
┌─────────────────────────────────────────────┐
│  Header (Title, Settings, Export)           │
├────────┬────────────────────────────────────┤
│        │                                    │
│ Tool   │                                    │
│ Bar    │        Canvas Area                 │
│        │      (編集中の画像)                  │
│ - File │                                    │
│ - Pen  │                                    │
│ - Arrow│                                    │
│ - Blur │                                    │
│ - Mosaic                                    │
│ - Resize                                    │
│        │                                    │
├────────┼────────────────────────────────────┤
│ Properties Panel                            │
│ (選択中のツールのプロパティ)                   │
│ - 色、太さ、サイズなど                         │
└─────────────────────────────────────────────┘
```

#### 4.2.2 ツールバー
- アイコンベースのツール選択
- アクティブツールのハイライト
- ツールチップによる機能説明

#### 4.2.3 プロパティパネル
- 選択中のツールに応じた動的な表示
- スライダー、カラーピッカーなどの入力コンポーネント
- リアルタイムプレビュー

### 4.3 データモデル

#### 4.3.1 Image State
```typescript
interface ImageState {
  id: string;              // ユニークID
  originalFile: File;      // オリジナルファイル
  currentImageData: ImageData;  // 現在の画像データ
  width: number;           // 画像幅
  height: number;          // 画像高さ
  layers: Layer[];         // レイヤー配列
  history: HistoryEntry[]; // 編集履歴
  lastModified: Date;      // 最終更新日時
}
```

#### 4.3.2 Layer
```typescript
interface Layer {
  id: string;
  type: 'pen' | 'arrow' | 'blur' | 'mosaic';
  data: LayerData;
  visible: boolean;
  locked: boolean;
}

// ペンレイヤー
interface PenLayerData {
  paths: Path[];
  color: string;
  width: number;
}

// 矢印レイヤー
interface ArrowLayerData {
  arrows: Arrow[];
}

// ブラー/モザイクレイヤー
interface BlurLayerData {
  regions: Region[];
  strength: number;
}
```

#### 4.3.3 Tool State
```typescript
interface ToolState {
  activeTool: ToolType;
  penSettings: {
    color: string;
    width: number;
  };
  arrowSettings: {
    color: string;
    width: number;
    headSize: number;
  };
  blurSettings: {
    strength: number;
  };
  mosaicSettings: {
    blockSize: number;
  };
}
```

## 5. コアサービス設計

### 5.1 ImageProcessor Service
画像処理の中核を担うサービス

```typescript
class ImageProcessor {
  // 画像の読み込み
  async loadImage(file: File): Promise<ImageState>

  // リサイズ処理
  async resize(imageState: ImageState, width: number, height: number): Promise<ImageState>

  // モザイク処理
  applyMosaic(imageData: ImageData, region: Region, blockSize: number): ImageData

  // ブラー処理
  applyBlur(imageData: ImageData, region: Region, strength: number): ImageData

  // レイヤーの合成
  composeLayers(layers: Layer[], baseImage: ImageData): ImageData

  // PNG形式でエクスポート
  async exportToPNG(imageState: ImageState): Promise<Blob>
}
```

### 5.2 ToolManager Service
ツールの状態管理と操作制御

```typescript
class ToolManager {
  // ツールの選択
  selectTool(tool: ToolType): void

  // ペン描画
  startPenStroke(x: number, y: number): void
  continuePenStroke(x: number, y: number): void
  endPenStroke(): void

  // 矢印配置
  startArrow(x: number, y: number): void
  updateArrow(x: number, y: number): void
  finalizeArrow(): void

  // 矩形選択（ブラー/モザイク用）
  startSelection(x: number, y: number): void
  updateSelection(x: number, y: number): void
  applyEffect(effectType: 'blur' | 'mosaic'): void
}
```

### 5.3 StorageService
データの永続化を管理

```typescript
class StorageService {
  // 画像状態の保存
  async saveImageState(imageState: ImageState): Promise<void>

  // 画像状態の読み込み
  async loadImageState(id: string): Promise<ImageState | null>

  // 最新のセッションを取得
  async getLatestSession(): Promise<ImageState | null>

  // 設定の保存・読み込み
  saveSettings(settings: AppSettings): void
  loadSettings(): AppSettings

  // ストレージのクリア
  async clearStorage(): Promise<void>
}
```

### 5.4 HistoryManager
Undo/Redo機能の管理

```typescript
class HistoryManager {
  private maxHistorySize = 30;
  private history: HistoryEntry[] = [];
  private currentIndex = -1;

  // 新しい編集を記録
  push(state: ImageState): void

  // Undo
  undo(): ImageState | null

  // Redo
  redo(): ImageState | null

  // 履歴のクリア
  clear(): void

  // Undo/Redoの可否判定
  canUndo(): boolean
  canRedo(): boolean
}
```

## 6. 画像処理アルゴリズム

### 6.1 モザイク処理
```
1. 指定された矩形領域を抽出
2. 領域をブロックサイズごとに分割
3. 各ブロックの平均色を計算
4. ブロック全体を平均色で塗りつぶす
5. 元画像に合成
```

実装方針：
- Canvas APIの `getImageData` / `putImageData` を使用
- ブロックサイズは4px〜32pxの範囲で調整可能

### 6.2 ブラー処理
```
1. 指定された矩形領域を抽出
2. ガウシアンブラーフィルタを適用
3. 元画像に合成
```

実装方針：
- Canvas2Dの `filter` プロパティ (`blur()`) を使用
- または、カスタムコンボリューション行列を実装
- ブラー強度は1px〜20pxの範囲で調整可能

### 6.3 ペン描画
```
1. マウスダウン時に開始点を記録
2. マウスムーブ時に前の点から現在点へ線を描画
3. ベジェ曲線でスムージング
4. マウスアップ時に描画を確定
```

実装方針：
- Canvas2Dの `beginPath`, `moveTo`, `lineTo`, `stroke` を使用
- スムージングには `quadraticCurveTo` を使用

### 6.4 矢印描画
```
1. 始点と終点の座標を取得
2. 矢印の線を描画
3. 終点に矢印ヘッドを描画（三角形）
```

実装方針：
- 線: Canvas2Dの `moveTo`, `lineTo`, `stroke`
- 矢印ヘッド: 三角形を `fill` で描画
- 角度計算にMath.atan2を使用

## 7. ファイル・ディレクトリ構成

```
blur-them-all/
├── public/                 # 静的ファイル
│   └── favicon.ico
├── src/
│   ├── main.ts            # エントリーポイント
│   ├── App.vue            # ルートコンポーネント
│   ├── components/        # UIコンポーネント
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   ├── Toolbar.vue
│   │   │   └── PropertyPanel.vue
│   │   ├── canvas/
│   │   │   ├── CanvasEditor.vue
│   │   │   └── CanvasControls.vue
│   │   ├── tools/
│   │   │   ├── ColorPicker.vue
│   │   │   ├── WidthSlider.vue
│   │   │   └── SizeInput.vue
│   │   └── common/
│   │       ├── Button.vue
│   │       ├── IconButton.vue
│   │       └── Modal.vue
│   ├── composables/       # Vue Composition API
│   │   ├── useCanvas.ts
│   │   ├── useTools.ts
│   │   ├── useHistory.ts
│   │   └── useStorage.ts
│   ├── services/          # コアサービス
│   │   ├── ImageProcessor.ts
│   │   ├── ToolManager.ts
│   │   ├── StorageService.ts
│   │   ├── HistoryManager.ts
│   │   └── ExportService.ts
│   ├── types/             # TypeScript型定義
│   │   ├── image.ts
│   │   ├── tool.ts
│   │   ├── layer.ts
│   │   └── history.ts
│   ├── utils/             # ユーティリティ関数
│   │   ├── canvas.ts
│   │   ├── geometry.ts
│   │   └── file.ts
│   ├── constants/         # 定数定義
│   │   └── index.ts
│   └── assets/            # 画像・アイコン
│       └── icons/
├── apache/                # Apache設定
│   ├── .htaccess
│   └── httpd.conf.example
├── .ai/                   # AI関連ドキュメント
│   ├── design.md          # 本ドキュメント
│   └── logs/
├── AGENTS.md              # AI作業者向け指針
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 8. データフロー

### 8.1 画像読み込みフロー
```
1. ユーザーがファイルを選択
2. File APIでファイルを読み込み
3. ImageProcessorでImageStateを生成
4. StorageServiceに自動保存
5. Canvasに描画
```

### 8.2 編集操作フロー
```
1. ユーザーがツールを選択
2. Canvasでマウス操作
3. ToolManagerが操作を処理
4. ImageStateを更新
5. HistoryManagerに履歴を追加
6. Canvasを再描画
7. StorageServiceに自動保存
```

### 8.3 エクスポートフロー
```
1. ユーザーがエクスポートボタンをクリック
2. すべてのレイヤーを合成
3. ExportServiceでPNG Blobを生成
4. ダウンロードリンクを生成
5. ブラウザのダウンロード機能を起動
```

## 9. ストレージ戦略

### 9.1 IndexedDB
- **データベース名**: `BlurThemAllDB`
- **オブジェクトストア**:
  - `images`: 画像状態の保存
    - key: imageId
    - value: ImageState
  - `thumbnails`: サムネイル画像（将来的な拡張用）

### 9.2 LocalStorage
- **キー**:
  - `bta_settings`: アプリケーション設定
  - `bta_last_session_id`: 最後のセッションID

### 9.3 自動保存
- 編集操作後30秒でIndexedDBに保存
- デバウンス処理により連続操作時の無駄な保存を防止

### 9.4 ストレージ容量管理
- 画像データは圧縮して保存
- 古いセッションは一定期間後に削除（設定可能）
- ストレージ上限警告の表示

## 10. パフォーマンス最適化

### 10.1 画像処理
- 大きな画像はリサイズしてから処理
- Web Workerでの重い処理のオフロード（将来的な拡張）
- OffscreenCanvasの活用（対応ブラウザのみ）

### 10.2 レンダリング
- Vue.jsの仮想DOMによる効率的な更新
- Canvas再描画の最小化（dirty領域のみ更新）
- requestAnimationFrameの活用

### 10.3 メモリ管理
- 不要なImageDataの即時解放
- 履歴の上限設定（30ステップ）
- サムネイルのサイズ制限

## 11. デプロイメント

### 11.1 ビルド
```bash
npm run build
```
- `dist/` ディレクトリに静的ファイルが生成される
- コード分割とツリーシェイキング
- アセットの最適化・圧縮

### 11.2 Apache 2.4 設定

#### .htaccess
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Gzip圧縮
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# キャッシュ設定
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

### 11.3 セキュリティ設定
```apache
# XSSプロテクション
Header set X-XSS-Protection "1; mode=block"

# クリックジャッキング対策
Header always append X-Frame-Options SAMEORIGIN

# Content-Type sniffing防止
Header set X-Content-Type-Options nosniff
```

## 12. ブラウザ対応

### 12.1 対応ブラウザ
- Chrome/Edge: 最新版および1つ前のメジャーバージョン
- Firefox: 最新版および1つ前のメジャーバージョン
- Safari: 最新版および1つ前のメジャーバージョン

### 12.2 必要なブラウザAPI
- Canvas API
- File API
- Blob API
- IndexedDB
- LocalStorage

### 12.3 フォールバック
- IndexedDB非対応時はLocalStorageを使用（容量制限あり）
- Canvas filter非対応時はカスタム実装にフォールバック

## 13. テスト戦略

### 13.1 ユニットテスト
- Vitestを使用
- コアサービスのテスト
- ユーティリティ関数のテスト
- カバレッジ80%以上を目標

### 13.2 コンポーネントテスト
- Vue Test Utilsを使用
- 主要コンポーネントの動作確認
- イベント処理のテスト

### 13.3 E2Eテスト
- Playwrightを使用（オプション）
- 主要なユーザーフロー
  - 画像読み込み
  - モザイク処理
  - エクスポート

### 13.4 手動テスト
- 各種ブラウザでの動作確認
- パフォーマンステスト（大きな画像での処理速度）
- ストレージ容量テスト

## 14. 将来的な拡張可能性

### 14.1 機能拡張
- テキスト注釈の追加
- 複数画像の一括処理
- レイヤー管理UI
- フィルター機能の追加
- ショートカットキーのカスタマイズ

### 14.2 技術的拡張
- PWA化（オフライン対応）
- Web Worker による並列処理
- WebAssembly による高速化
- クラウドストレージ連携（オプション）

### 14.3 UX改善
- チュートリアルの追加
- テンプレート機能
- プリセット保存
- タッチデバイス対応の強化

## 15. 開発フェーズ

### Phase 1: 基盤構築
- プロジェクトセットアップ
- 基本的なファイル構成
- 画像読み込み機能
- Canvas描画基盤

### Phase 2: コア機能実装
- モザイク処理
- ブラー処理
- ペン描画
- 矢印配置

### Phase 3: UI/UX実装
- ツールバー
- プロパティパネル
- レスポンシブデザイン
- アクセシビリティ対応

### Phase 4: データ管理
- IndexedDB統合
- 自動保存機能
- Undo/Redo機能

### Phase 5: エクスポート・デプロイ
- PNG エクスポート
- Apache設定
- 最適化・テスト

### Phase 6: 改善・文書化
- パフォーマンスチューニング
- ドキュメント整備
- ユーザーガイド作成

## 16. まとめ

本設計書は、モザイク・ブラー処理に特化したシンプルで使いやすい画像編集ツールの実装方針を示している。完全クライアントサイドでの動作により、ユーザーのプライバシーを保護しつつ、必要十分な機能を提供する。

TypeScript、Vue.js、Viteといったモダンな技術スタックを採用することで、保守性が高く拡張可能なコードベースを構築する。また、ブラウザストレージを活用した自動保存機能により、ユーザー体験を向上させる。

段階的な開発アプローチにより、各フェーズで動作する成果物を提供しながら、最終的に完成度の高いツールを実現する。
