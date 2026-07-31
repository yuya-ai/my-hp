# 🚨 ビオHP（LP＋チャットボット） — 引き継ぎ書（RESUME）

**用途：** チャット中断時、新チャットでこのファイルを読めば即座に続行可能。
**最終更新：** 2026-07-31 18:35（Git整理・GitHub認証再構築 完了）

## 🆕 新しいチャットで使う引き継ぎプロンプト（コピペ用）

```
ビオHP続き

🛠 作業ディレクトリ：/Users/apple/Desktop/my-hp/

最初に以下を読んで現在地把握してください：
1. /Users/apple/.claude/CLAUDE.md
2. /Users/apple/Desktop/my-hp/CLAUDE.md
3. /Users/apple/Desktop/my-hp/RESUME.md（このファイル）

【現状 2026-07-31】
- 本番は最新反映済（Netlify・Vercel 両方で確認済）
- 未push・未コミットはゼロ（作業ツリー clean・最新 commit ff1c062）
- GitHub認証＝PAT「mac-my-hp」Keychain保存済（次回push は入力不要）

【次にやりたいこと】
（ここに続きでやりたいことを書く）
```

## 🛠 作業ディレクトリ
`/Users/apple/Desktop/my-hp/`

---

## 📍 現在地（2026-07-31）

### ✅ 直近の完了項目

| 日付 | commit | 内容 |
|---|---|---|
| 07-28 | `ca18cd1` | ビオLPを**電話予約のみ**に作り替え（予約フォーム撤去）＋FAQ文言修正＋HP QRコード作成 |
| 07-31 | `2e08f8d` | **アレルギーFAQ→ビオくんチャットボット連動**ボタン（`window.bioAskAllergy`・同一ページ内完結） |
| 07-31 | `ff1c062` | チャットボット関数・LINE素材・設定ファイルをGit管理下に追加／没案PNG約45MBを .gitignore／CLAUDE.md の公開URLを実態に修正 |

### 🟢 状態

- **作業ツリー clean**（未コミット・未pushともにゼロ）
- **本番＝最新**（`bioAskAllergy` の存在を Netlify・Vercel 両方で curl 実確認済）
- **skill保存済**：`lp-phone-only-conversion` / `hp-qr-poster-generator` / `faq-to-chatbot-deeplink`

### 🔜 次フェーズ候補（未着手・優先度順は未決）

1. FAQ→ボット連動の**横展開**（メニュー・アクセス・重箱にも同じボタン／skill `faq-to-chatbot-deeplink` ④参照）
2. 店舗外観写真 `bio/store.jpg` の取得・差し替え（現在は `sign-orange.jpg` で代替）
3. MEO（Google Business Profile）側との情報整合 → `projects/ビオMEO対策/`
4. Search Console のインデックス状況の確認（5月に sitemap 送信済）

---

## 🔑 重要情報

### 公開URL・デプロイ

| 環境 | URL | 役割 | 反映方法 |
|---|---|---|---|
| Netlify | https://scintillating-taffy-31cfc8.netlify.app/ | **チャットボット稼働**（Functions） | `npx --yes netlify-cli@latest deploy --prod --dir=.` |
| Vercel | https://my-hp-xi.vercel.app/ | SEO・Search Console 登録先 | main への push で自動 |

⚠️ 旧 `index-oinalian.html` は**存在しない**（404）。メインファイルは `index.html`。

### GitHub 認証（2026-07-31 再構築）

- 方式：**Fine-grained Personal Access Token**（`gh` CLI・brew は未インストール）
- トークン名：`mac-my-hp` ／ 権限：`my-hp` に Contents=Read and write ＋ Metadata=Read-only
- **有効期限：2026-10-29（木）** ← 切れたら push が `Authentication failed` になるので再発行
- 保存先：macOS Keychain（`credential.helper = osxkeychain`）＝**次回以降 入力不要**
- 再発行URL：https://github.com/settings/personal-access-tokens/new
- 認証情報の消去（トラブル時）：
  ```bash
  printf "protocol=https\nhost=github.com\n\n" | git credential-osxkeychain erase
  ```

### チャットボット（ビオくん）

- サーバー処理：`netlify/functions/chat.js`（Anthropic API）
- APIキー：Netlify 環境変数 `ANTHROPIC_API_KEY`（**コードに書かない**）
- ルーティング：`netlify.toml` の `/api/chat` → `/.netlify/functions/chat`
- 外部起動の公開関数：`window.bioAskAllergy`（`index.html` L6658 付近）

