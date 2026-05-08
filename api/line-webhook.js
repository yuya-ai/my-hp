const crypto = require('crypto');

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const RESERVE_URL = 'https://my-hp-xi.vercel.app';
const PHONE = '098-944-4191';
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=%E6%B2%96%E7%B8%84%E7%9C%8C%E5%8D%97%E5%9F%8E%E5%B8%82%E5%A4%A7%E9%87%8C%E5%AD%97%E4%BB%B2%E9%96%931141';
const NAV_URL = 'https://www.google.com/maps/dir/?api=1&destination=%E6%B2%96%E7%B8%84%E7%9C%8C%E5%8D%97%E5%9F%8E%E5%B8%82%E5%A4%A7%E9%87%8C%E5%AD%97%E4%BB%B2%E9%96%931141';

const faqAnswers = {
  hours: `やっほ〜🌅✨
朝9時から夕方17時まで営業してるよ〜！🍙
売り切れちゃったらごめんね…早めに会いに来てくれると嬉しいな🙏💛
お母さんと、ぼくたちで待ってるよ〜🌸🥰`,

  closed: `ぼくたちのお休みは月曜日と第4水曜日だよ〜🌙💤
その他の日は元気に営業してるよ！💪✨
会いに来てくれたら嬉しいな〜🤗💕`,

  address: `ぼくたちのお家はここ〜📍✨
沖縄県南城市大里字仲間1141
（JAアトールむかい）🏪
〒901-1206

🗺 地図を開く
${MAP_URL}

🚗 ナビ起動
${NAV_URL}`,

  menu: `ぼくたちのメニューはこれだよ〜🌟✨
🍙 いなり 1個：140円（ぼくの仲間♪）
🍗 ガーリックチキン 1枚：240円
🥢 一口チキン（1パック）：530円
🌟 ミックス（いなり2＆チキン1）：520円 ← 一番人気〜！🥇
🍱 重箱（最大15個まで）※別途料金
1個から、何個でも〜😋💕

📲 ご予約はこちら
${RESERVE_URL}`,

  phone: `お電話はこちらだよ〜📞✨
${PHONE}📱
営業時間内（9:00〜17:00）にかけてね〜🙏💛`,

  payment: `ごめんね…💦
お支払いは現金のみになっちゃうんだ💴
カードや電子マネーは使えないから、ご準備お願いね〜🙏✨
（その分、お母さんがおまけしてくれるかも…？😋💕）`,

  reserve: `ご予約ありがと〜🥰💕
ネット注文ページからすぐお取り置きできるよ〜🌸✨
1個から、何個でも〜📝💛

📲 ${RESERVE_URL}

📞 当日のご予約はお電話のみ対応だよ〜🌸
${PHONE}📱
営業時間内（9:00〜17:00）に気軽にかけてね〜🥰🌸`,

  order_intent: `ご注文ありがと〜🥰💕✨
ネット注文ページからすぐお取り置きできるよ〜🌸📝
1個から、何個でも〜💛

📲 ${RESERVE_URL}

📞 当日のご予約はお電話のみ対応だよ〜🌸
${PHONE}📱
営業時間内（9:00〜17:00）に気軽にかけてね〜🥰🌸`,

  jubako: `重箱（最大15個まで）※別途料金でお作りできるよ〜🍱✨
清明祭（シーミー）🌺・旧盆🪔・各種行事🎉で大人気なんだ〜！
事前予約推奨：📞 ${PHONE}💕
「ビオの重箱が来た〜！」って言ってもらえるよう、心込めて作るよ〜🥰💛`,

  greeting: `やっほ〜🌸✨
「いなりとチキン ビオ」のマスコットビオくんだよ〜🍙💕
ぼくに何でも聞いてね〜！🤗
メニュー・営業時間・場所・予約など、何でもどうぞ〜🥰`,

  welcome: `はじめまして✨
いなりとチキン ビオです🌺
めんそーれー🤗💕

🎉 24時間いつでもLINEから予約OK ✨

📲 ご予約はこちら👇
${RESERVE_URL}

━━━━━━━━━━━━━━━
🌸 LINE予約のメリット
━━━━━━━━━━━━━━━

✨ 24時間いつでもタップで予約完了
✨ 売り切れる前に確実に確保
✨ 名前・電話を保存で次回1秒
✨ 待たずスムーズに受け取り

━━━━━━━━━━━━━━━
📞 何でもお気軽に
━━━━━━━━━━━━━━━

🍱 メニュー
📍 場所・地図
⏰ 営業時間
🚗 駐車場
☎ お電話番号

これらの言葉を送ってもらえれば、ビオくんがすぐにお答えします🐣✨`,

  thanks: `えへへ、こちらこそ〜🥰💕
ありがとね〜！🙏✨
また南城のビオで待ってるよ〜🌸🍙
（ぼくも嬉しいな〜💛😊）`,

  firsttime: `はじめまして〜🌸✨
初めての方にぼくのおすすめは「ミックス」（いなり2個＋チキン1枚）520円だよ〜😋💕
ぼくたち、いなりとガーリックチキンの2品だけを、十数年ずっと作ってるんだ〜🍙🍗
シンプルだけど、自信あるよ〜🥰✨`,

  inari: `いなり 1個 140円だよ〜🍙✨
白ゴマだけのシンプルないなり寿司♪
（ぼくの本体だから自信ある〜！😋💕）
1個から注文OKだよ〜！何個でもどうぞ〜🥰`,

  chicken: `ガーリックチキン 1枚 240円🍗✨
鶏むね肉のサクサクで、ガーリックの香りがたまらないよ〜🤤💕
1枚240円 / 5枚700円 / 10枚1,400円
一口チキン（1パック）は530円🥢
（ぼくも食べてみたい…🥺💛）`,

  recommend: `迷ったらこれ〜🌟✨
👉 ミックス（いなり2＆チキン1）520円 ← 一番人気♪🥇
👉 家族用なら重箱（最大15個まで）※別途料金🍱👨‍👩‍👧
👉 お子さんにはいなり 140円がぴったり〜🍙😋
（全部おいしいよ、ほんとに〜！🥰💕）`,

  gift: `差し入れ・お土産には重箱（最大15個まで）※別途料金がおすすめ〜🍱✨🎁
清明祭・旧盆・各種行事の食卓に、十数年愛されてきたんだ〜🌺💛
事前予約推奨：📞 ${PHONE}📱
（渡した人も貰った人も笑顔になるよ〜😊🌸）`,

  kids: `「いなり大好き♪子どもも喜ぶ！」はぼくの定番フレーズ〜🥰💕
お子さんにはいなり 1個 140円がぴったり🍙✨
やさしい味で、おやつにもピッタリ〜🍃
「ビオくん大好き〜！」って言ってもらえると、ぼく嬉しい〜🤗💛✨`,

  parking: `JAアトールむかいのお店だから、駐車スペースあるよ〜🚗✨
気軽に車で来てね〜🌸💕`,

  walkin: `予約なしでも全然OKだよ〜🌸
でも売り切れちゃうこともあるから、確実なのはネット注文で取り置き〜📝✨
1個からでもOKだよ〜💕

📲 ${RESERVE_URL}`,

  shelflife: `出来たてが一番おいしいから、当日中にどうぞ〜🥰💕
翌日まで持ち越す場合は冷蔵庫で〜🌸
食べる時はレンジで軽く温めるとふっくら美味しいよ〜♨️✨`,

  container: `ちゃんとお持ち帰り容器でお渡しするよ〜🍱✨
パーティーや行事には重箱（最大15個まで）※別途料金もあるよ〜🎉🌸`,

  waittime: `通常は5〜10分くらいでお渡しできるよ〜⏰✨
大量注文や混雑時はもうちょい〜
お急ぎなら事前にネット注文か📞 ${PHONE}で予約してね〜🌸`,

  delivery: `ごめんね〜🙏 配達はやってないんだ〜🚗💦
テイクアウト専門だから、お店まで取りに来てね〜🌸
ネット注文で取り置きしておけば、来てすぐ受け取れるよ〜💕

📲 ${RESERVE_URL}`,

  vegan: `いなりはお肉使ってないから、ベジの方も食べられるよ〜🍙🌿
ガーリックチキンは鶏肉だから、お肉NGの方はいなりがおすすめ〜🥰
詳しい原材料は📞 ${PHONE}で気軽に聞いてね〜🌸`,

  elderly: `やわらかくて食べやすいよ〜🥰💕
いなりは噛みやすいから、おじいちゃんおばあちゃんにも喜ばれてるんだ〜🍙✨
行事の差し入れにもぴったり〜🌺`,

  holiday: `清明祭・旧盆・お正月など、沖縄の行事には大人気だよ〜🌺🪔🎍
連休前は混雑するから、事前予約がおすすめ〜📝✨
📞 ${PHONE}またはネット注文してね〜💕

📲 ${RESERVE_URL}`,

  review: `十数年たくさんのお客様に来てもらってるよ〜🥰💕
「子どもも喜ぶ♪」「行事のたびに頼んでる」って言ってもらえて嬉しい〜🌸✨
ぜひ自分の口で確かめてみてね〜🍙😋`,

  weather: `ぼくはお店のことしか分からないけど〜🤗
どんな日でも、いなりとチキンは元気にしてくれるよ〜🌸✨
1個から注文できるから気軽にどうぞ〜🍙💕`,

  bot_personal: `えへへ、ぼくは「いなりとチキン ビオ」のマスコットビオくんだよ〜🌸✨
2013年からずっとお店にいるんだ〜🍙💕
お店のことなら何でも聞いてね〜🥰`,

  compete: `ぼくはビオのことしか分からないけど〜😋
十数年ずっと変わらない味で、地元の皆さんに愛されてるよ〜🌸✨
1個140円から試せるから、まず食べてみてね〜🍙💕`,

  allergy: `原材料・アレルギー情報、しっかりお伝えするね〜🙏✨

🍙 【いなり寿司】
お米(国産)・大豆・すし酢・醸造酢・砂糖(粗糖)・白ゴマ・食塩・酒粕/アルコール・調味料(アミノ酸)
⚠️ 一部に大豆・ごまを含みます

🍗 【ガーリックチキン(2枚入り)】
鶏肉(国産)・小麦粉・パン粉・でん粉・乾燥全卵・食塩・ニンニク(中国産)・酒精
⚠️ 一部に小麦・卵・鶏肉を含みます

🍗 【ガーリックチキン(小・200g)】
鶏肉(国産)・小麦粉・パン粉・酒精・食塩・ニンニク(中国産)/植物性ショートニング・イースト・アナトー色素・酸味料・イーストフード・ビタミンC(酸化防止剤)・増粘剤・調味料(アミノ酸)
⚠️ 一部に小麦・卵・鶏肉を含みます

🍱 【唐揚といなり寿し】
お米(国産)・鶏モモ肉(外国産)・大豆・すし酢・砂糖・醸造酢・白ゴマ・食塩・料理酒・鶏ガラスープ・片栗粉・しょうが・ニンニク・小麦粉・チキン粉末・水あめ・コーンスターチ/アルコール・調味料(アミノ酸)・酸味料・増粘剤(グアーガム)・酸化防止剤(ビタミンC)・マルトデキストリン・着色料(カロチン)・酵母エキス
⚠️ 一部に小麦・大豆・鶏肉・ごまを含みます

🍙 【いなコロ(5個入り)】
お米(国産)・すし酢・さとう・小麦粉・パン粉
⚠️ 一部に小麦を含みます

📊 【主なアレルゲン早見表】
🌾 小麦：ガーリックチキン・唐揚といなり寿し・いなコロ
🥚 卵：ガーリックチキン
🐔 鶏肉：ガーリックチキン・唐揚といなり寿し
🫘 大豆：いなり寿司・唐揚といなり寿し
🌰 ごま：いなり寿司・唐揚といなり寿し

❄️ 【保存方法】高温多湿・直射日光を避けて、出来たてその日のうちに〜🌸

⚠️ 重度のアレルギーをお持ちのお客様は、必ずお電話でご相談ください🙇‍♀️
📞 ${PHONE}（9:00〜17:00）`,

  bigorder: `大量注文（30個以上）はお電話で相談してね〜📞✨
👉 ${PHONE}📱
お母さんが個数・お渡し時間の相談に乗ってくれるよ〜🌸💕`,

  corporate: `法人取引・お店さんとの仕入れは、お電話で相談してね〜📞✨
👉 ${PHONE}📱
お母さんが直接お話を聞きます〜🌸`,

  media: `取材・メディアのご依頼は、お電話でお願いします〜📞✨
👉 ${PHONE}📱
お母さんが対応します〜🌸`,

  complaint: `このたびは、ご不快な思いをさせてしまい誠に申し訳ございません🙇‍♀️🙇‍♀️🙇‍♀️

お客様のお声、必ずお母さん（オーナー）に直接お伝えします。
大変お手数ですが、詳しいご状況をお電話でお聞かせいただけますでしょうか。

📞 ${PHONE}📱
営業時間内：9:00〜17:00

誠心誠意、ご対応させていただきます。
このたびは本当に申し訳ございませんでした。`,
};

