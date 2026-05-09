// デモ用：オーナー向け仕入れ予測通知のサンプルメッセージを送信
// アクセス方法：https://my-hp-xi.vercel.app/api/demo-owner-notification
// → Yuya のLINEにサンプル通知が届く（お母様デモ用）

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

function buildDemoMessage() {
  // 翌日の日付を計算（JST基準）
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const tomorrow = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60000 + 86400000);
  const month = tomorrow.getMonth() + 1;
  const day = tomorrow.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[tomorrow.getDay()];
  const dateLabel = `${month}/${day}(${weekday})`;

  // デモ用サンプル数値（本実装では予約データから自動計算）
  const inariCount = 15;
  const garlicChickenCount = 8;
  const bitChickenPack = 3;
  const mix1Count = 4;
  const mix2Count = 2;
  const jubakoCount = 1;

  return `🔔 ${dateLabel} ご予約状況報告

【必要個数】
🌾 いなり ×${inariCount}個
🍗 ガーリックチキン ×${garlicChickenCount}枚
🐣 一口チキン ×${bitChickenPack}パック
【注文内訳】
🌟 ミックス（い1×ち1）×${mix1Count}個
🌟 ミックス（い2×ち1）×${mix2Count}個
🍱 重箱 ×${jubakoCount}件


結論：${dateLabel}は「いなり${inariCount}必要」「ガーリックチキン${garlicChickenCount}枚必要」「一口チキン${bitChickenPack}パック必要」です。
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
