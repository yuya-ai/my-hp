/**
 * 🌸 ビオ予約リマインダー GAS スクリプト
 *
 * 機能:
 *   1. doPost(e)         — Vercel から予約データを受け取り Sheets に保存
 *   2. sendReminders()   — 毎時1回トリガー実行・条件マッチで LINE Push 送信
 *
 * 通知ロジック:
 *   ・前日/当日予約 (diffDays ≤ 1) → 受取時刻の1時間前に「まもなくお時間です」
 *   ・2日以上前予約 (diffDays ≥ 2) → 受取前日18-22時の間に「明日です」
 *
 * セットアップ手順:
 *   1) Google スプレッドシートを新規作成
 *      - シート名「予約一覧」
 *      - 1行目に下記10列のヘッダーを入力（A〜J）
 *        予約日時 | 受取日 | 受取時刻 | 顧客名 | 電話 | userId | アイテム | 合計 | 通知ステータス | 通知種別
 *   2) [拡張機能] → [Apps Script] でこのコード全文をコピペ
 *   3) [プロジェクトの設定] → [スクリプトプロパティ] で以下を追加:
 *      キー: LINE_CHANNEL_ACCESS_TOKEN
 *      値: （Vercel 環境変数と同じ LINE トークン）
 *   4) [デプロイ] → [新しいデプロイ] → 種類「ウェブアプリ」
 *      実行ユーザー: 自分 / アクセス権: 全員
 *      → 発行された URL を Vercel 環境変数 GAS_WEBHOOK_URL に設定
 *   5) [トリガー] → [トリガーを追加]
 *      関数: sendReminders / イベント: 時間主導型 / 時間ベースのタイマー: 1時間おき
 */

const SHEET_NAME = '予約一覧';
const LINE_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
const STORE_PHONE = '098-944-4191';
const STORE_ADDR = '〒901-1206 沖縄県南城市大里字仲間1141\n（JAアトールむかい）';

/* ===== Webhook 受信（Vercel から呼ばれる） ===== */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('シート「' + SHEET_NAME + '」が見つかりません');
    }
    sheet.appendRow([
      data.reservedAt || new Date().toISOString(),
      data.pickupDate || '',
      data.pickupTime || '',
      data.name || '',
      data.phone || '',
      data.userId || '',
      data.items || '',
      data.total || '',
      '', // 通知ステータス（"sent" / "expired" / "" = 未送信）
      '', // 通知種別（"1h_before" / "day_before"）
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error('doPost error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ===== リマインダー送信（時間トリガーで毎時実行） =====
 * 防御設計（2026-05-17 改修・「JavaScriptランタイムが予期せず終了」対策）:
 *   1) 全体を try/catch でラップ → 想定外例外でもエラーメール飛ばない
 *   2) status 列が空欄の行だけ処理対象に絞る → 行数膨張による6分タイムアウト回避
 *   3) 1行ごとに try/catch で隔離 → 1行のエラーが他行を止めない
 *   4) 4分超過したら次回実行に持ち越し → タイムアウト回避
 */
