import { useState, useEffect, useRef } from "react";

const BOT_TOKEN = "8797577683:AAEuiN1_1lCiBC-prKuCZlao_n1I_tTEMsI";
const ADMIN_CHAT_ID = "8588122425";
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

async function sendToAdmin(text) {
  if (!BOT_TOKEN || BOT_TOKEN === "8797577683:AAEuiN1_1lCiBC-prKuCZlao_n1I_tTEMsI") return true;
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: "HTML" }),
    });
    return r.ok;
  } catch { return false; }
}

async function sendPhotoToAdmin(base64, caption) {
  if (!BOT_TOKEN || BOT_TOKEN === "8797577683:AAEuiN1_1lCiBC-prKuCZlao_n1I_tTEMsI") return true;
  try {
    const res = await fetch(base64);
    const blob = await res.blob();
    const form = new FormData();
    form.append("chat_id", ADMIN_CHAT_ID);
    form.append("photo", blob, "receipt.jpg");
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST", body: form,
    });
    return r.ok;
  } catch { return false; }
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
  .nav-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px 8px; background: none; border: none; color: #4a4e6a; font-size: 10px; font-weight: 600; cursor: pointer; transition: color .15s; letter-spacing: .02em; text-transform: uppercase; }
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
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px; }
  .stat-card { background: #1a1b27; border: 1px solid #252637; border-radius: 14px; padding: 16px; text-align: center; }
  .stat-value { font-size: 22px; font-weight: 800; color: #f5c842; }
  .stat-label { font-size: 11px; color: #5a5e7a; margin-top: 4px; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
  .admin-header { background: linear-gradient(135deg,#1e1020,#16111a); padding: 20px; border-bottom: 1px solid #2a1e30; display: flex; align-items: center; gap: 12px; }
  .admin-badge { background: linear-gradient(135deg,#c87dff,#a050e0); color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .calc-result { margin: 14px 16px 0; background: rgba(245,200,66,.08); border: 1px solid rgba(245,200,66,.2); border-radius: 14px; padding: 20px; text-align: center; }
  .calc-result-value { font-size: 28px; font-weight: 800; color: #f5c842; }
  .calc-result-label { font-size: 12px; color: #7a7e98; margin-top: 4px; }
  .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #252637; border: 1px solid #3a3e5a; color: #e0e1f0; padding: 10px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; z-index: 999; white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,.4); animation: fadeIn .15s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }
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

  /* ФОТО ЧЕКУ */
  .receipt-upload {
    margin: 0 16px;
    border: 2px dashed #2e3048;
    border-radius: 16px;
    padding: 24px 16px;
    text-align: center;
    cursor: pointer;
    transition: all .2s;
    background: #1a1b27;
  }
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

    const caption =
      `🛒 <b>НОВЕ ЗАМОВЛЕННЯ #${orderId}</b>\n\n` +
      `👤 Від: <b>${user.name}</b> (${user.username})\n` +
      `🆔 Telegram ID: <code>${user.id}</code>\n\n` +
      `⭐ Зірок: <b>${currentPkg.stars}</b>\n` +
      `💵 Сума: <b>${currentPkg.price} ₴</b>\n` +
      `🏦 Оплата: <b>${bank.label}</b>\n` +
      `${recipientText}\n\n` +
      `⏰ ${new Date().toLocaleString("uk-UA")}`;

    await sendPhotoToAdmin(receiptPhoto, caption);
    setSending(false);
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
      `💸 <b>ЗАЯВКА НА ПРОДАЖ ЗІРОК</b>\n\n` +
      `👤 Від: <b>${user.name}</b> (${user.username})\n` +
      `🆔 Telegram ID: <code>${user.id}</code>\n\n` +
      `⭐ Кількість: <b>${n}</b>\n` +
      `💵 До виплати: <b>${uah} ₴</b>\n\n` +
      `⏰ ${new Date().toLocaleString("uk-UA")}`;
    await sendToAdmin(msg);
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

function ProfileScreen({ onBack, user }) {
  return (
    <div>
      <Header title="Профіль" onBack={onBack} showLogo={false} />
      <div className="profile-hero">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-tag">{user.username}</div>
        <div className="tg-id-badge">🆔 {user.id}</div>
      </div>
      <div className="section-title">Посилання</div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "💬", label: "Відгуки", url: "https://t.me/PonPon_Reviews" },
          { icon: "📢", label: "Підтримка", url: "https://t.me/Ponpon_Support" },
        ].map(l => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="bank-card">
              <div style={{ fontSize: 24 }}>{l.icon}</div>
              <div className="bank-card-info"><div className="bank-name">{l.label}</div></div>
              <div className="bank-arrow">›</div>
            </div>
          </a>
        ))}
      </div>
      <div className="space" />
    </div>
  );
}

function AdminScreen({ onBack, user }) {
  const isAdmin = ADMIN_IDS.includes(user.id) || ADMIN_IDS.includes(String(user.id));
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
  return (
    <div>
      <div className="admin-header">
        <button className="header-back" onClick={onBack} style={{ color: "#c87dff" }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>👑 Адмін-панель</div>
          <div style={{ fontSize: 11, color: "#7a5a90", marginTop: 2 }}>ID: {user.id}</div>
        </div>
        <span className="admin-badge">ADMIN</span>
      </div>
      <div style={{ padding: "24px 16px" }}>
        <div className="info-box success" style={{ margin: 0 }}>
          ✅ Ви адміністратор. Замовлення з фото чеків надходять у Telegram-бот автоматично.
        </div>
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
      case "profile": return <ProfileScreen onBack={goHome} user={user} />;
      case "admin":   return <AdminScreen onBack={goHome} user={user} />;
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