### 店舗情報（コピペ用・MEO/SEOで使う）

- **店名:** いなりとチキン ビオ / Inari to Chicken BIO
- **住所:** 〒901-1206 沖縄県南城市大里字仲間1141（JAアトールむかい）
- **電話:** 098-944-4191（+81-98-944-4191）
- **営業:** 火〜日 9:00〜17:00（売り切れ次第終了）
- **定休:** 月曜日・第4水曜日
- **業態:** テイクアウト専門店 ／ **開業:** 2013年12月 ／ **支払い:** 現金のみ
- **GPS:** 26.1697, 127.7833
- **看板商品:** いなり寿司（¥140）、ガーリックチキン（¥240）、重箱（最大15個入り+¥340）

---

## 📂 必須参照ファイル

### コード/設定
- `index.html` — メインLP（LP＋FAQ＋チャットボット 全部入り・self-contained）
- `netlify/functions/chat.js` / `netlify.toml` — チャットボットのサーバー側
- `sitemap.xml` / `robots.txt` / `google10c31e791d14a0f8.html` — SEO・Search Console
- `rich-menu-source.html` → `bio-rich-menu.jpg` — LINEリッチメニュー（採用版のみ管理）

### スキル
- `~/.claude/skills/faq-to-chatbot-deeplink/skill.md` — FAQ→ボット深リンク（2026-07-31 新規）
- `~/.claude/skills/lp-phone-only-conversion/skill.md` — 予約フォーム撤去→電話予約のみ化
- `~/.claude/skills/hp-qr-poster-generator/skill.md` — 店頭QRポスター生成
- `~/.claude/skills/restaurant-lp-seo/skill.md` — SEOパッケージ
- `~/.claude/skills/lp-celebration-fx/skill.md` — 演出パターン集

### ロックメモリ（絶対に触らない演出）
- `feedback_price_milestones_locked.md` / `feedback_qty_effects_v2_locked.md` / `feedback_banner_position_locked.md`

---

## ⚠️ 絶対やってはいけないこと

1. **¥1500「ビオくん感激」と ¥2000「ビオくん大感謝」を混同しない**（"大"の有無で区別）
2. **filter: blur() を追加しない**（スマホのカクつき保証ゼロを破る）
3. **既存Mega関数（L1Mega/L2Mega/L3Mega/L4Mega/L5）の中身は触らない**
4. **オンライン予約フォームを復活させない**（2026-07-28 に事故対応で電話予約のみ化・Yuya確定）
5. **`ANTHROPIC_API_KEY` をコードに直書きしない**（環境変数のみ）
6. **リッチメニュー試作PNGをGitに入れない**（.gitignore 済・1枚3〜4MB）
7. **JSON-LDの店舗情報を変更する時は SEO テストで syntax 検証**

## 🚀 復元コマンド（緊急時）

```bash
cd /Users/apple/Desktop/my-hp/

# 直前の確定版に戻す
git checkout ff1c062 -- .

# 演出完成版のみに戻す（マイルストーン演出）
git checkout 186eb4e -- index.html

# 戻したら状態確認 → push
git status
git push origin main
```

---

## 📝 進捗ログ

### 2026-07-31（Git整理・認証再構築）
- ✅ 古いKeychain認証をクリア → Fine-grained PAT `mac-my-hp` を発行し push 復旧（2コミット）
- ✅ 未コミット34項目を仕分け：必要分をコミット（`ff1c062`）／没案PNG約45MBは .gitignore
- ✅ CLAUDE.md の公開URLを実態に修正（`index-oinalian.html` は404だった）
- ✅ skill `faq-to-chatbot-deeplink` 新規作成
- ✅ RESUME.md を全面更新（5/12 から停止していたため）

### 2026-07-31 早朝（アレルギーFAQ連動）
- ✅ `window.bioAskAllergy` 実装・FAQに1タップボタン設置（`2e08f8d`）

### 2026-07-28（電話予約のみ化）
- ✅ 予約フォーム撤去・電話予約導線へ再構築／FAQ文言修正／HP QRコード作成（`ca18cd1`）

### 2026-05-12（SEO）
- ✅ JSON-LD 全6商品網羅・sitemap.xml 更新（`aae91ec`）／Search Console プロパティ登録・sitemap送信
