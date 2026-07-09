import { useState, useEffect, useRef } from "react";

const BOT_TOKEN = "8797577683:AAEbgkfZMEUuN7xYhyW9NE_svyywXhaLDvQ";
const ADMIN_CHAT_ID = "8588122425";
const CHANNEL_BUY_ID = "-1003936653850";    // Купивля З.(Часний)
const CHANNEL_WITHDRAW_ID = "-1003966959381"; // Виводи(часний)
const CHANNEL_SUPPORT_ID = "-1003998251764";  // Вопроси(часний)
const ADMIN_IDS = ["8588122425"];

const STAR_PRICE = 0.8;
const SELL_STAR_PRICE = 0.4;
const SELL_MIN = 200;

const PACKAGES = [
  { stars: 50,  price: 40  },
  { stars: 100, price: 75  },
  { stars: 250, price: 200 },
];

const BANKS = [
  { id: "sense", label: "🏦 Sense Bank", card: "4028 0820 1302 5224", holder: "Oleksandr K." },
  { id: "mono",  label: "🐈 Монобанк",   card: "4441 1144 2865 2257", holder: "Oleksandr K." },
];

const tg = window.Telegram?.WebApp;

function getTgUser() {
  const u = tg?.initDataUnsafe?.user;
  if (u) return {
    id: String(u.id),
    username: u.username ? "@" + u.username : "—",
    name: [u.first_name, u.last_name].filter(Boolean).join(" ") || "Користувач",
  };
  return { id: "demo", username: "@demo_user", name: "Demo User" };
}

async function sendMsg(chat_id, text) {
  if (!BOT_TOKEN || BOT_TOKEN === "8797577683:AAEbgkfZMEUuN7xYhyW9NE_svyywXhaLDvQ") return true;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text, parse_mode: "HTML" }),
    });
    return true;
  } catch { return false; }
}

async function sendPhoto(chat_id, blob, caption) {
  const form = new FormData();
  form.append("chat_id", chat_id);
  form.append("photo", blob, "receipt.jpg");
  form.append("caption", caption);
  form.append("parse_mode", "HTML");
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: "POST", body: form });
}

async function sendToAdmin(text) {
  await sendMsg(ADMIN_CHAT_ID, text);
  return true;
}

