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
  body { font-family: 'Inter', sans-serif; background: #0e0f14; color: #e8e9f0; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #1a1b22; }
  ::-webkit-scrollbar-thumb { background: #f5c842; border-radius: 2px; }
  .app { max-width: 420px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #12131a; }
  .header { background: linear-gradient(135deg,#1a1b27 0%,#16171f 100%); padding: 16px 20px 14px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #1e2030; position: sticky; top: 0; z-index: 100; }
  .header-back { background: none; border: none; color: #f5c842; font-size: 22px; cursor: pointer; padding: 0 4px; line-height: 1; }
  .header-logo { width: 36px; height: 36px; background: linear-gradient(135deg,#f5c842,#ff9d00); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; box-shadow: 0 0 16px rgba(245,200,66,.3); }
  .header-title { font-size: 17px; font-weight: 700; color: #f0f1f8; }
  .header-sub { font-size: 11px; color: #6b7090; margin-top: 1px; }
  .nav { display: grid; grid-template-columns: repeat(3,1fr); background: #0e0f14; border-top: 1px solid #1e2030; position: sticky; bottom: 0; z-index: 100; }
  .nav-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px 8px; background: none; border: none; color: #4a4e6a; font-size: 10px; font-weight: 600; cursor: pointer; transition: color .15s; letter-spacing: .02em; text-transform: uppercase; -webkit-tap-highlight-color: transparent; }
  .nav-btn .icon { font-size: 20px; line-height: 1; }
  .nav-btn.active { color: #f5c842; }
  .content { flex: 1; overflow-y: auto; padding-bottom: 20px; }
  .hero { background: linear-gradient(135deg,#1a1b27 0%,#14151e 100%); padding: 28px 20px 24px; text-align: center; border-bottom: 1px solid #1e2030; }
  .hero-star { font-size: 52px; filter: drop-shadow(0 0 18px rgba(245,200,66,.5)); margin-bottom: 12px; }
  .hero-title { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -.5px; }
  .hero-title span { color: #f5c842; }
  .hero-sub { font-size: 13px; color: #6b7090; margin-top: 6px; }
  .price-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(245,200,66,.1); border: 1px solid rgba(245,200,66,.25); color: #f5c842; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; margin-top: 14px; }
  .section-title { font-size: 11px; font-weight: 700; color: #4a4e6a; letter-spacing: .08em; text-transform: uppercase; padding: 20px 20px 10px; }
  .package-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .package-card { background: #1a1b27; border: 1px solid #252637; border-radius: 14px; padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all .15s; }
  .package-card:hover { border-color: #f5c842; background: rgba(245,200,66,.06); }
  .pkg-left { display: flex; align-items: center; gap: 12px; }
  .pkg-icon { width: 44px; height: 44px; background: linear-gradient(135deg,#2a2010,#332800); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .pkg-stars { font-size: 17px; font-weight: 700; color: #f0f1f8; }
  .pkg-label { font-size: 12px; color: #5a5e7a; margin-top: 1px; }
  .pkg-price { font-size: 18px; font-weight: 800; color: #f5c842; }
  .pkg-price span { font-size: 12px; font-weight: 500; color: #7a7e98; }
  .custom-btn { margin: 10px 16px 0; padding: 14px; background: #1a1b27; border: 1px dashed #2e3048; border-radius: 14px; color: #8a8eb0; font-size: 14px; font-weight: 600; text-align: center; cursor: pointer; transition: all .15s; display: block; width: calc(100% - 32px); }
  .custom-btn:hover { border-color: #f5c842; color: #f5c842; }
  .btn { display: block; width: 100%; padding: 15px; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; transition: all .15s; text-align: center; }
  .btn-primary { background: linear-gradient(135deg,#f5c842,#ff9d00); color: #0e0f14; box-shadow: 0 4px 20px rgba(245,200,66,.3); }
  .btn-primary:hover { box-shadow: 0 4px 28px rgba(245,200,66,.5); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .btn-ghost { background: #1a1b27; border: 1px solid #252637; color: #8a8eb0; }
  .btn-ghost:hover { border-color: #3a3e5a; color: #c8cae0; }
  .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }
  .bank-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .bank-card { background: #1a1b27; border: 1px solid #252637; border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all .15s; }
  .bank-card:hover { border-color: #f5c842; background: rgba(245,200,66,.04); }
  .bank-card-info { flex: 1; }
  .bank-name { font-size: 15px; font-weight: 600; color: #e0e1f0; }
  .bank-card-num { font-size: 12px; color: #5a5e7a; margin-top: 2px; font-family: monospace; }
  .bank-arrow { color: #4a4e6a; font-size: 14px; }
  .pay-box { margin: 0 16px; background: #1a1b27; border: 1px solid #252637; border-radius: 16px; padding: 20px; }
  .pay-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .pay-row:last-child { margin-bottom: 0; }
  .pay-label { font-size: 12px; color: #5a5e7a; }
  .pay-value { font-size: 14px; font-weight: 600; color: #e0e1f0; font-family: monospace; }
  .pay-value.accent { color: #f5c842; }
  .pay-divider { height: 1px; background: #1e2030; margin: 14px 0; }
  .copy-btn { background: rgba(245,200,66,.1); border: 1px solid rgba(245,200,66,.25); color: #f5c842; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; }
  .recipient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }
  .recipient-card { background: #1a1b27; border: 1px solid #252637; border-radius: 14px; padding: 20px 14px; text-align: center; cursor: pointer; transition: all .15s; }
  .recipient-card:hover,.recipient-card.selected { border-color: #f5c842; background: rgba(245,200,66,.06); }
  .recipient-card .rc-icon { font-size: 30px; margin-bottom: 8px; }
  .recipient-card .rc-label { font-size: 13px; font-weight: 700; color: #e0e1f0; }
  .input-wrap { padding: 0 16px; }
  .input-field { width: 100%; background: #1a1b27; border: 1px solid #252637; border-radius: 14px; padding: 14px 16px; font-size: 15px; color: #e8e9f0; font-family: 'Inter',sans-serif; outline: none; transition: border-color .15s; }
  .input-field:focus { border-color: #f5c842; }
  .input-field::placeholder { color: #3a3e5a; }
  .info-box { margin: 0 16px; padding: 14px 16px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
  .info-box.warning { background: rgba(245,200,66,.08); border: 1px solid rgba(245,200,66,.2); color: #c8a830; }
  .info-box.success { background: rgba(75,200,120,.08); border: 1px solid rgba(75,200,120,.2); color: #4bc878; }
  .info-box.muted { background: rgba(255,255,255,.04); border: 1px solid #1e2030; color: #5a5e7a; }
  .profile-hero { background: linear-gradient(135deg,#1a1b27 0%,#14151e 100%); padding: 28px 20px 24px; text-align: center; border-bottom: 1px solid #1e2030; }
  .profile-avatar { width: 72px; height: 72px; background: linear-gradient(135deg,#f5c842,#ff9d00); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 34px; margin: 0 auto 14px; box-shadow: 0 0 24px rgba(245,200,66,.3); }
  .profile-name { font-size: 20px; font-weight: 800; color: #fff; }
  .profile-tag { font-size: 13px; color: #5a5e7a; margin-top: 4px; }
  .tg-id-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,.05); border: 1px solid #252637; border-radius: 8px; padding: 3px 8px; font-size: 11px; color: #5a5e7a; font-family: monospace; margin-top: 6px; }
  .admin-header { background: linear-gradient(135deg,#1e1020,#16111a); padding: 20px; border-bottom: 1px solid #2a1e30; display: flex; align-items: center; gap: 12px; }
  .admin-badge { background: linear-gradient(135deg,#c87dff,#a050e0); color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .calc-result { margin: 14px 16px 0; background: rgba(245,200,66,.08); border: 1px solid rgba(245,200,66,.2); border-radius: 14px; padding: 20px; text-align: center; }
  .calc-result-value { font-size: 28px; font-weight: 800; color: #f5c842; }
  .calc-result-label { font-size: 12px; color: #7a7e98; margin-top: 4px; }
  .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #252637; border: 1px solid #3a3e5a; color: #e0e1f0; padding: 10px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; z-index: 999; white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,.4); animation: fadeIn .15s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .success-screen { text-align: center; padding: 48px 24px 32px; }
  .success-icon { font-size: 64px; margin-bottom: 16px; }
  .success-title { font-size: 22px; font-weight: 800; color: #fff; }
  .success-sub { font-size: 14px; color: #5a5e7a; margin-top: 8px; line-height: 1.5; }
  .space { height: 16px; }
  .px { padding: 0 16px; }
  .no-access { text-align:center; padding: 60px 24px; }
  .no-access-icon { font-size: 48px; margin-bottom:16px; }
  .no-access-title { font-size:18px; font-weight:800; color:#ff6b6b; }
  .no-access-sub { font-size:13px; color:#5a5e7a; margin-top:8px; }
  .receipt-upload { margin: 0 16px; border: 2px dashed #2e3048; border-radius: 16px; padding: 24px 16px; text-align: center; cursor: pointer; transition: all .2s; background: #1a1b27; }
  .receipt-upload:hover { border-color: #f5c842; background: rgba(245,200,66,.04); }
  .receipt-upload.has-photo { border-color: #4bc878; border-style: solid; padding: 0; overflow: hidden; }
  .receipt-upload-icon { font-size: 36px; margin-bottom: 10px; }
  .receipt-upload-text { font-size: 14px; font-weight: 600; color: #8a8eb0; }
  .receipt-upload-sub { font-size: 12px; color: #4a4e6a; margin-top: 4px; }
  .receipt-preview { width: 100%; max-height: 240px; object-fit: cover; display: block; border-radius: 14px; }
  .receipt-change { display: block; padding: 10px; font-size: 12px; color: #5a5e7a; text-align: center; cursor: pointer; background: #1a1b27; border: none; width: 100%; font-family: 'Inter',sans-serif; }
  .receipt-change:hover { color: #f5c842; }
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
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    async function loadAvatar() {
      if (!user.id || user.id === "demo") { setAvatarLoading(false); return; }
      try {
        const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${user.id}&limit=1`);
        const j = await r.json();
        if (j.ok && j.result.total_count > 0) {
          const fileId = j.result.photos[0][0].file_id;
          const r2 = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
          const j2 = await r2.json();
          if (j2.ok) {
            setAvatarUrl(`https://api.telegram.org/file/bot${BOT_TOKEN}/${j2.result.file_path}`);
          }
        }
      } catch {}
      setAvatarLoading(false);
    }
    loadAvatar();
  }, [user.id]);

  return (
    <div>
      <Header title="Профіль" onBack={onBack} showLogo={false} />
      <div className="profile-hero">
        <div className="profile-avatar" style={{ overflow: "hidden", padding: 0, position: "relative" }}>
          {avatarLoading && (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2a2010,#332800)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.2s ease-in-out infinite" }}>
              <span style={{ fontSize: 30, opacity: 0.4 }}>👤</span>
            </div>
          )}
          {!avatarLoading && avatarUrl && (
            <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 24 }} />
          )}
          {!avatarLoading && !avatarUrl && (
            <span style={{ fontSize: 34 }}>👤</span>
          )}
        </div>
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

function ClientProfileScreen({ onBack, showToast }) {
  const [searchId, setSearchId] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [banned, setBanned] = useState(false);

  async function searchClient() {
    if (!searchId.trim()) return;
    setLoading(true);
    setClient(null);
    setAvatarUrl(null);
    try {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${searchId.trim()}`);
      const j = await r.json();
      if (j.ok) {
        const u = j.result;
        const found = {
          id: String(u.id),
          username: u.username ? "@" + u.username : "—",
          name: [u.first_name, u.last_name].filter(Boolean).join(" ") || "Невідомий",
          firstSeen: "Немає даних",
          lastPurchase: "Немає даних",
          purchaseHistory: [],
          status: "клієнт",
        };
        setClient(found);
        setBanned(false);
        // Завантажити аватар
        try {
          const r2 = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${u.id}&limit=1`);
          const j2 = await r2.json();
          if (j2.ok && j2.result.total_count > 0) {
            const fid = j2.result.photos[0][0].file_id;
            const r3 = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fid}`);
            const j3 = await r3.json();
            if (j3.ok) setAvatarUrl(`https://api.telegram.org/file/bot${BOT_TOKEN}/${j3.result.file_path}`);
          }
        } catch {}
      } else {
        showToast("❌ Юзера не знайдено");
      }
    } catch { showToast("❌ Помилка пошуку"); }
    setLoading(false);
  }

  async function banClient() {
    await sendToAdmin(`🚫 <b>БАН</b>\nАдмін заблокував клієнта ID: <code>${client.id}</code> (${client.username})`);
    setBanned(true);
    showToast("🚫 Клієнта заблоковано");
  }
  async function unbanClient() {
    await sendToAdmin(`✅ <b>РОЗБАН</b>\nАдмін розблокував клієнта ID: <code>${client.id}</code> (${client.username})`);
    setBanned(false);
    showToast("✅ Клієнта розблоковано");
  }

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#1e1020,#16111a)", padding: "16px 20px 14px", borderBottom: "1px solid #2a1e30", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#b94fff", fontSize: 22, cursor: "pointer", padding: "0 4px" }}>‹</button>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#f0e8ff" }}>🔍 Пошук клієнта</div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input-field" style={{ flex: 1 }} placeholder="Telegram ID або @username" value={searchId}
            onChange={e => setSearchId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchClient()} />
          <button className="btn btn-primary" style={{ width: "auto", padding: "14px 18px", flexShrink: 0, background: "linear-gradient(135deg,#b94fff,#ff4fa3)" }}
            onClick={searchClient} disabled={loading}>
            {loading ? "⏳" : "🔍"}
          </button>
        </div>
      </div>

      {client && (
        <div style={{ padding: "16px 16px 0" }}>
          {/* Профіль */}
          <div style={{ background: "linear-gradient(135deg,rgba(185,79,255,0.1),rgba(255,79,163,0.06))", border: "1px solid rgba(185,79,255,0.25)", borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
              {/* Аватар */}
              <div style={{ width: 72, height: 72, borderRadius: 20, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#b94fff,#ff4fa3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              {/* Інфо */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#f0e8ff", marginBottom: 2 }}>{client.name}</div>
                <div style={{ fontSize: 13, color: "#9a7ab0" }}>{client.username}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.05)", border: "1px solid #2a1e30", borderRadius: 8, padding: "2px 8px", fontSize: 11, color: "#7a5a8a", fontFamily: "monospace", marginTop: 5 }}>
                  🆔 {client.id}
                </div>
              </div>
            </div>

            {/* Статус */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#7a5a9a" }}>Статус</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: banned ? "#ff4fa3" : "#4bc878" }}>
                {banned ? "🚫 Заблоковано" : "✅ Клієнт"}
              </span>
            </div>

            {/* Інфо рядки */}
            {[
              { label: "Остання покупка", value: client.lastPurchase },
              { label: "Перший захід", value: client.firstSeen },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#5a4a7a" }}>{row.label}</span>
                <span style={{ fontSize: 13, color: "#c8b8e8", fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}

            {/* Дії */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13, color: "#ff4fa3", borderColor: "rgba(255,79,163,0.3)" }} onClick={banClient}>🚫 Забанити</button>
              <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 13, color: "#4bc878", borderColor: "rgba(75,200,120,0.3)" }} onClick={unbanClient}>✅ Розбанити</button>
            </div>
          </div>

          {/* Написати питання / Відгуки */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "❓", label: "Написати питання", sub: "Зв'язатись з адміном", color: "#b94fff" },
              { icon: "💬", label: "Відгуки", sub: "Перейти до каналу", color: "#f5c842" },
            ].map(item => (
              <div key={item.label} style={{ background: "#1a1b27", border: "1px solid #252637", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#e0e1f0" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#5a5e7a", marginTop: 2 }}>{item.sub}</div>
                </div>
                <div style={{ color: "#4a4e6a", fontSize: 18 }}>›</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space" />
    </div>
  );
}

function AdminScreen({ onBack, showToast, user }) {
  const isAdmin = ADMIN_IDS.includes(user.id) || ADMIN_IDS.includes(String(user.id));
  const [subScreen, setSubScreen] = useState(null);

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

  if (subScreen === "search") return <ClientProfileScreen onBack={() => setSubScreen(null)} showToast={showToast} />;

  const ACTIONS = [
    { icon: "🔍", label: "Пошук клієнта", sub: "Профіль по ID / юз", color: "#b94fff", onClick: () => setSubScreen("search") },
    { icon: "📦", label: "Замовлення", sub: "Нові заявки", color: "#f5c842", onClick: async () => { await sendToAdmin("📦 /orders — список замовлень"); showToast("📦 Запит надіслано"); } },
    { icon: "💸", label: "Заявки продаж", sub: "Переглянути", color: "#4bc878", onClick: async () => { await sendToAdmin("💸 /sell_requests — заявки на продаж"); showToast("💸 Запит надіслано"); } },
    { icon: "📊", label: "Статистика", sub: "Дохід / угоди", color: "#ff9d00", onClick: async () => { await sendToAdmin("📊 /stats — статистика магазину"); showToast("📊 Запит надіслано"); } },
  ];

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

      <div style={{ padding: "20px 16px 0" }}>
        <div className="section-title" style={{ padding: "0 0 14px" }}>Дії</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {ACTIONS.map(a => <AdminActionCard key={a.label} {...a} />)}
        </div>
      </div>
      <div className="space" />
    </div>
  );
}

function AdminActionCard({ icon, label, sub, color, onClick }) {
  const [loading, setLoading] = useState(false);
  return (
    <button onClick={async () => { setLoading(true); await onClick(); setLoading(false); }} disabled={loading}
      style={{ background: "#1a1b27", border: `1px solid ${color}30`, borderRadius: 18, padding: "20px 14px", cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all .15s", opacity: loading ? 0.6 : 1 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{loading ? "⏳" : icon}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#e0e1f0" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#5a5e7a" }}>{sub}</div>
    </button>
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