const fallback = `うーん、ぼくにはまだちょっと難しいな〜🤔💦
でも、ご注文・ご予約なら下のリンクからすぐできるよ〜🌸✨

📲 ${RESERVE_URL}

📞 当日のご予約はお電話のみ対応だよ〜🥰
${PHONE}📱
営業時間内（9:00〜17:00）に気軽にかけてね〜🌸`;

function matchKeyword(text) {
  // Lv5: クレーム（最優先）
  if (/(まずい|不味い|まづい|ひどい|酷い|最悪|がっかり|ガッカリ|失望|不快|ムカつ|むかつ|怒|キレ|きれ|傷つ|傷付|腐|くさ|臭|汚|きたな|変な味|髪.*入|毛.*入|虫.*入|異物|混入|食中毒|お腹.*壊|腹.*痛|下痢|嘔吐|返金|補償|弁償|クレーム|苦情|態度.*悪|接客.*悪|対応.*悪|愛想|無愛想|文句|許せ|許さ)/i.test(text)) return 'complaint';

  // Lv4: 電話誘導
  if (/(アレルギ|allergy|allergic|原材料.*詳|添加物|グルテン|乳製品|卵.*アレ|甲殻|そば.*アレ|小麦.*アレ|ピーナッツ|ナッツ.*アレ)/i.test(text)) return 'allergy';
  if (/(\d{2,}個|\d{3,}|大量|何百|何十個|まとめ買い|団体|大勢|クラス分|職場.*個|学校.*個|何百個|まとめて.*買|大口|3[0-9]個|[4-9][0-9]個)/.test(text)) return 'bigorder';
  if (/(法人|企業.*取引|卸|仕入|wholesale|b2b|業務用|お店.*向け)/i.test(text)) return 'corporate';
  if (/(取材|メディア|TV取材|テレビ取材|新聞取材|ラジオ.*取材|interview|press|youtuber.*取材|youtube.*取材|インタビュー)/i.test(text)) return 'media';

  // Lv0: welcome 再表示コマンド（テスト・案内用）
  if (/(welcome|ウェルカム|あいさつ|挨拶|もう一度|もういちど|案内|ガイド|スタート|^start$|リセット|reset)/i.test(text)) return 'welcome';

  // Lv1: 挨拶
  if (/(こんにちは|こんばんは|おはよう|^hello|^hi$|もしもし|やあ|^やっほ)/i.test(text)) return 'greeting';
  if (/(ありがと|サンキュ|thank|感謝|嬉し|うれし)/i.test(text)) return 'thanks';
  if (/(初めて|はじめて|どんなお店|何のお店|何屋|どういうお店|どんな店)/.test(text)) return 'firsttime';

  // Lv3: 雑談ガード
  if (/(あなた.*誰|あなた.*何|お前.*誰|お前.*何|きみ.*誰|きみ.*何|ビオくん.*(誰|何|名前|何歳|どこから)|何者|who.*you|who.*are)/i.test(text)) return 'bot_personal';
  if (/(天気|雨|暑い|寒い|台風|weather|hot.*today|cold.*today)/i.test(text)) return 'weather';
  if (/(他.*お?店|他店|別.*店|比べ|比較|vs|どっち.*いい|他.*いなり|他.*チキン|他社|ラーメン|そば|うどん|焼肉|寿司|すし|スシ|カレー|パスタ|ピザ|居酒屋|喫茶|カフェ|食堂|定食|レストラン|バー|焼き鳥|ハンバーガ|ステーキ|料理屋|食べ物.*屋|お店.*教え|店.*教え|店.*紹介|店.*知|店.*オススメ|店.*おすすめ|どこ.*美味し|どこ.*うまい|何屋.*行)/.test(text)) return 'compete';

  // Lv2: シーン
  if (/(おすすめ|お勧め|オススメ|人気|定番|迷|どれが|何がいい|何を|recommend)/i.test(text)) return 'recommend';
  if (/(差し入れ|お土産|手土産|お持たせ|お供|gift|プレゼント|贈|贈答|お中元|お歳暮)/i.test(text)) return 'gift';
  if (/(子ども|子供|こども|キッズ|kids|お子さん|赤ちゃん|孫)/i.test(text)) return 'kids';
  if (/(高齢|お年寄り|おじいちゃん|おばあちゃん|シニア|柔らか|やわらか|噛みやす|歯)/.test(text)) return 'elderly';
  if (/(ベジ|vegan|vegetarian|肉なし|肉抜き|お肉ダメ|halal|ハラル|ヴィーガン)/i.test(text)) return 'vegan';

  // 行事
  if (/(連休|GW|ゴールデンウィーク|シルバーウィーク|お正月|お盆|シーミー|清明|旧盆|休み.*予約|連休.*予約|年末年始)/i.test(text)) return 'holiday';
  if (/(重箱|シーミー|清明|旧盆|行事|お供え|法事|うちなー行事|オードブル)/.test(text)) return 'jubako';

  // 商品個別
  if (/(稲荷|いなり|稲荷ずし|お稲荷|inari|揚げ|油揚)/i.test(text)) return 'inari';
  if (/(チキン|chicken|鶏|とり|鳥|むね|胸肉|ガーリック|から揚|唐揚|フライド)/i.test(text)) return 'chicken';

  // お店利用
  if (/(駐車|車で.*行|パーキング|parking|止め.*場|停め.*場|車.*置)/i.test(text)) return 'parking';
  if (/(予約なし|当日.*行|飛び込み|ふらっと|今から.*行|これから.*行|walk[-\s]?in)/i.test(text)) return 'walkin';
  if (/(賞味|消費|期限|日持ち|何日.*持|どれくらい.*持|保存|冷蔵|冷凍|温め|レンジ)/.test(text)) return 'shelflife';
  if (/(容器|お弁当箱|箱.*入|包装|パック|タッパー)/i.test(text)) return 'container';
  if (/(待|何分.*かか|時間.*かか|遅い|早い|急い|急ぎ|すぐ.*できる|どれくらい.*かか)/.test(text)) return 'waittime';
  if (/(配達|デリバリー|出前|宅配|delivery|uber|wolt|ウォルト|出向|お届け)/i.test(text)) return 'delivery';
  if (/(評判|口コミ|レビュー|評価|有名|うまい|うまかった|美味しい|おいしい|review|rating)/i.test(text)) return 'review';

  // 基本情報
  if (/(営業|何時|開店|閉店|オープン|何時から|何時まで|やってる|やってます)/.test(text)) return 'hours';
  if (/(休|やすみ|定休|お休み|月曜|水曜|休業)/.test(text)) return 'closed';
  if (/(住所|場所|アクセス|どこ|地図|map|行き方|来店|大里|南城|アトール)/i.test(text)) return 'address';
  if (/(電話|TEL|でんわ|連絡|問い合わせ|番号)/i.test(text)) return 'phone';
  if (/(支払|現金|カード|paypay|電子|決済|キャッシュ|cash)/i.test(text)) return 'payment';

  // 注文・予約
  if (/(予約|取り置き|事前|reserve|注文|オーダー|order|頼|たのみ|買いたい|ほしい|欲しい|オンライン|ネット|online)/i.test(text)) return 'order_intent';

  // メニュー
  if (/(メニュー|商品|料理|値段|価格|いくら|何円|円|料金|ぜんぶ|全部)/.test(text)) return 'menu';

  return null;
}

