// デモ用：オーナー向け仕入れ予測通知のサンプルメッセージを送信
// アクセス方法：https://my-hp-xi.vercel.app/api/demo-owner-notification
// → Yuya のLINEにサンプル通知が届く（お母様デモ用）

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

function buildDemoMessage() {
  // 翌日の日付を計算（デモなので動的に変えても良い・今は固定例）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = tomorrow.getMonth() + 1;
  const day = tomorrow.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[tomorrow.getDay()];

  return `🔔 ${month}/${day}(${weekday}) ご予約状況報告

🍙 いなり ×15個
🍗 ガーリックチキン ×8枚
🥢 一口チキン ×3パック
🌟 ミックス（い1×ち1）×4個
🌟 ミックス（い2×ち1）×2個
🍱 重箱 ×1件

合計8件の予約
明日もよろしくお願いします🌸

━━━━━━━━━━━━━━━
※これはデモ通知です
本機能完成後は前日19時に自動配信されます`;
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
    throw new Error(`Push API ${res.status}: ${errText}`);
  }
}

module.exports = async (req, res) => {
  try {
    if (!ADMIN_USER_ID) {
      return res.status(500).json({ error: 'ADMIN_USER_ID not configured' });
    }
    const text = buildDemoMessage();
    await pushMessage(ADMIN_USER_ID, text);
    return res.status(200).json({
      ok: true,
      message: 'デモ通知を送信しました。LINEを確認してください🌸'
    });
  } catch (e) {
    console.error('demo-owner-notification error:', e);
    return res.status(500).json({ error: e.message });
  }
};