async function sendPhotoToAdmin(base64, caption, uid, stars) {
  if (!BOT_TOKEN || BOT_TOKEN === "8797577683:AAEbgkfZMEUuN7xYhyW9NE_svyywXhaLDvQ") return { ok: true };
  try {
    const res = await fetch(base64);
    const blob = await res.blob();

    const kb = {
      inline_keyboard: [[
        { text: "✅ Підтвердити", callback_data: `adm_ok_${uid}_${stars}` },
        { text: "❌ Відхилити",  callback_data: `adm_no_${uid}` }
      ]]
    };

    // Відправка в канал чеків з кнопками
    const form1 = new FormData();
    form1.append("chat_id", "@PonPon193821");
    form1.append("photo", blob, "receipt.jpg");
    form1.append("caption", caption);
    form1.append("parse_mode", "HTML");
    form1.append("reply_markup", JSON.stringify(kb));
    const r1 = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: "POST", body: form1 });
    const j1 = await r1.json();

    if (!j1.ok) {
      return { ok: false, error: j1.description || "Невідома помилка" };
    }

    // Сповіщення адміну
    await sendMsg(ADMIN_CHAT_ID,
      `🔔 <b>Новий чек з міні-аппу!</b>\nКлієнт: @${uid}\nЧек у каналі @PonPon193821`
    );

    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function sendSupportMsg(text) {
  await sendMsg(ADMIN_CHAT_ID, text);
  await sendMsg(CHANNEL_SUPPORT_ID, text);
  return true;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #0d0d1a; color: #e8e9f0; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #13132a; }
  ::-webkit-scrollbar-thumb { background: linear-gradient(#b94fff, #ff4fa3); border-radius: 2px; }

  .app { max-width: 420px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #0d0d1a; }

  .header { background: linear-gradient(135deg,#1a1030 0%,#120d25 100%); padding: 16px 20px 14px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(185,79,255,0.15); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px); }
  .header-back { background: none; border: none; color: #b94fff; font-size: 22px; cursor: pointer; padding: 0 4px; line-height: 1; }
  .header-logo { width: 36px; height: 36px; background: linear-gradient(135deg,#b94fff,#ff4fa3); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; box-shadow: 0 0 20px rgba(185,79,255,0.4); }
  .header-title { font-size: 17px; font-weight: 700; color: #f0f1f8; }
  .header-sub { font-size: 11px; color: #6b5a8a; margin-top: 1px; }

  .nav { display: grid; grid-template-columns: repeat(3,1fr); background: #0d0d1a; border-top: 1px solid rgba(185,79,255,0.15); position: sticky; bottom: 0; z-index: 100; }
  .nav-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px 8px; background: none; border: none; color: #4a3a6a; font-size: 10px; font-weight: 600; cursor: pointer; transition: color .15s; letter-spacing: .02em; text-transform: uppercase; }
  .nav-btn .icon { font-size: 20px; line-height: 1; }
  .nav-btn.active { color: #b94fff; }
  .nav-btn:hover { color: #9a3fd0; }

  .content { flex: 1; overflow-y: auto; padding-bottom: 20px; }

  .hero { background: linear-gradient(160deg,#1e0a3c 0%,#2d0f4e 40%,#1a0830 100%); padding: 36px 20px 28px; text-align: center; border-bottom: 1px solid rgba(185,79,255,0.2); position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(185,79,255,0.15) 0%, transparent 70%); }
  .hero::after { content: ''; position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(255,79,163,0.1) 0%, transparent 70%); }
  .hero-star { font-size: 56px; filter: drop-shadow(0 0 20px rgba(185,79,255,0.6)); margin-bottom: 14px; position: relative; z-index: 1; }
  .hero-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -.5px; position: relative; z-index: 1; }
  .hero-title span { background: linear-gradient(135deg,#b94fff,#ff4fa3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero-sub { font-size: 13px; color: #9a7ab0; margin-top: 6px; position: relative; z-index: 1; }
  .price-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(185,79,255,0.12); border: 1px solid rgba(185,79,255,0.3); color: #c87dff; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-top: 14px; position: relative; z-index: 1; }

  .section-title { font-size: 11px; font-weight: 700; color: #6b5a8a; letter-spacing: .08em; text-transform: uppercase; padding: 20px 20px 10px; }

  .package-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .package-card { background: linear-gradient(135deg,#1a1030,#140c28); border: 1px solid rgba(185,79,255,0.2); border-radius: 16px; padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all .2s; }
  .package-card:hover { border-color: #b94fff; background: rgba(185,79,255,0.08); box-shadow: 0 0 20px rgba(185,79,255,0.15); transform: translateY(-1px); }
  .pkg-left { display: flex; align-items: center; gap: 12px; }
  .pkg-icon { width: 46px; height: 46px; background: linear-gradient(135deg,#2d1050,#3d1560); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 12px rgba(185,79,255,0.2); }
  .pkg-stars { font-size: 17px; font-weight: 700; color: #f0f1f8; }
  .pkg-label { font-size: 12px; color: #6b5a8a; margin-top: 1px; }
  .pkg-price { font-size: 20px; font-weight: 800; background: linear-gradient(135deg,#b94fff,#ff4fa3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .pkg-price span { font-size: 12px; font-weight: 500; color: #6b5a8a; -webkit-text-fill-color: #6b5a8a; }

  .custom-btn { margin: 10px 16px 0; padding: 14px; background: linear-gradient(135deg,#1a1030,#140c28); border: 1px dashed rgba(185,79,255,0.3); border-radius: 14px; color: #7a5a9a; font-size: 14px; font-weight: 600; text-align: center; cursor: pointer; transition: all .15s; display: block; width: calc(100% - 32px); }
  .custom-btn:hover { border-color: #b94fff; color: #b94fff; }

  .btn { display: block; width: 100%; padding: 15px; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; transition: all .2s; text-align: center; }
  .btn-primary { background: linear-gradient(135deg,#b94fff,#ff4fa3); color: #fff; box-shadow: 0 4px 20px rgba(185,79,255,0.4); }
  .btn-primary:hover { box-shadow: 0 6px 28px rgba(185,79,255,0.6); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .btn-ghost { background: linear-gradient(135deg,#1a1030,#140c28); border: 1px solid rgba(185,79,255,0.2); color: #7a5a9a; }
  .btn-ghost:hover { border-color: #b94fff; color: #c87dff; }
  .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }

  .bank-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .bank-card { background: linear-gradient(135deg,#1a1030,#140c28); border: 1px solid rgba(185,79,255,0.2); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all .2s; }
  .bank-card:hover { border-color: #b94fff; background: rgba(185,79,255,0.06); box-shadow: 0 0 16px rgba(185,79,255,0.1); }
  .bank-card-info { flex: 1; }
  .bank-name { font-size: 15px; font-weight: 600; color: #e0d0f8; }
  .bank-card-num { font-size: 12px; color: #6b5a8a; margin-top: 2px; font-family: monospace; }
  .bank-arrow { color: #4a3a6a; font-size: 14px; }

  .pay-box { margin: 0 16px; background: linear-gradient(135deg,#1a1030,#140c28); border: 1px solid rgba(185,79,255,0.2); border-radius: 16px; padding: 20px; }
  .pay-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .pay-row:last-child { margin-bottom: 0; }
  .pay-label { font-size: 12px; color: #6b5a8a; }
  .pay-value { font-size: 14px; font-weight: 600; color: #e0d0f8; font-family: monospace; }
  .pay-value.accent { background: linear-gradient(135deg,#b94fff,#ff4fa3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .pay-divider { height: 1px; background: rgba(185,79,255,0.15); margin: 14px 0; }
  .copy-btn { background: rgba(185,79,255,0.12); border: 1px solid rgba(185,79,255,0.3); color: #c87dff; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .copy-btn:hover { background: rgba(185,79,255,0.25); }

  .recipient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }
  .recipient-card { background: linear-gradient(135deg,#1a1030,#140c28); border: 1px solid rgba(185,79,255,0.2); border-radius: 16px; padding: 20px 14px; text-align: center; cursor: pointer; transition: all .2s; }
  .recipient-card:hover,.recipient-card.selected { border-color: #b94fff; background: rgba(185,79,255,0.08); box-shadow: 0 0 20px rgba(185,79,255,0.15); }
  .recipient-card .rc-icon { font-size: 32px; margin-bottom: 8px; }
  .recipient-card .rc-label { font-size: 13px; font-weight: 700; color: #e0d0f8; }

  .input-wrap { padding: 0 16px; }
  .input-field { width: 100%; background: linear-gradient(135deg,#1a1030,#140c28); border: 1px solid rgba(185,79,255,0.2); border-radius: 14px; padding: 14px 16px; font-size: 15px; color: #e8e9f0; font-family: 'Inter',sans-serif; outline: none; transition: border-color .15s; }
  .input-field:focus { border-color: #b94fff; box-shadow: 0 0 0 3px rgba(185,79,255,0.1); }
  .input-field::placeholder { color: #3a2a5a; }

  .info-box { margin: 0 16px; padding: 14px 16px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
  .info-box.warning { background: rgba(255,79,163,0.08); border: 1px solid rgba(255,79,163,0.2); color: #ff7ab8; }
  .info-box.success { background: rgba(75,200,120,.08); border: 1px solid rgba(75,200,120,.2); color: #4bc878; }
  .info-box.muted { background: rgba(185,79,255,0.05); border: 1px solid rgba(185,79,255,0.1); color: #6b5a8a; }

  .profile-hero { background: linear-gradient(160deg,#1e0a3c 0%,#2d0f4e 50%,#1a0830 100%); padding: 32px 20px 28px; text-align: center; border-bottom: 1px solid rgba(185,79,255,0.2); position: relative; overflow: hidden; }
  .profile-hero::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; background:radial-gradient(circle,rgba(185,79,255,0.12) 0%,transparent 70%); }
  .profile-avatar { width: 76px; height: 76px; background: linear-gradient(135deg,#b94fff,#ff4fa3); border-radius: 26px; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 14px; box-shadow: 0 0 30px rgba(185,79,255,0.5); position: relative; z-index:1; }
  .profile-name { font-size: 20px; font-weight: 800; color: #fff; position: relative; z-index:1; }
  .profile-tag { font-size: 13px; color: #9a7ab0; margin-top: 4px; position: relative; z-index:1; }
  .tg-id-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(185,79,255,0.1); border: 1px solid rgba(185,79,255,0.25); border-radius: 8px; padding: 3px 10px; font-size: 11px; color: #9a7ab0; font-family: monospace; margin-top: 8px; position: relative; z-index:1; }

  .admin-header { background: linear-gradient(135deg,#1e0a3c,#150830); padding: 20px; border-bottom: 1px solid rgba(185,79,255,0.2); display: flex; align-items: center; gap: 12px; }
  .admin-badge { background: linear-gradient(135deg,#b94fff,#ff4fa3); color: white; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; box-shadow: 0 2px 10px rgba(185,79,255,0.4); }

  .calc-result { margin: 14px 16px 0; background: linear-gradient(135deg,rgba(185,79,255,0.1),rgba(255,79,163,0.08)); border: 1px solid rgba(185,79,255,0.25); border-radius: 16px; padding: 24px; text-align: center; }
  .calc-result-value { font-size: 32px; font-weight: 800; background: linear-gradient(135deg,#b94fff,#ff4fa3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .calc-result-label { font-size: 12px; color: #7a5a9a; margin-top: 6px; }

  .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #1e0a3c; border: 1px solid rgba(185,79,255,0.4); color: #e0d0f8; padding: 10px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; z-index: 999; white-space: nowrap; box-shadow: 0 4px 20px rgba(185,79,255,0.3); animation: fadeIn .15s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }

  .success-screen { text-align: center; padding: 48px 24px 32px; }
  .success-icon { font-size: 64px; margin-bottom: 16px; filter: drop-shadow(0 0 20px rgba(185,79,255,0.5)); }
  .success-title { font-size: 22px; font-weight: 800; color: #fff; }
  .success-sub { font-size: 14px; color: #6b5a8a; margin-top: 8px; line-height: 1.5; }

  .space { height: 16px; }
  .px { padding: 0 16px; }
  .no-access { text-align:center; padding: 60px 24px; }
  .no-access-icon { font-size: 48px; margin-bottom:16px; }
  .no-access-title { font-size:18px; font-weight:800; color:#ff4fa3; }
  .no-access-sub { font-size:13px; color:#6b5a8a; margin-top:8px; }

  /* ФОТО ЧЕКУ */
  .receipt-upload { margin: 0 16px; border: 2px dashed rgba(185,79,255,0.3); border-radius: 16px; padding: 24px 16px; text-align: center; cursor: pointer; transition: all .2s; background: linear-gradient(135deg,#1a1030,#140c28); }
  .receipt-upload:hover { border-color: #b94fff; background: rgba(185,79,255,0.06); }
  .receipt-upload.has-photo { border-color: #4bc878; border-style: solid; padding: 0; overflow: hidden; }
  .receipt-upload-icon { font-size: 36px; margin-bottom: 10px; }
  .receipt-upload-text { font-size: 14px; font-weight: 600; color: #7a5a9a; }
  .receipt-upload-sub { font-size: 12px; color: #4a3a6a; margin-top: 4px; }
  .receipt-preview { width: 100%; max-height: 240px; object-fit: cover; display: block; border-radius: 14px; }
  .receipt-change { display: block; padding: 10px; font-size: 12px; color: #6b5a8a; text-align: center; cursor: pointer; background: #1a1030; border: none; width: 100%; font-family: 'Inter',sans-serif; }
  .receipt-change:hover { color: #b94fff; }
`;

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

function Header({ title, sub, onBack, showLogo = true }) {
  return (
    <div className="header">
      {onBack && <button className="header-back" onClick={onBack}>‹</button>}
      {showLogo && <div className="header-logo">⭐</div>}
      <div>
        <div className="header-title">{title}</div>
        {sub && <div className="header-sub">{sub}</div>}
      </div>
    </div>
  );
}

function HomeScreen({ onBuy, onSell, onCalc, user }) {
  return (
    <div>
      <div className="hero">
        <div className="hero-star">⭐</div>
        <div className="hero-title">PonPon <span>Shop</span></div>
        <div className="hero-sub">Вітаємо, {user.name}!</div>
        <div className="price-badge">⭐ 1 зірка = {STAR_PRICE} ₴</div>
      </div>
      <div className="section-title">Популярні пакети</div>
      <div className="package-list">
        {PACKAGES.map(p => (
          <div key={p.stars} className="package-card" onClick={() => onBuy(p)}>
            <div className="pkg-left">
              <div className="pkg-icon">⭐</div>
              <div>
                <div className="pkg-stars">{p.stars} Stars</div>
                <div className="pkg-label">{(p.price / p.stars).toFixed(2)} ₴ / зірка</div>
              </div>
            </div>
            <div className="pkg-price">{p.price}<span> ₴</span></div>
          </div>
        ))}
      </div>
      <button className="custom-btn" onClick={() => onBuy(null)}>✏️ Своя кількість</button>
      <div className="section-title">Інше</div>
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onSell}>💰 Продати Stars</button>
        <button className="btn btn-ghost" onClick={onCalc}>🔄 Калькулятор</button>
      </div>
      <div className="space" />
    </div>
  );
}

function ReceiptUpload({ photo, onChange }) {
  const inputRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      {photo ? (
        <div className={`receipt-upload has-photo`}>
          <img src={photo} alt="чек" className="receipt-preview" />
          <button className="receipt-change" onClick={() => inputRef.current.click()}>
            🔄 Змінити фото
          </button>
        </div>
      ) : (
        <div className="receipt-upload" onClick={() => inputRef.current.click()}>
          <div className="receipt-upload-icon">📸</div>
          <div className="receipt-upload-text">Прикріпити скріншот чеку</div>
          <div className="receipt-upload-sub">Натисніть щоб вибрати фото</div>
        </div>
      )}
    </div>
  );
}

function BuyFlow({ onBack, showToast, user, initialPkg }) {
  const [step, setStep] = useState("recipient");
  const [recipient, setRecipient] = useState("self");
  const [friendUsername, setFriendUsername] = useState("");
  const [pkg, setPkg] = useState(initialPkg || null);
  const [customAmt, setCustomAmt] = useState("");
  const [bank, setBank] = useState(null);
  const [sending, setSending] = useState(false);
  const [receiptPhoto, setReceiptPhoto] = useState(null);

  const currentPkg = pkg || (customAmt
    ? { stars: parseInt(customAmt), price: Math.round(parseInt(customAmt) * STAR_PRICE * 100) / 100 }
    : null);

  function copyCard(text) {
    navigator.clipboard.writeText(text).catch(() => {});
    showToast("✅ Скопійовано!");
  }

  async function submitOrder() {
    if (!receiptPhoto) {
      showToast("📸 Додайте скріншот чеку!");
      return;
    }
    setSending(true);
    const orderId = "ORD" + Date.now().toString().slice(-6);
    const recipientText = recipient === "friend"
      ? `🎁 Для друга: <b>${friendUsername}</b>`
      : "✨ Собі";

    const caption = recipient === "friend"
      ? `📋 <b>НОВИЙ ЧЕК</b>\n📱 <b>З міні-аппу</b>\n\n` +
        `🎁 Покупець купує зірки <b>другу</b>\n` +
        `👤 Юзер друга: ${friendUsername}\n\n` +
        `💎 Кількість: ${currentPkg.stars} ⭐\n` +
        `💰 Сума: ${currentPkg.price} грн\n` +
        `💳 Оплата: ${bank.label}\n\n` +
        `🆔 ID покупця: ${user.id}\n` +
        `👤 Юзер покупця: ${user.username}`
      : `📋 <b>НОВИЙ ЧЕК</b>\n📱 <b>З міні-аппу</b>\n\n` +
        `✨ Покупець купує зірки <b>собі</b>\n\n` +
        `💎 Кількість: ${currentPkg.stars} ⭐\n` +
        `💰 Сума: ${currentPkg.price} грн\n` +
        `💳 Оплата: ${bank.label}\n\n` +
        `🆔 ID покупця: ${user.id}\n` +
        `👤 Юзер покупця: ${user.username}`;

    const result = await sendPhotoToAdmin(receiptPhoto, caption, user.id, currentPkg.stars);
    setSending(false);
    if (!result.ok) {
      showToast(`❌ Помилка: ${result.error}`);
      return;
    }
    setStep("success");
  }

  function goBack() {
    if (step === "recipient") { onBack(); return; }
    if (step === "package")   { setStep("recipient"); return; }
    if (step === "custom")    { setStep("package"); return; }
    if (step === "method")    { initialPkg ? setStep("recipient") : setStep("package"); return; }
    if (step === "payment")   { setStep("method"); return; }
    onBack();
  }

  if (step === "success") {
    return (
      <div>
        <Header title="Замовлення" onBack={onBack} showLogo={false} />
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <div className="success-title">Замовлення прийнято!</div>
          <div className="success-sub">
            Адміністратор отримав ваш чек і підтвердить замовлення протягом 5–60 хвилин.<br /><br />
            Очікуйте повідомлення у боті 🦆
          </div>
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={onBack}>← На головну</button>
          </div>
        </div>
      </div>
    );
  }

  const stepTitles = {
    recipient: "Кому Stars?",
    package: "Оберіть пакет",
    custom: "Своя кількість",
    method: "Спосіб оплати",
    payment: "Оплата",
  };

  return (
    <div>
      <Header
        title={stepTitles[step]}
        sub={currentPkg ? `${currentPkg.stars} ⭐ · ${currentPkg.price} ₴` : undefined}
        onBack={goBack}
        showLogo={false}
      />
      <div style={{ paddingTop: 16 }}>

        {step === "recipient" && (
          <>
            <div className="section-title">Отримувач зірок</div>
            <div className="recipient-grid">
              <div className={`recipient-card ${recipient === "self" ? "selected" : ""}`} onClick={() => setRecipient("self")}>
                <div className="rc-icon">✨</div>
                <div className="rc-label">Собі</div>
              </div>
              <div className={`recipient-card ${recipient === "friend" ? "selected" : ""}`} onClick={() => setRecipient("friend")}>
                <div className="rc-icon">🎁</div>
                <div className="rc-label">Другу</div>
              </div>
            </div>
            {recipient === "friend" && (
              <>
                <div className="space" />
                <div className="input-wrap">
                  <input className="input-field" placeholder="@username отримувача" value={friendUsername} onChange={e => setFriendUsername(e.target.value)} />
                </div>
                <div className="space" />
                <div className="info-box warning">⚠️ Перевірте правильність нікнейму!</div>
              </>
            )}
            <div className="space" />
            <div className="px">
              <button className="btn btn-primary" onClick={() => {
                if (recipient === "friend" && !friendUsername.startsWith("@")) { showToast("❌ Вкажіть @username друга"); return; }
                setStep(pkg ? "method" : "package");
              }}>Далі →</button>
            </div>
          </>
        )}

        {step === "package" && (
          <>
            <div className="section-title">Пакети Stars</div>
            <div className="package-list">
              {PACKAGES.map(p => (
                <div key={p.stars} className="package-card" onClick={() => { setPkg(p); setStep("method"); }}>
                  <div className="pkg-left">
                    <div className="pkg-icon">⭐</div>
                    <div>
                      <div className="pkg-stars">{p.stars} Stars</div>
                      <div className="pkg-label">{(p.price / p.stars).toFixed(2)} ₴ / зірка</div>
                    </div>
                  </div>
                  <div className="pkg-price">{p.price}<span> ₴</span></div>
                </div>
              ))}
            </div>
            <button className="custom-btn" onClick={() => setStep("custom")}>✏️ Своя кількість</button>
          </>
        )}

        {step === "custom" && (
          <>
            <div className="section-title">Введіть кількість</div>
            <div className="input-wrap">
              <input className="input-field" type="number" placeholder="Мінімум 50 Stars" value={customAmt} onChange={e => setCustomAmt(e.target.value)} />
            </div>
            {customAmt && parseInt(customAmt) >= 50 && (
              <div className="calc-result" style={{ margin: "12px 16px 0" }}>
                <div className="calc-result-value">{Math.round(parseInt(customAmt) * STAR_PRICE * 100) / 100} ₴</div>
                <div className="calc-result-label">до сплати за {parseInt(customAmt)} ⭐</div>
              </div>
            )}
            <div className="space" />
            <div className="px">
              <button className="btn btn-primary" onClick={() => {
                const n = parseInt(customAmt);
                if (!n || n < 50) { showToast("❌ Мінімум 50 зірок"); return; }
                setPkg(null); setStep("method");
              }}>Далі →</button>
            </div>
          </>
        )}

        {step === "method" && (
          <>
            <div className="section-title">Спосіб оплати</div>
            <div className="bank-list">
              {BANKS.map(b => (
                <div key={b.id} className="bank-card" onClick={() => { setBank(b); setStep("payment"); }}>
                  <div style={{ fontSize: 28 }}>{b.id === "sense" ? "🏦" : "🐈"}</div>
                  <div className="bank-card-info">
                    <div className="bank-name">{b.label}</div>
                    <div className="bank-card-num">{b.card}</div>
                  </div>
                  <div className="bank-arrow">›</div>
                </div>
              ))}
              <div className="bank-card" onClick={() => { setBank(BANKS[0]); setStep("payment"); }}>
                <div style={{ fontSize: 28 }}>💵</div>
                <div className="bank-card-info">
                  <div className="bank-name">Готівка</div>
                  <div className="bank-card-num">Sense Bank або Монобанк</div>
                </div>
                <div className="bank-arrow">›</div>
              </div>
            </div>
          </>
        )}

        {step === "payment" && bank && currentPkg && (
          <>
            <div className="section-title">Реквізити</div>
            <div className="pay-box">
              <div className="pay-row">
                <span className="pay-label">Акаунт</span>
                <span className="pay-value">{user.username}</span>
              </div>
              <div className="pay-row">
                <span className="pay-label">Telegram ID</span>
                <span className="pay-value">{user.id}</span>
              </div>
              <div className="pay-divider" />
              <div className="pay-row">
                <span className="pay-label">Картка</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="pay-value">{bank.card}</span>
                  <button className="copy-btn" onClick={() => copyCard(bank.card)}>Копіювати</button>
                </div>
              </div>
              <div className="pay-divider" />
              <div className="pay-row">
                <span className="pay-label">Сума</span>
                <span className="pay-value accent">{currentPkg.price} ₴</span>
              </div>
              <div className="pay-row">
                <span className="pay-label">Товар</span>
                <span className="pay-value">{currentPkg.stars} ⭐</span>
              </div>
              {recipient === "friend" && friendUsername && (
                <div className="pay-row">
                  <span className="pay-label">Для друга</span>
                  <span className="pay-value">{friendUsername}</span>
                </div>
              )}
            </div>
            <div className="space" />

            {/* ФОТО ЧЕКУ */}
            <div className="section-title">Скріншот чеку</div>
            <ReceiptUpload photo={receiptPhoto} onChange={setReceiptPhoto} />

            <div className="space" />
            <div className="info-box warning">
              📸 Зробіть оплату і прикріпіть скріншот — після цього натисніть кнопку нижче.
            </div>
            <div className="space" />
            <div className="px">
              <button
                className="btn btn-primary"
                disabled={sending}
                onClick={submitOrder}
              >
                {sending ? "⏳ Відправляємо..." : receiptPhoto ? "✅ Надіслати замовлення" : "📸 Додайте фото чеку"}
              </button>
            </div>
          </>
        )}
        <div className="space" />
      </div>
    </div>
  );
}

function SellScreen({ onBack, showToast, user }) {
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const n = parseInt(amount);
  const uah = n ? Math.round(n * SELL_STAR_PRICE * 100) / 100 : 0;

  async function submit() {
    setSending(true);
    const msg =
      `💸 <b>Нова заявка на продаж зірок</b>\n` +
      `📱 <b>З приложення</b>\n\n` +
      `👤 Клієнт: <b>${user.username}</b>\n` +
      `🆔 ID: ${user.id}\n` +
      `⭐ Кількість: <b>${n} зірок</b>\n` +
      `💵 До виплати: <b>${uah} грн</b>\n\n` +
      `⏰ ${new Date().toLocaleString("uk-UA")}`;
    await sendToAdmin(msg);
    await sendMsg("@PonPon_kynuvlR", msg);
    setSending(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <Header title="Продаж Stars" onBack={onBack} showLogo={false} />
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <div className="success-title">Заявку подано!</div>
          <div className="success-sub">Адмін отримав сповіщення і зв'яжеться найближчим часом 🦆</div>
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={onBack}>← На головну</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Продати Stars" onBack={onBack} showLogo={false} />
      <div style={{ paddingTop: 16 }}>
        <div className="info-box muted" style={{ margin: "0 16px" }}>
          💰 Ціна: <b style={{ color: "#f5c842" }}>{SELL_STAR_PRICE} ₴ / зірка</b> · Мінімум {SELL_MIN} ⭐
        </div>
        <div className="space" />
        <div className="section-title">Кількість зірок</div>
        <div className="input-wrap">
          <input className="input-field" type="number" placeholder={`Мінімум ${SELL_MIN} Stars`} value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        {n >= SELL_MIN && (
          <div className="calc-result">
            <div className="calc-result-value">{uah} ₴</div>
            <div className="calc-result-label">ви отримаєте за {n} ⭐</div>
          </div>
        )}
        <div className="space" />
        <div className="px">
          <button className="btn btn-primary" disabled={sending} onClick={() => {
            if (!n || n < SELL_MIN) { showToast(`❌ Мінімум ${SELL_MIN} зірок`); return; }
            submit();
          }}>{sending ? "⏳..." : "📩 Подати заявку"}</button>
        </div>
      </div>
    </div>
  );
}

function CalcScreen({ onBack }) {
  const [mode, setMode] = useState("uah");
  const [value, setValue] = useState("");
  const numVal = parseFloat(value);
  let result = null;
  if (mode === "uah" && numVal > 0) result = { label: "зірок", value: Math.floor(numVal / STAR_PRICE) };
  if (mode === "stars" && numVal > 0) result = { label: "₴", value: Math.round(numVal * STAR_PRICE * 100) / 100 };

  return (
    <div>
      <Header title="Калькулятор" onBack={onBack} showLogo={false} />
      <div style={{ paddingTop: 16 }}>
        <div className="btn-row" style={{ marginBottom: 16 }}>
          <button className={`btn ${mode === "uah" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "11px" }} onClick={() => { setMode("uah"); setValue(""); }}>💵 UAH → ⭐</button>
          <button className={`btn ${mode === "stars" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "11px" }} onClick={() => { setMode("stars"); setValue(""); }}>⭐ → UAH</button>
        </div>
        <div className="section-title">{mode === "uah" ? "Сума в гривнях" : "Кількість Stars"}</div>
        <div className="input-wrap">
          <input className="input-field" type="number" placeholder={mode === "uah" ? "100" : "50"} value={value} onChange={e => setValue(e.target.value)} />
        </div>
        {result && (
          <div className="calc-result">
            <div className="calc-result-value">{result.value} {result.label}</div>
            <div className="calc-result-label">{mode === "uah" ? `за ${numVal} ₴` : `за ${parseInt(value)} ⭐`}</div>
          </div>
        )}
        <div className="space" />
        <div className="info-box muted" style={{ margin: "0 16px" }}>
          Купівля: {STAR_PRICE} ₴/⭐ · Продаж: {SELL_STAR_PRICE} ₴/⭐
        </div>
      </div>
    </div>
  );
}

function SupportScreen({ onBack, user }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setSending(true);
    const msg =
      `❓ <b>Запит від клієнта</b>\n` +
      `📱 <b>З приложення</b>\n\n` +
      `👤 Покупець: <b>${user.username}</b>\n` +
      `🆔 ID: ${user.id}\n` +
      `📝 Причина: ${text.trim()}`;
    await sendSupportMsg(msg);
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <Header title="Підтримка" onBack={onBack} showLogo={false} />
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <div className="success-title">Повідомлення надіслано!</div>
          <div className="success-sub">Адміністратор відповість вам найближчим часом 🦆</div>
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={onBack}>← Назад</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Підтримка" onBack={onBack} showLogo={false} />
      <div style={{ paddingTop: 16 }}>
        <div className="info-box muted" style={{ margin: "0 16px" }}>
          💬 Опишіть ваше питання — адмін отримає його і відповість у боті.
        </div>
        <div className="space" />
        <div className="section-title">Ваше питання</div>
        <div className="input-wrap">
          <textarea
            className="input-field"
            rows={5}
            placeholder="Напишіть ваше питання або проблему..."
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ resize: "none", lineHeight: 1.5 }}
          />
        </div>
        <div className="space" />
        <div className="px">
          <button className="btn btn-primary" disabled={sending || !text.trim()} onClick={submit}>
            {sending ? "⏳ Відправляємо..." : "📩 Надіслати"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ onBack, user, onSupport }) {
  return (
    <div>
      <Header title="Профіль" onBack={onBack} showLogo={false} />
      <div className="profile-hero">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-tag">{user.username}</div>
        <div className="tg-id-badge">🆔 {user.id}</div>
      </div>
      <div className="section-title">Дії</div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="bank-card" onClick={onSupport} style={{ cursor: "pointer" }}>
          <div style={{ fontSize: 24 }}>❓</div>
          <div className="bank-card-info"><div className="bank-name">Написати питання</div><div className="bank-card-num">Зв'язатись з адміном</div></div>
          <div className="bank-arrow">›</div>
        </div>
        <a href="https://t.me/PonPon_Reviews" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <div className="bank-card">
            <div style={{ fontSize: 24 }}>💬</div>
            <div className="bank-card-info"><div className="bank-name">Відгуки</div></div>
            <div className="bank-arrow">›</div>
          </div>
        </a>
      </div>
      <div className="space" />
    </div>
  );
}

function AdminScreen({ onBack, showToast, user }) {
  const isAdmin = ADMIN_IDS.includes(user.id) || ADMIN_IDS.includes(String(user.id));
  const [tab, setTab] = useState("users"); // users | actions
  const [searchId, setSearchId] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionAmt, setActionAmt] = useState("");
  const [actionType, setActionType] = useState(null); // give | take | ban | unban

  if (!isAdmin) {
    return (
      <div>
        <Header title="Адмін" onBack={onBack} showLogo={false} />
        <div className="no-access">
          <div className="no-access-icon">🔒</div>
          <div className="no-access-title">Доступ заборонено</div>
          <div className="no-access-sub">Ваш ID: {user.id}</div>
        </div>
      </div>
    );
  }

  async function searchUser() {
    if (!searchId.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${searchId.trim()}`);
      const j = await r.json();
      if (j.ok) {
        setFoundUser({
          id: j.result.id,
          username: j.result.username ? "@" + j.result.username : "—",
          name: [j.result.first_name, j.result.last_name].filter(Boolean).join(" ") || "Невідомий",
          photo: null,
        });
      } else {
        showToast("❌ Юзера не знайдено");
        setFoundUser(null);
      }
    } catch { showToast("❌ Помилка пошуку"); }
    setLoading(false);
  }

  async function sendAdminCmd(cmd) {
    await sendMsg(ADMIN_CHAT_ID, cmd);
    showToast("✅ Команду надіслано боту!");
    setActionType(null);
    setActionAmt("");
  }

  async function doAction() {
    if (!foundUser) return;
    const id = foundUser.id;
    if (actionType === "give" && actionAmt) {
      await sendAdminCmd(`/give_uah ${id} ${actionAmt}`);
    } else if (actionType === "take" && actionAmt) {
      await sendAdminCmd(`/take_uah ${id} ${actionAmt}`);
    } else if (actionType === "ban") {
      await sendAdminCmd(`/ban ${id}`);
    } else if (actionType === "unban") {
      await sendAdminCmd(`/unban ${id}`);
    }
  }

  return (
    <div>
      <div className="admin-header">
        <button className="header-back" onClick={onBack} style={{ color: "#b94fff" }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>👑 Адмін-панель</div>
          <div style={{ fontSize: 11, color: "#7a5a90", marginTop: 2 }}>ID: {user.id}</div>
        </div>
        <span className="admin-badge">ADMIN</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#0d0d1a", borderBottom: "1px solid rgba(185,79,255,0.15)" }}>
        {[{ id: "users", label: "👤 Клієнти" }, { id: "actions", label: "⚡ Дії" }].map(t => (
          <button key={t.id} className="nav-btn" style={{ borderBottom: tab === t.id ? "2px solid #b94fff" : "2px solid transparent", color: tab === t.id ? "#b94fff" : "#4a3a6a", fontSize: 12, textTransform: "none", letterSpacing: 0, padding: "12px 4px" }}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div style={{ paddingTop: 16 }}>

        {/* ПОШУК ЮЗЕРА */}
        <div className="section-title">Пошук клієнта по ID</div>
        <div style={{ padding: "0 16px", display: "flex", gap: 8 }}>
          <input className="input-field" style={{ flex: 1 }} placeholder="Telegram ID (числовий)" value={searchId} onChange={e => setSearchId(e.target.value)} type="number" />
          <button className="btn btn-primary" style={{ width: "auto", padding: "14px 18px", flexShrink: 0 }} onClick={searchUser} disabled={loading}>
            {loading ? "⏳" : "🔍"}
          </button>
        </div>

        {/* ЗНАЙДЕНИЙ ЮЗЕР */}
        {foundUser && (
          <div style={{ margin: "12px 16px 0" }}>
            <div className="pay-box" style={{ background: "linear-gradient(135deg,rgba(185,79,255,0.1),rgba(255,79,163,0.06))", borderColor: "rgba(185,79,255,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#b94fff,#ff4fa3)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#f0e8ff" }}>{foundUser.name}</div>
                  <div style={{ fontSize: 13, color: "#9a7ab0", marginTop: 2 }}>{foundUser.username}</div>
                  <div style={{ fontSize: 11, color: "#6b5a8a", marginTop: 2, fontFamily: "monospace" }}>ID: {foundUser.id}</div>
                </div>
              </div>

              {tab === "users" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13 }} onClick={() => { setTab("actions"); setActionType("give"); }}>💰 Видати грн</button>
                  <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13 }} onClick={() => { setTab("actions"); setActionType("take"); }}>➖ Забрати грн</button>
                  <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13, color: "#ff4fa3", borderColor: "rgba(255,79,163,0.3)" }} onClick={() => { setActionType("ban"); doAction(); }}>🚫 Забанити</button>
                  <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13, color: "#4bc878", borderColor: "rgba(75,200,120,0.3)" }} onClick={() => { setActionType("unban"); doAction(); }}>✅ Розбанити</button>
                </div>
              )}

              {tab === "actions" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[{ id: "give", label: "💰 Видати грн" }, { id: "take", label: "➖ Забрати грн" }].map(a => (
                      <button key={a.id} className="btn btn-ghost" style={{ padding: "10px", fontSize: 13, borderColor: actionType === a.id ? "#b94fff" : undefined, color: actionType === a.id ? "#b94fff" : undefined }} onClick={() => setActionType(a.id)}>{a.label}</button>
                    ))}
                  </div>
                  {(actionType === "give" || actionType === "take") && (
                    <>
                      <input className="input-field" type="number" placeholder="Сума в гривнях" value={actionAmt} onChange={e => setActionAmt(e.target.value)} style={{ marginBottom: 10 }} />
                      <button className="btn btn-primary" onClick={doAction} disabled={!actionAmt}>
                        {actionType === "give" ? "💰 Видати" : "➖ Забрати"}
                      </button>
                    </>
                  )}
                  <div style={{ height: 10 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13, color: "#ff4fa3", borderColor: "rgba(255,79,163,0.3)" }}
                      onClick={async () => { setActionType("ban"); await sendAdminCmd(`/ban ${foundUser.id}`); }}>🚫 Забанити</button>
                    <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13, color: "#4bc878", borderColor: "rgba(75,200,120,0.3)" }}
                      onClick={async () => { setActionType("unban"); await sendAdminCmd(`/unban ${foundUser.id}`); }}>✅ Розбанити</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space" />
        <div className="info-box muted" style={{ margin: "0 16px" }}>
          💡 Команди відправляються боту автоматично. Бот має бути запущений на ноуті для виконання.
        </div>
        <div className="space" />
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [navTab, setNavTab] = useState("home");
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    setUser(getTgUser());
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function goHome() { setScreen("home"); setNavTab("home"); setSelectedPkg(null); }

  const isAdmin = user && ADMIN_IDS.includes(String(user.id));

  const NAV = [
    { id: "home",    icon: "🏠", label: "Магазин" },
    { id: "profile", icon: "👤", label: "Профіль" },
    ...(isAdmin ? [{ id: "admin", icon: "👑", label: "Адмін" }] : []),
  ];

  if (!user) {
    return (
      <>
        <style>{css}</style>
        <div className="app" style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center", color: "#5a5e7a" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            Завантаження...
          </div>
        </div>
      </>
    );
  }

  function renderScreen() {
    switch (screen) {
      case "buy":     return <BuyFlow     onBack={goHome} showToast={showToast} user={user} initialPkg={selectedPkg} />;
      case "sell":    return <SellScreen  onBack={goHome} showToast={showToast} user={user} />;
      case "calc":    return <CalcScreen  onBack={goHome} />;
      case "support": return <SupportScreen onBack={() => setScreen("profile")} user={user} />;
      case "profile": return <ProfileScreen onBack={goHome} user={user} onSupport={() => setScreen("support")} />;
      case "admin":   return <AdminScreen onBack={goHome} showToast={showToast} user={user} />;
      default: return (
        <div>
          <Header title="PonPon Shop" sub="Telegram Stars" />
          <HomeScreen
            onBuy={p => { setSelectedPkg(p); setScreen("buy"); }}
            onSell={() => setScreen("sell")}
            onCalc={() => setScreen("calc")}
            user={user}
          />
        </div>
      );
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="content">{renderScreen()}</div>
        {["home", "profile", "admin"].includes(screen) && (
          <nav className="nav" style={{ gridTemplateColumns: `repeat(${NAV.length}, 1fr)` }}>
            {NAV.map(n => (
              <button key={n.id} className={`nav-btn ${navTab === n.id ? "active" : ""}`}
                onClick={() => { setNavTab(n.id); setScreen(n.id); }}>
                <span className="icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
        )}
        <Toast msg={toast} />
      </div>
    </>
  );
}
