const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

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

  const header =
`${name}様
ご予約ありがとうございます🌸${saved ? '☺️' : '✨'}

${name}様のご注文、しっかり承りました↓

━━━━━━━━━━━━━━━
📅 ご予約日時
　${date} ${time}
🍱 ご注文内容
　${items}
💴 合計金額
　${total}
☎ お電話
　${phone}
━━━━━━━━━━━━━━━

📲 追加でご予約はこちら👇
${RESERVE_URL}

📍 店舗：いなりとチキン ビオ
〒901-1206 沖縄県南城市大里字仲間1141
（JAアトールむかい）
☎ ${PHONE}

🌺 ${name}様にお会いできるのを、お母さんとビオくん一同、心から楽しみにしております${saved ? '✨😊' : '！'}

━━━━━━━━━━━━━━━
✨ 当日のご案内
━━━━━━━━━━━━━━━
🚫 お支払い方法：現金のみ
📦 テイクアウト専門店です
⏰ 売り切れ次第終了します🙏
🚗 駐車場：JAアトールの共用駐車場をご利用ください
`;

  const middleSaved =
`
━━━━━━━━━━━━━━━
💎 次回もっと便利に
━━━━━━━━━━━━━━━
お名前・電話番号を保存いただいたので、
次回からはタップのみで超簡単予約♪

LINE限定のキャンペーン・割引情報も
お届けします🎁`;

  const middleUnsaved =
`
━━━━━━━━━━━━━━━
💎 次回もっと便利に予約できます
━━━━━━━━━━━━━━━
次回のご予約時、フォーム下部の
「次回も同じ情報で予約」にチェックいただくと、
お名前・電話番号が保存され、
次回からはタップのみで超簡単予約♪

LINE限定のキャンペーン・割引情報も
ぜひお見逃しなく🎁`;

  const footer =
`

✨🎉 次回のご予約はこちら 🎉✨

━━━━━━━━━━━━━━━

👇 タップで1分予約 👇

📲 ${RESERVE_URL}

👆　👆　👆

━━━━━━━━━━━━━━━

🌸 タップひとつで予約完了 🌸
🎁 LINE限定特典もゲット 🎁

${name}様、何かご質問があれば、いつでも
こちらにメッセージくださいね${saved ? '😊✨' : '✨😊'}`;

  return header + (saved ? middleSaved : middleUnsaved) + footer;
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