// ===== 予約完了メッセージ（BIO_RSV: トークン経由）=====
const RSV_PREFIX = 'BIO_RSV:';

function parseReservationPayload(text) {
  const idx = text.indexOf(RSV_PREFIX);
  if (idx === -1) return null;
  const m = text.slice(idx + RSV_PREFIX.length).match(/^[A-Za-z0-9_\-]+/);
  if (!m) return null;
  const std = m[0].replace(/-/g, '+').replace(/_/g, '/');
  const pad = std.length % 4;
  const padded = pad ? std + '='.repeat(4 - pad) : std;
  try {
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
  } catch (e) {
    console.error('parseReservationPayload error:', e);
    return null;
  }
}

function buildReservationMessage(p) {
  // payload keys: n=name, p=phone, d=date, t=time, i=items, tt=total, s=saveInfo(1/0)
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
ご注文、しっかり承りました↓

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

━━━━━━━━━━━━━━━

🐣 追加予約 ♪

📲 ${RESERVE_URL}

━━━━━━━━━━━━━━━

📍 店舗：いなりとチキン ビオ
〒901-1206 沖縄県南城市大里字仲間1141
（JAアトールむかい）
☎ ${PHONE}

🌺 ${name}様にお会いできるのを、ビオ一同、心から楽しみにしております${saved ? '✨😊' : '！'}

━━━━━━━━━━━━━━━
✨ 当日のご案内
━━━━━━━━━━━━━━━
🚫 お支払い方法：現金のみ
📦 テイクアウト専門店です
⏰ 売り切れ次第終了します🙏
🚗 駐車場：JAアトールの共用駐車場をご利用ください
`;

  const footer =
`

━━━━━━━━━━━━━━━

🐣 次回予約 🌸

📲 ${RESERVE_URL}

🎁 LINE限定特典あり ✨

━━━━━━━━━━━━━━━

ご質問はいつでもこのトークへ${saved ? '😊✨' : '✨😊'}`;

  return header + footer;
}

function verifySignature(rawBody, signature) {
  if (!CHANNEL_SECRET || !signature) return false;
  const expected = crypto.createHmac('SHA256', CHANNEL_SECRET).update(rawBody).digest('base64');
  return expected === signature;
}

async function replyMessage(replyToken, text) {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('LINE Reply API error:', res.status, err);
  }
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-line-signature'];

    if (!verifySignature(rawBody, signature)) {
      console.warn('Invalid LINE signature');
      return res.status(401).send('Invalid signature');
    }

    const data = JSON.parse(rawBody);
    const events = data.events || [];

    await Promise.all(events.map(async (event) => {
      if (event.type === 'message' && event.message.type === 'text') {
        const userText = event.message.text;

        // userId取得コマンド（管理者通知の初期設定用）
        if (/^(userid|uid|id教えて|アイディー)$/i.test(userText.trim())) {
          const uid = (event.source && event.source.userId) || '取得失敗';
          await replyMessage(event.replyToken,
            `あなたのuserIdはこちら👇\n\n${uid}\n\nこのIDを Vercel の環境変数 ADMIN_USER_ID に設定すると、新規予約があった時に自動で通知が届くようになります🐣✨`);
          return;
        }

        // 予約完了トークン（BIO_RSV:）を最優先で検知
        if (userText.indexOf(RSV_PREFIX) !== -1) {
          const payload = parseReservationPayload(userText);
          if (payload) {
            await replyMessage(event.replyToken, buildReservationMessage(payload));
            return;
          }
          // パース失敗時はフォールバック
          await replyMessage(event.replyToken, fallback);
          return;
        }

        const matchKey = matchKeyword(userText);
        const replyText = (matchKey && faqAnswers[matchKey]) ? faqAnswers[matchKey] : fallback;
        await replyMessage(event.replyToken, replyText);
      }
    }));

    return res.status(200).send('OK');
  } catch (e) {
    console.error('Webhook handler error:', e);
    return res.status(500).send('Internal Error');
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
