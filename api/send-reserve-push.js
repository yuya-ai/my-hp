const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
const GAS_WEBHOOK_URL = process.env.GAS_WEBHOOK_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const RESERVE_URL = 'https://liff.line.me/2010011597-5zLtfRAm';
const PHONE = '098-944-4191';

// 月間メッセージ枠切れ等の重大エラー時に Yuya にメール通知
// RESEND_API_KEY と ADMIN_EMAIL の両方が設定されている時のみ動作
async function sendAlertEmail(subject, body) {
  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.warn('Resend not configured (set RESEND_API_KEY and ADMIN_EMAIL to enable alerts)');
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bio Alert <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('Resend send failed:', res.status, t);
    }
  } catch (e) {
    console.error('Resend send exception:', e);
  }
}

function decodePayload(b64) {
  const std = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = std.length % 4;
  const padded = pad ? std + '='.repeat(4 - pad) : std;
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
}

function buildReservationMessage(p) {
  const name = p.n || 'お客様';
  const phone = p.p || '';
  const date = p.d || '';
  const time = p.t || '';
  const items = p.i || '';
  const total = p.tt || '';
  const saved = p.s === 1 || p.s === true || p.s === '1';

  return `${name}様

ご予約ありがとうございます🌸${saved ? '☺️' : '✨'}
ご注文、しっかり承りました↓

━━━━━━━━━━━━━━━
📅 ご予約日時
　${date} ${time}

🍱 ご注文内容
　${items}

💴 合計金額
　${total}

☎️ ビオの電話番号🐣
　${PHONE}

📍 店舗：いなりとチキン ビオ
〒901-1206 沖縄県南城市大里字仲間1141
（JAアトールむかい）

🚫 お支払い方法：現金のみ

🌺 ${name}様にお会いできるのを、ビオ一同、心から楽しみにしております${saved ? '✨😊' : '！'}
━━━━━━━━━━━━━━━


━━━━━━━━━━━━━━━

✨🐣 追加予約 & 次回予約 🌸✨

👇 こちらをタップ 👇

📲 ${RESERVE_URL}

━━━━━━━━━━━━━━━`;
}

function buildAdminMessage(p) {
  const name = p.n || 'お客様';
  const phone = p.p || '';
  const date = p.d || '';
  const time = p.t || '';
  const items = p.i || '';
  const total = p.tt || '';

  return `🔔 新しいご予約が入りました！
━━━━━━━━━━━━━━━

👤 ${name} 様
📞 ${phone}
📅 ${date}
⏰ ${time}
🍱 ${items}
💴 ${total}

━━━━━━━━━━━━━━━
✅ お客様にも予約完了通知を
　送信済です🙆‍♂️



⚠️ 売り切れ時の対応⚠️
①ご注文に売り切れ商品があるか確認
　↓
②お客様にお電話☎️
　↓
③下記をお伝え
「ご注文頂いた商品が
　只今売り切れです🙇‍♀️」
よろしくお願いします💦`;
}

async function pushMessage(userId, text) {
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text }],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Push API ${res.status}: ${errText}`);
    err.status = res.status;
    throw err;
  }
}

async function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = await getJsonBody(req);
    const userId = body && body.userId;
    const payloadB64 = body && body.payload;
    if (!userId || !payloadB64) {
      return res.status(400).json({ error: 'missing userId or payload' });
    }

    let payload;
    try {
      payload = decodePayload(payloadB64);
    } catch (e) {
      console.error('decodePayload failed:', e);
      return res.status(400).json({ error: 'invalid payload' });
    }

    const text = buildReservationMessage(payload);
    await pushMessage(userId, text);

    // 管理者にも通知（環境変数 ADMIN_USER_ID が設定されていれば）
    if (ADMIN_USER_ID) {
      try {
        await pushMessage(ADMIN_USER_ID, buildAdminMessage(payload));
      } catch (adminErr) {
        console.error('admin push failed (customer push succeeded):', adminErr);
      }
    }

    // GAS Webhook へ予約データ転送（Sheets保存＋リマインダー予約用）
    // Vercel サーバレスは return 後に非同期処理が中断されるため await 必須
    if (GAS_WEBHOOK_URL) {
      try {
        await fetch(GAS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            reservedAt: new Date().toISOString(),
            name: payload.n || '',
            phone: payload.p || '',
            pickupDate: payload.dIso || payload.d || '',
            pickupTime: payload.t || '',
            items: payload.i || '',
            total: payload.tt || '',
          }),
        });
      } catch (gasErr) {
        console.error('GAS webhook failed:', gasErr);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('send-reserve-push error:', e);
    const status = e.status || 500;

    // 月間メッセージ枠切れ（429）の場合、Yuyaにメールアラート送信
    // 同一エラーで毎回メールが飛ばないよう、1時間に1通の頻度制限は今回未実装
    // （429自体が頻繁に起きるエラーじゃないため・必要なら後で追加）
    if (status === 429 || (e.message && e.message.indexOf('monthly limit') !== -1)) {
      try {
        await sendAlertEmail(
          '🚨【ビオLINE】月200通枠切れアラート',
          [
            'ビオ公式LINEの月間メッセージ枠（200通）を使い切りました。',
            '予約完了通知のPush APIが429エラーを返している状態です。',
            '',
            `発生時刻: ${new Date().toISOString()}`,
            `エラー詳細: ${e.message}`,
            '',
            '【対応方法】',
            '1) 毎月1日 0:00（日本時間）に自動リセットを待つ',
            '2) または LINE Manager でライトプラン（月5,000円）に変更',
            '   → 5,000通まで即時利用可能',
            '',
            'LINE Manager: https://manager.line.biz/',
            '',
            '※このメールは、429エラーが発生するたびに送信されます。',
          ].join('\n')
        );
      } catch (alertErr) {
        console.error('alert email failed:', alertErr);
      }
    }

    return res.status(status).json({ error: e.message || 'internal error' });
  }
};

module.exports.config = {
  api: { bodyParser: false },
};
