# 🚨 ビオLP マイルストーン演出完成版 — 引き継ぎ書（RESUME）

**用途：** チャット中断時、新チャットでこのファイルを読めば即座に続行可能。
**最終更新：** 2026-05-12

## 🆕 新しいチャットで使う引き継ぎプロンプト（コピペ用）

```
ビオLP マイルストーン演出続き

🛠 作業ディレクトリ：/Users/apple/Desktop/my-hp/

最初に以下を読んで現在地把握してください：
1. /Users/apple/.claude/CLAUDE.md
2. /Users/apple/Desktop/my-hp/CLAUDE.md
3. /Users/apple/Desktop/my-hp/RESUME.md（このファイル）
4. /Users/apple/.claude/skills/lp-celebration-fx/SKILL.md
5. /Users/apple/.claude/projects/-Users-apple-Desktop-my-hp/memory/feedback_price_milestones_locked.md

【現状】
- ビオLP マイルストーン演出 v3 完成版確定（2026-05-12）
- 最終commit: 186eb4e
- 弾丸射出式 + 料金10段階 + スマホカクつきゼロ + qty=15のみ大マイルストーン

【次にやりたいこと（あれば）】
- 別バージョンのアニメ案を試したい
- もしくは別機能の実装

完成版に戻したい場合: `git checkout 186eb4e -- index.html`

CLAUDE.mdの全体ルール（異変アラート・一問一答・スクショ1枚ずつ）遵守。
```

## 🛠 作業ディレクトリ
`/Users/apple/Desktop/my-hp/`

## 📍 現在地（完成版・安定状態）

**コード状態：** commit `186eb4e` が最終完成版（main ブランチ）
**デプロイ：** Vercel 自動デプロイ済（https://my-hp-xi.vercel.app/）

**未着手の作業：** なし（演出システム完成）

## 🎯 完成済みの仕様

### 個数演出
- qty=1：商品別初回タップメッセージ（6商品マッピング・🐣マスコット・3秒表示）
- qty=2-14：キラキラ＋紙吹雪のみ
- qty=15：ビオくん大感激👏（弾丸射出式・商品カードから打ち上げ）
- qty=5/10/20：廃止済（絶対に復活させない）

### 料金演出（10段階・¥500刻み）
| Level | 金額 | テキスト |
|---|---|---|
| 1 | ¥500 | 本日も感謝🌸 |
| 2 | ¥1000 | 太っ腹😤 |
| 3 | ¥1500 | ビオくん感激✨（"大"なし） |
| 4 | ¥2000 | ビオくん大感謝🎉🎉（"大"あり） |
| 5 | ¥2500 | あっぱれ🔥🔥 |
| 6 | ¥3000 | あんたが大将👏👏 |
| 7 | ¥3500 | ✨💸大太客💸✨ |
| 8 | ¥4000 | 💫🌟今日の救世主🌟💫 |
| 9 | ¥4500 | 🔥⚔️英雄⚔️🔥 |
| 10 | ¥5000 | 神様クラス（既存lock） |

### 弾丸射出式仕様
- 起点：合計バー（料金）/ 商品カード qty（個数）
- 着地：viewport 上から 18%
- アニメ：縦streak + scale 0.18→1.75→1 でバウンド着地
- 着地時：shockwave + 爆発粒18-24個
- カクつき保証ゼロ（filter:blur 一切なし）

### 同時発火時
- 料金演出が常に優先
- 個数演出は完全スキップ（lastQtyLevel だけ更新）

## 📂 必須参照ファイル

- `/Users/apple/Desktop/my-hp/index.html` — メインファイル
- `~/.claude/skills/lp-celebration-fx/SKILL.md` — 演出パターン集（v1+v3）
- `~/.claude/projects/-Users-apple-Desktop-my-hp/memory/feedback_price_milestones_locked.md` — ロックメモリ
- `~/.claude/projects/-Users-apple-Desktop-my-hp/memory/feedback_qty_effects_v2_locked.md` — 個数演出ロック

## 🔑 重要パラメータ

- 公開URL: https://my-hp-xi.vercel.app/
- リポジトリ: yuya-ai/my-hp（GitHub）
- 最終完成版 commit: `186eb4e`
- Vercel 自動デプロイ（main push でデプロイ）

## ⚠️ 絶対やってはいけないこと

1. **¥1500「ビオくん感激」と ¥2000「ビオくん大感謝」を混同しない**（"大"の有無で区別）
2. **filter: blur() を追加しない**（カクつき保証ゼロを破る）
3. **既存Mega関数（L1Mega/L2Mega/L3Mega/L4Mega/L5）の中身は触らない**
4. **個数 qty=5/10/20 を復活させない**
5. **着地位置 18% は変えない**（商品カードを覆わないため）

## 🚀 復元コマンド（緊急時）

```bash
# 完成版に戻す（index.html のみ）
cd /Users/apple/Desktop/my-hp/
git checkout 186eb4e -- index.html

# git status で確認
git status

# 戻したらすぐデプロイ
git add index.html
git commit -m "fix: 完成版 186eb4e に復元"
git push
```

## 📝 進捗ログ

### 2026-05-12 完成版確定
- 弾丸射出式バナー実装
- 料金10段階システム実装
- 個数演出整理（qty=15のみ・qty=5/10/20廃止）
- 同時発火時 個数スキップ
- カクつき保証ゼロ化（filter:blur 完全廃止）
- 着地位置 18%
- 商品別初回タップメッセージ実装
- スキル `lp-celebration-fx` に v3パターン追記
- ロックメモリ最終形に更新
