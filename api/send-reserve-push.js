const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
const GAS_WEBHOOK_URL = process.env.GAS_WEBHOOK_URL;

const RESERVE_URL = 'https://my-hp-xi.vercel.app';
const PHONE = '098-944-4191';

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

☎️ お電話
　${phone}

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
✅ お客様にも予約完了通知を送信済

━━━━━━━━━━━
⚠️ 売り切れの場合
━━━━━━━━━━━

商品が売り切れの場合は、
早急にお客様へ
お電話をお願いします☎️

【伝える内容】
「ご注文頂いた商品が
　只今売り切れです🙇‍♀️」`;
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
    return res.status(status).json({ error: e.message || 'internal error' });
  }
};

module.exports.config = {
  api: { bodyParser: false },
};
