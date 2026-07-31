# 稲荷&チキン Bio（ビオ） HP プロジェクトルール

## このプロジェクトについて
- **場所:** `/Users/apple/Desktop/my-hp/`
- **メインファイル:** `index.html`（最新の公開版・CSS・JS込みの self-contained）
- **画像フォルダ:** `bio/`
- **公開URL（Netlify・チャットボット稼働）:** https://scintillating-taffy-31cfc8.netlify.app/
- **公開URL（Vercel・SEO/Search Console 登録先）:** https://my-hp-xi.vercel.app/

## デプロイについて

- **手動デプロイ**：ユーザーが「デプロイして」「公開して」と明示した時のみ実行する
- デプロイコマンド: `npx --yes netlify-cli@latest deploy --prod --dir=.`
- Vercel は main への push で自動デプロイ

## チャットボット（ビオくん）

- サーバー処理: `netlify/functions/chat.js`（Anthropic API 呼び出し）
- APIキーは Netlify の環境変数 `ANTHROPIC_API_KEY`（コードには書かない）
- ルーティング: `netlify.toml` の `/api/chat` → `/.netlify/functions/chat`

## 画像ファイル一覧

| ファイル名 | 内容 |
|---|---|
| `bio/menu-inari.jpg` | いなり寿司の写真 |
| `bio/menu-chicken.jpg` | ガーリックチキンの写真 |
| `bio/menu-set.jpg` | いなり＋チキンセットの写真 |
| `bio/menu-inari-chicken.jpg` | いなり＋チキンのアップ写真 |
| `bio/sign-orange.jpg` | オレンジの看板写真 |
| `bio/open-sign.jpg` | OPENサインの写真 |

※ `store.jpg`（店舗外観）は未取得。現在は `sign-orange.jpg` で代替中。
　 外観写真が入手できたら `bio/store.jpg` で保存するだけで自動反映。

## カラー変更方法
`index.html` の先頭 `:root {}` 内の1行だけ変えればOK:
```css
--accent: #FF6B2B;   ← この色を変えると全体のアクセントカラーが変わる
```

## 動画
- Loom埋め込みURL: `https://www.loom.com/embed/f4e6e53f6130417fa7362dff938c1ee2`

## 修正済みの問題

| 修正日 | 症状 | 修正内容 |
|---|---|---|
| 2026-04-13 | Sceneギャラリーの右端画像が見切れる | 画像サイズを縮小（odd:200×280px / even:170×230px） |
| 2026-04-13 | Storyセクションのスマホ2列表示で右画像見切れ | `@media(max-width:767px)` に `grid-template-columns:1fr` を追加 |
| 2026-04-13 | menu-inari-chicken.jpg が「書類」と表示 | ファイル名末尾のスペースを削除 |

## 今後の予定
- [ ] チャットボット機能の追加（STEP 4）
- [ ] 店舗外観写真（store.jpg）の取得・差し替え
- [ ] 黒板メニュー表スタイルの別バージョン（index-blackboard.html）作成
