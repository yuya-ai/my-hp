# 📊 ビオくんチャットボット ログ機能 セットアップガイド

ビオくんとの会話を Google スプレッドシートに自動保存して、オーナーさんが分析できるようにする手順です。

**所要時間：約10分** / **費用：完全無料**

---

## 🎯 完成イメージ

```
[お客様がチャット]
   ↓
[ブラウザJS が自動送信]
   ↓
[Google Apps Script]
   ↓
[Google スプレッドシート]
   ↓
[オーナーさん が好きなときに確認・分析]
```

---

## 📋 STEP 1: Google スプレッドシートを作る（2分）

1. https://sheets.google.com を開く
2. 「**+**」をクリックして新しい空白のシートを作成
3. シート名を「**ビオ チャットボット ログ**」に変更（左上のタイトル）
4. **A1セルから順に**以下を入力（1行目はヘッダー）

```
A1: 日時
B1: セッションID
C1: イベント
D1: ユーザー入力
E1: 検知カテゴリ
F1: ボット応答カテゴリ
G1: 取りこぼし質問
H1: デバイス
I1: 画面幅
```

---

## 📋 STEP 2: Apps Script でログ受け取り口を作る（5分）

1. スプレッドシート上部メニュー「**拡張機能**」→「**Apps Script**」をクリック
2. 新しいタブで開く Apps Script エディタ画面
3. すでに書かれている `function myFunction() {}` を**全部消す**
4. 下のコードを**全部コピペ**:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // データを行に追加
    sheet.appendRow([
      new Date(data.timestamp),                    // A: 日時
      data.sessionId || '',                        // B: セッションID
      data.eventType || '',                        // C: イベント種類
      (data.data && data.data.text) || '',        // D: ユーザー入力
      (data.data && data.data.matchedKey) || '',  // E: 検知カテゴリ
      (data.data && data.data.key) || '',         // F: ボット応答カテゴリ
      (data.data && data.data.missedQuery) || '', // G: 取りこぼし質問
      (data.userAgent || '').substring(0, 100),   // H: デバイス
      data.screenWidth || ''                       // I: 画面幅
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. 上部の「**保存**」アイコン（フロッピー）をクリック
6. 名前を聞かれたら「**ビオ ログ受信**」など何でもOK

---

## 📋 STEP 3: Web Appとして公開（2分）

1. 右上の青ボタン「**デプロイ**」→「**新しいデプロイ**」
2. 設定アイコン⚙️ → 「**ウェブアプリ**」を選択
3. 以下を設定:
   - **説明**: 「ビオ チャットログ」（任意）
   - **次のユーザーとして実行**: 「**自分**」
   - **アクセスできるユーザー**: 「**全員**」← 重要！
4. 「**デプロイ**」ボタンをクリック
5. 「**アクセスを承認**」を求められるので承認
   - ⚠️ 「このアプリは Google で確認されていません」が出たら
     → 「**詳細**」→「**(プロジェクト名) に移動**」→「**許可**」
6. 表示される「**ウェブアプリの URL**」を**コピー**

URLは `https://script.google.com/macros/s/XXXXXXXXX/exec` のような形式

---

## 📋 STEP 4: HPに URL を貼り付け（1分）

1. `index-oinalian.html` を開く
2. ブラウザで `Cmd+F`（検索）で `BIO_LOG_ENDPOINT` を検索
3. 以下の行を見つける:

```javascript
var BIO_LOG_ENDPOINT = "";  // ← ここに Apps Script URL を貼る
```

4. `""` の中に Step 3 でコピーした URL を貼り付け:

```javascript
var BIO_LOG_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXXX/exec";
```

5. ファイル保存（`Cmd+S`）

---

## ✅ STEP 5: 動作確認（1分）

1. ブラウザで HP を開く（強制リロード `Cmd+Shift+R`）
2. ビオくんチャットを開いて何か質問してみる
3. Google スプレッドシートを開いて行が追加されているか確認

→ ログが追加されていたら**設定完了**🎉

---

## 📊 取れるデータ一覧

| 列 | 内容 | 活用例 |
|---|---|---|
| **A: 日時** | いつチャットしたか | 時間帯別アクセス分析 |
| **B: セッションID** | 同じユーザーの会話を紐付け | 1人あたり何問質問したか |
| **C: イベント** | chat_open / faq_tap / user_msg / bot_response / cta_tap / chat_close | お客様の行動分析 |
| **D: ユーザー入力** | お客様が入力した文章 | 生の声 |
| **E: 検知カテゴリ** | キーワード判定結果 | どの質問が多いか |
| **F: ボット応答カテゴリ** | ビオくんが何を答えたか | レスポンス分布 |
| **G: 取りこぼし質問** | 検知できなかった質問 | **新FAQの候補** |
| **H: デバイス** | スマホ/PC/ブラウザ | 端末傾向 |
| **I: 画面幅** | 画面サイズ | レスポンシブ最適化 |

---

## 📈 おすすめ分析パターン

### 🥇 質問頻度ランキング
1. スプレッドシートで **C列（イベント）= "faq_tap"** でフィルタ
2. **F列（応答カテゴリ）** で集計
3. 一番タップされたカテゴリが**お客様が一番気にしていること**

### 🥈 取りこぼし発見
1. **G列（取りこぼし質問）** だけ表示
2. 出てきた質問を**新しいFAQパターン**として追加候補に
3. ビオくんを賢く育てていける

### 🥉 時間帯別アクセス
1. **A列（日時）** で時間別にグループ化
2. ピボットテーブルで時間×件数の集計
3. 一番チャットされる時間に**SNS投稿**するとリーチ最大化

### 🏅 CVR（成約率）測定
1. **C列 = "chat_open"** の数 = チャット開いた人数
2. **C列 = "cta_tap"** の数 = 予約に進んだ人数
3. cta_tap ÷ chat_open = **チャット経由予約率**

### 🚨 クレーム検知
1. **F列 = "complaint"** だけフィルタ
2. **D列（ユーザー入力）** で内容確認
3. **即対応**（オーナーさんが直接対応）

---

## 🔧 よくある質問

### Q. URL貼ったけどログが届かない
- ブラウザで `Cmd+Shift+R` で強制リロードしてみる
- Apps Script のデプロイで「アクセス: 全員」になってるか確認
- ブラウザの開発者ツールで Console エラー確認

### Q. 古いログを削除したい
- スプレッドシート側で行を削除してOK（Apps Scriptは関係なし）

### Q. 個人情報は大丈夫？
- お客様の入力テキストは記録される
- 名前・電話番号は予約フォーム（チャット外）の話なので、ここでは記録されない
- 必要に応じて「会話内容を改善のため記録します」とチャット冒頭で案内可能

### Q. 月にどれくらい貯められる？
- Google スプレッドシートは1シート約**1000万セル**まで
- 月10万会話あっても**100年分**保存可能
- 安心して蓄積OK

### Q. 分析結果を見やすくしたい
- **Looker Studio**（旧Data Studio・無料）と連携可能
- スプレッドシートをデータソースにしてグラフ化できる
- ご希望なら別途案内します

---

## 📅 設定背景

- **作成日**: 2026-05-01
- **目的**: ビオくんチャットボットの会話ログを蓄積し、オーナーが顧客理解・改善に使えるようにする
- **コスト**: 完全無料（Google アカウントのみ必要）
- **送信仕組み**: navigator.sendBeacon でページ閉じた時も確実に送信
- **プライバシー**: BIO_LOG_ENDPOINT が空ならログ送信されない設計