function sendReminders() {
  const startMs = Date.now();
  const TIMEOUT_MS = 4 * 60 * 1000; // 4分（GAS上限6分の余裕）
  let sentCount = 0;
  let expiredCount = 0;
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('シート「' + SHEET_NAME + '」が見つかりません');
      return;
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('sendReminders: データ無し（ヘッダーのみ）');
      return;
    }

    const data = sheet.getDataRange().getValues();
    const now = new Date();

    for (let i = 1; i < data.length; i++) {
      // タイムアウト防御：4分超過したら残りは次回に持ち越し
      if (Date.now() - startMs > TIMEOUT_MS) {
        console.warn('sendReminders: 4分タイムアウト直前で中断・残' + (data.length - i) + '行は次回処理');
        break;
      }

      try {
        const row = data[i];
        const status = row[8];

        // 送信済み or expired は即スキップ（ループ高速化の要）
        if (status) { skippedCount++; continue; }

        const reservedAtStr = row[0];
        const pickupDateRaw = row[1];
        const pickupTimeRaw = String(row[2] || '');
        const name = row[3];
        const userId = row[5];
        const items = row[6];

        if (!userId || !pickupDateRaw || !pickupTimeRaw) { skippedCount++; continue; }

        // reservedAt パース
        const reservedAt = new Date(reservedAtStr);
        if (isNaN(reservedAt.getTime())) {
          console.error('行' + (i + 1) + ' reservedAt パース失敗:', reservedAtStr);
          continue;
        }

        // 受取時刻パース（"13:30" or "13:30 〜 14:00"）
        const timeMatch = pickupTimeRaw.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) {
          console.error('行' + (i + 1) + ' 受取時刻パース失敗:', pickupTimeRaw);
          continue;
        }
        const pickupH = Number(timeMatch[1]);
        const pickupMin = Number(timeMatch[2]);

        // 受取日パース：Date型 / "2026-05-15" / "Fri May 22 2026..." / "5月13日(水)" 吸収
        let pickupDateObj = null;
        if (pickupDateRaw && typeof pickupDateRaw.getTime === 'function') {
          pickupDateObj = pickupDateRaw;
        } else {
          const raw = String(pickupDateRaw);
          const tryDate = new Date(raw);
          if (!isNaN(tryDate.getTime())) {
            pickupDateObj = tryDate;
          } else {
            const jp = raw.match(/(\d{1,2})月(\d{1,2})日/);
            if (jp) {
              pickupDateObj = new Date(reservedAt.getFullYear(), Number(jp[1]) - 1, Number(jp[2]));
            }
          }
        }
        if (!pickupDateObj || isNaN(pickupDateObj.getTime())) {
          console.error('行' + (i + 1) + ' 受取日パース失敗:', pickupDateRaw);
          continue;
        }
        const pickupY = pickupDateObj.getFullYear();
        const pickupM = pickupDateObj.getMonth() + 1;
        const pickupD = pickupDateObj.getDate();
        const pickupDateStr = Utilities.formatDate(pickupDateObj, 'Asia/Tokyo', 'yyyy-MM-dd');
        const pickupDateTime = new Date(pickupY, pickupM - 1, pickupD, pickupH, pickupMin);

        // 受取時刻を過ぎたら expired マーク
        if (now > pickupDateTime) {
          sheet.getRange(i + 1, 9).setValue('expired');
          expiredCount++;
          continue;
        }

        // 予約日と受取日の日数差（時刻無視・日付ベース）
        const reservedDateOnly = new Date(reservedAt.getFullYear(), reservedAt.getMonth(), reservedAt.getDate());
        const pickupDateOnly = new Date(pickupY, pickupM - 1, pickupD);
        const diffDays = Math.round((pickupDateOnly - reservedDateOnly) / (1000 * 60 * 60 * 24));

        let shouldSend = false;
        let reminderType = '';
        let message = '';

        if (diffDays <= 1) {
          // 当日 or 前日予約 → 受取時刻の1時間前
          const sendWindowStart = new Date(pickupDateTime.getTime() - 60 * 60 * 1000);
          if (now >= sendWindowStart && now < pickupDateTime) {
            shouldSend = true;
            reminderType = '1h_before';
            message = build1hBeforeMessage(name, pickupTimeRaw, items);
          }
        } else {
          // 2日以上前予約 → 受取前日18-22時に送信
          const dayBefore18 = new Date(pickupY, pickupM - 1, pickupD - 1, 18, 0);
          const dayBefore22 = new Date(pickupY, pickupM - 1, pickupD - 1, 22, 0);
          if (now >= dayBefore18 && now < dayBefore22) {
            shouldSend = true;
            reminderType = 'day_before';
            message = buildDayBeforeMessage(name, pickupDateStr, pickupTimeRaw, items);
          }
        }

        processedCount++;

        if (shouldSend) {
          try {
            pushLine(userId, message);
            sheet.getRange(i + 1, 9).setValue('sent');
            sheet.getRange(i + 1, 10).setValue(reminderType);
            sentCount++;
          } catch (pushErr) {
            console.error('行' + (i + 1) + ' Push失敗:', pushErr);
            errorCount++;
          }
        }
      } catch (rowErr) {
        // 1行のエラーが他行を止めないよう個別隔離
        console.error('行' + (i + 1) + ' 処理中に例外:', rowErr);
        errorCount++;
      }
    }

    const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
    console.log('sendReminders 完了 (' + elapsed + 's): '
      + 'sent=' + sentCount + ' / expired=' + expiredCount
      + ' / processed=' + processedCount + ' / skipped=' + skippedCount
      + ' / errors=' + errorCount);
  } catch (fatalErr) {
    // 全体を包む最後の砦：ここに来たらエラーメールではなく console.error に逃がす
    console.error('sendReminders 致命的エラー（再発防止のため握り潰し）:', fatalErr);
  }
}

/* ===== メッセージビルダー ===== */
function build1hBeforeMessage(name, time, items) {
  return (name || 'お客様') + '様 🌸\n\n' +
    'まもなくお受け取りのお時間です✨\n' +
    'お受け取り時刻 1時間前のご案内です🐣💕\n\n' +
    '━━━━━━━━━━━━━━━\n' +
    '⏰ お受け取り：' + time + '\n' +
    '🍱 ご注文：' + items + '\n\n' +
    '📍 いなりとチキン ビオ\n' +
    STORE_ADDR + '\n' +
    '📞 ' + STORE_PHONE + '\n\n' +
    '🚫 お支払い方法：現金のみ\n' +
    '━━━━━━━━━━━━━━━\n\n' +
    '🚗 お気をつけてお越しください💛\n' +
    'ビオ一同、心よりお待ちしております🌸';
}

function buildDayBeforeMessage(name, date, time, items) {
  return (name || 'お客様') + '様 🌸\n\n' +
    '明日のご予約のリマインドです🐣✨\n\n' +
    '━━━━━━━━━━━━━━━\n' +
    '📅 お受け取り日：' + date + '\n' +
    '⏰ お受け取り時刻：' + time + '\n' +
    '🍱 ご注文：' + items + '\n\n' +
    '📍 いなりとチキン ビオ\n' +
    STORE_ADDR + '\n' +
    '📞 ' + STORE_PHONE + '\n\n' +
    '🚫 お支払い方法：現金のみ\n' +
    '━━━━━━━━━━━━━━━\n\n' +
    '明日、お会いできるのを楽しみにしております💛\n' +
    'ビオ一同🌸';
}

/* ===== LINE Push API ===== */
function pushLine(userId, text) {
  if (!LINE_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN が未設定です（スクリプトプロパティ）');
  }
  const res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + LINE_TOKEN },
    payload: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text: text }],
    }),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code !== 200) {
    throw new Error('LINE Push failed: ' + code + ' ' + res.getContentText());
  }
}

/* ===== テスト用: シートに手動で1行追加して動作確認 ===== */
function testSendReminders() {
  // シートに1行追加してから sendReminders を呼んで挙動確認
  sendReminders();
}
