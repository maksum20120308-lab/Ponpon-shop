import { useState } from "react";

const STAR_PRICE = 0.8;
const SELL_STAR_PRICE = 0.4;
const SELL_MIN = 200;

const PACKAGES = [
  { stars: 50, price: 40 },
  { stars: 100, price: 75 },
  { stars: 250, price: 200 },
];

const BANKS = [
  { id: "sense", label: "🏦 Sense Bank", card: "4028 0820 1302 5224", holder: "Oleksandr K." },
  { id: "mono", label: "🐈 Монобанк", card: "4441 1144 2865 2257", holder: "Oleksandr K." },
];

// ---- Fake data for demo ----
const fakeUsers = [
  { id: 1, num: 1, username: "@user_one", name: "Олег", balance: 120, stars: 500, banned: false },
  { id: 2, num: 2, username: "@anna_shop", name: "Анна", balance: 0, stars: 200, banned: false },
  { id: 3, num: 3, username: "@max_tg", name: "Максим", balance: 45, stars: 750, banned: false },
];

const fakePendingOrders = [
  { id: "ord1", uid: 1, username: "@user_one", stars: 100, price: 75, method: "Картка Sense Bank", recipient: "self" },
  { id: "ord2", uid: 2, username: "@anna_shop", stars: 50, price: 40, method: "Картка Монобанк", recipient: "friend", friendUsername: "@friend_tg" },
];

// ---- Styles ----
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: #0e0f14;
    color: #e8e9f0;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #1a1b22; }
  ::-webkit-scrollbar-thumb { background: #f5c842; border-radius: 2px; }

  .app {
    max-width: 420px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #12131a;
    position: relative;
    overflow: hidden;
  }

  /* Header */
  .header {
    background: linear-gradient(135deg, #1a1b27 0%, #16171f 100%);
    padding: 16px 20px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #1e2030;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-back {
    background: none;
    border: none;
    color: #f5c842;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }
  .header-logo {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #f5c842, #ff9d00);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 0 16px rgba(245,200,66,0.3);
  }
  .header-title { font-size: 17px; font-weight: 700; color: #f0f1f8; }
  .header-sub { font-size: 11px; color: #6b7090; margin-top: 1px; }

  /* Nav */
  .nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    background: #0e0f14;
    border-top: 1px solid #1e2030;
    position: sticky;
    bottom: 0;
    z-index: 100;
  }
  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px 4px 8px;
    background: none;
    border: none;
    color: #4a4e6a;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .nav-btn .icon { font-size: 20px; line-height: 1; }
  .nav-btn.active { color: #f5c842; }
  .nav-btn:hover { color: #c8a830; }

  /* Content */
  .content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  /* Home screen */
  .hero {
    background: linear-gradient(135deg, #1a1b27 0%, #14151e 100%);
    padding: 28px 20px 24px;
    text-align: center;
    border-bottom: 1px solid #1e2030;
  }
  .hero-star { font-size: 52px; filter: drop-shadow(0 0 18px rgba(245,200,66,0.5)); margin-bottom: 12px; }
  .hero-title { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .hero-title span { color: #f5c842; }
  .hero-sub { font-size: 13px; color: #6b7090; margin-top: 6px; }

  .price-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(245,200,66,0.1);
    border: 1px solid rgba(245,200,66,0.25);
    color: #f5c842;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    margin-top: 14px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 700;
    color: #4a4e6a;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 20px 20px 10px;
  }

  /* Cards */
  .package-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .package-card {
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.15s;
  }
  .package-card:hover, .package-card.selected {
    border-color: #f5c842;
    background: rgba(245,200,66,0.06);
    box-shadow: 0 0 0 1px rgba(245,200,66,0.15);
  }
  .pkg-left { display: flex; align-items: center; gap: 12px; }
  .pkg-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #2a2010, #332800);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .pkg-stars { font-size: 17px; font-weight: 700; color: #f0f1f8; }
  .pkg-label { font-size: 12px; color: #5a5e7a; margin-top: 1px; }
  .pkg-price {
    font-size: 18px;
    font-weight: 800;
    color: #f5c842;
  }
  .pkg-price span { font-size: 12px; font-weight: 500; color: #7a7e98; }

  .custom-btn {
    margin: 10px 16px 0;
    padding: 14px;
    background: #1a1b27;
    border: 1px dashed #2e3048;
    border-radius: 14px;
    color: #8a8eb0;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    display: block;
    width: calc(100% - 32px);
  }
  .custom-btn:hover { border-color: #f5c842; color: #f5c842; background: rgba(245,200,66,0.04); }

  /* Buttons */
  .btn {
    display: block;
    width: 100%;
    padding: 15px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    text-align: center;
  }
  .btn-primary {
    background: linear-gradient(135deg, #f5c842, #ff9d00);
    color: #0e0f14;
    box-shadow: 0 4px 20px rgba(245,200,66,0.3);
  }
  .btn-primary:hover { box-shadow: 0 4px 28px rgba(245,200,66,0.5); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-ghost {
    background: #1a1b27;
    border: 1px solid #252637;
    color: #8a8eb0;
  }
  .btn-ghost:hover { border-color: #3a3e5a; color: #c8cae0; }
  .btn-danger {
    background: rgba(255,75,75,0.1);
    border: 1px solid rgba(255,75,75,0.3);
    color: #ff6b6b;
  }

  .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }

  /* Bank select */
  .bank-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .bank-card {
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .bank-card:hover { border-color: #f5c842; background: rgba(245,200,66,0.04); }
  .bank-card-info { flex: 1; }
  .bank-name { font-size: 15px; font-weight: 600; color: #e0e1f0; }
  .bank-card-num { font-size: 12px; color: #5a5e7a; margin-top: 2px; font-family: monospace; letter-spacing: 0.05em; }
  .bank-arrow { color: #4a4e6a; font-size: 14px; }

  /* Payment info */
  .pay-box {
    margin: 0 16px;
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 16px;
    padding: 20px;
  }
  .pay-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .pay-row:last-child { margin-bottom: 0; }
  .pay-label { font-size: 12px; color: #5a5e7a; }
  .pay-value { font-size: 14px; font-weight: 600; color: #e0e1f0; font-family: monospace; }
  .pay-value.accent { color: #f5c842; }
  .pay-divider { height: 1px; background: #1e2030; margin: 14px 0; }

  .copy-btn {
    background: rgba(245,200,66,0.1);
    border: 1px solid rgba(245,200,66,0.25);
    color: #f5c842;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .copy-btn:hover { background: rgba(245,200,66,0.2); }

  /* Recipient selector */
  .recipient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }
  .recipient-card {
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 14px;
    padding: 20px 14px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .recipient-card:hover, .recipient-card.selected { border-color: #f5c842; background: rgba(245,200,66,0.06); }
  .recipient-card .rc-icon { font-size: 30px; margin-bottom: 8px; }
  .recipient-card .rc-label { font-size: 13px; font-weight: 700; color: #e0e1f0; }

  /* Input */
  .input-wrap { padding: 0 16px; }
  .input-field {
    width: 100%;
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 15px;
    color: #e8e9f0;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s;
  }
  .input-field:focus { border-color: #f5c842; }
  .input-field::placeholder { color: #3a3e5a; }

  /* Info boxes */
  .info-box {
    margin: 0 16px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.5;
  }
  .info-box.warning { background: rgba(245,200,66,0.08); border: 1px solid rgba(245,200,66,0.2); color: #c8a830; }
  .info-box.success { background: rgba(75,200,120,0.08); border: 1px solid rgba(75,200,120,0.2); color: #4bc878; }
  .info-box.muted { background: rgba(255,255,255,0.04); border: 1px solid #1e2030; color: #5a5e7a; }

  /* Profile */
  .profile-hero {
    background: linear-gradient(135deg, #1a1b27 0%, #14151e 100%);
    padding: 28px 20px 24px;
    text-align: center;
    border-bottom: 1px solid #1e2030;
  }
  .profile-avatar {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, #f5c842, #ff9d00);
    border-radius: 24px;
    display: flex; align-items: center; justify-content: center;
    font-size: 34px;
    margin: 0 auto 14px;
    box-shadow: 0 0 24px rgba(245,200,66,0.3);
  }
  .profile-name { font-size: 20px; font-weight: 800; color: #fff; }
  .profile-tag { font-size: 13px; color: #5a5e7a; margin-top: 4px; }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px; }
  .stat-card {
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 14px;
    padding: 16px;
    text-align: center;
  }
  .stat-value { font-size: 22px; font-weight: 800; color: #f5c842; }
  .stat-label { font-size: 11px; color: #5a5e7a; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }

  /* Admin panel */
  .admin-header {
    background: linear-gradient(135deg, #1e1020, #16111a);
    padding: 20px;
    border-bottom: 1px solid #2a1e30;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .admin-badge {
    background: linear-gradient(135deg, #c87dff, #a050e0);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.05em;
  }
  .order-card {
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 14px;
    padding: 16px;
    margin: 0 16px 10px;
  }
  .order-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .order-user { font-size: 14px; font-weight: 700; color: #e0e1f0; }
  .order-method { font-size: 11px; color: #5a5e7a; margin-top: 2px; }
  .order-stars { font-size: 20px; font-weight: 800; color: #f5c842; text-align: right; }
  .order-price { font-size: 12px; color: #5a5e7a; text-align: right; }
  .order-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
  .btn-sm {
    padding: 9px 12px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    text-align: center;
  }
  .btn-sm-ok { background: rgba(75,200,120,0.15); color: #4bc878; border: 1px solid rgba(75,200,120,0.25); }
  .btn-sm-ok:hover { background: rgba(75,200,120,0.25); }
  .btn-sm-no { background: rgba(255,75,75,0.1); color: #ff6b6b; border: 1px solid rgba(255,75,75,0.2); }
  .btn-sm-no:hover { background: rgba(255,75,75,0.2); }

  .users-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
  .user-row {
    background: #1a1b27;
    border: 1px solid #252637;
    border-radius: 12px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .user-num {
    width: 28px; height: 28px;
    background: rgba(245,200,66,0.1);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: #f5c842;
    flex-shrink: 0;
  }
  .user-info { flex: 1; }
  .user-name { font-size: 14px; font-weight: 600; color: #e0e1f0; }
  .user-tag { font-size: 11px; color: #5a5e7a; }
  .user-stats { text-align: right; }
  .user-bal { font-size: 13px; font-weight: 700; color: #f5c842; }
  .user-stars-count { font-size: 11px; color: #5a5e7a; }

  /* Calc */
  .calc-result {
    margin: 14px 16px 0;
    background: rgba(245,200,66,0.08);
    border: 1px solid rgba(245,200,66,0.2);
    border-radius: 14px;
    padding: 20px;
    text-align: center;
  }
  .calc-result-value { font-size: 28px; font-weight: 800; color: #f5c842; }
  .calc-result-label { font-size: 12px; color: #7a7e98; margin-top: 4px; }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #252637;
    border: 1px solid #3a3e5a;
    color: #e0e1f0;
    padding: 10px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    z-index: 999;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  .space { height: 16px; }
  .px { padding: 0 16px; }

  /* Success screen */
  .success-screen {
    text-align: center;
    padding: 48px 24px 32px;
  }
  .success-icon { font-size: 64px; margin-bottom: 16px; filter: drop-shadow(0 0 20px rgba(75,200,120,0.4)); }
  .success-title { font-size: 22px; font-weight: 800; color: #fff; }
  .success-sub { font-size: 14px; color: #5a5e7a; margin-top: 8px; line-height: 1.5; }
`;

// ---- Components ----
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

// ---- Screens ----
function HomeScreen({ onBuy, onSell, onCalc }) {
  return (
    <div>
      <div className="hero">
        <div className="hero-star">⭐</div>
        <div className="hero-title">PonPon <span>Shop</span></div>
        <div className="hero-sub">Telegram Stars — швидко та надійно</div>
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
                <div className="pkg-label">Telegram Stars</div>
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

function BuyFlow({ onBack, showToast }) {
  const [step, setStep] = useState("recipient"); // recipient | package | custom | method | bank | payment | success
  const [recipient, setRecipient] = useState("self");
  const [friendUsername, setFriendUsername] = useState("");
  const [pkg, setPkg] = useState(null);
  const [customAmt, setCustomAmt] = useState("");
  const [bank, setBank] = useState(null);
  const [copied, setCopied] = useState(false);

  const currentPkg = pkg || (customAmt ? { stars: parseInt(customAmt), price: Math.round(parseInt(customAmt) * STAR_PRICE * 100) / 100 } : null);

  function copyCard(text) {
    navigator.clipboard.writeText(text).catch(() => {});
    showToast("✅ Скопійовано!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function submitOrder() {
    setStep("success");
  }

  if (step === "success") {
    return (
      <div>
        <Header title="Замовлення" onBack={onBack} showLogo={false} />
        <div className="success-screen">
          <div className="success-icon">⏳</div>
          <div className="success-title">Чек надіслано!</div>
          <div className="success-sub">Адміністратор підтвердить ваше замовлення протягом 5–60 хвилин.<br /><br />Очікуйте повідомлення у боті 🦆</div>
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={onBack}>← На головну</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={step === "recipient" ? "Кому Stars?" : step === "package" || step === "custom" ? "Оберіть пакет" : step === "method" ? "Спосіб оплати" : step === "bank" ? "Оберіть банк" : "Оплата"}
        sub={currentPkg ? `${currentPkg.stars} ⭐ · ${currentPkg.price} ₴` : undefined}
        onBack={() => {
          if (step === "recipient") onBack();
          else if (step === "package") setStep("recipient");
          else if (step === "custom") setStep("package");
          else if (step === "method") setStep("package");
          else if (step === "bank") setStep("method");
          else if (step === "payment") setStep("bank");
        }}
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
                  <input
                    className="input-field"
                    placeholder="@username отримувача"
                    value={friendUsername}
                    onChange={e => setFriendUsername(e.target.value)}
                  />
                </div>
                <div className="space" />
                <div className="info-box warning" style={{ margin: "0 16px" }}>
                  ⚠️ Перевірте правильність нікнейму перед підтвердженням!
                </div>
              </>
            )}
            <div className="space" />
            <div className="px">
              <button className="btn btn-primary" onClick={() => {
                if (recipient === "friend" && !friendUsername.startsWith("@")) {
                  showToast("❌ Вкажіть @username друга");
                  return;
                }
                setStep("package");
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
              <input
                className="input-field"
                type="number"
                placeholder="Мінімум 50 Stars"
                value={customAmt}
                onChange={e => setCustomAmt(e.target.value)}
              />
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
                setPkg(null);
                setStep("method");
              }}>Далі →</button>
            </div>
          </>
        )}

        {step === "method" && (
          <>
            <div className="section-title">Спосіб оплати</div>
            <div className="bank-list">
              <div className="bank-card" onClick={() => { setBank(BANKS[0]); setStep("payment"); }}>
                <div style={{ fontSize: 28 }}>🏦</div>
                <div className="bank-card-info">
                  <div className="bank-name">Картка Sense Bank</div>
                  <div className="bank-card-num">{BANKS[0].card}</div>
                </div>
                <div className="bank-arrow">›</div>
              </div>
              <div className="bank-card" onClick={() => { setBank(BANKS[1]); setStep("payment"); }}>
                <div style={{ fontSize: 28 }}>🐈</div>
                <div className="bank-card-info">
                  <div className="bank-name">Картка Монобанк</div>
                  <div className="bank-card-num">{BANKS[1].card}</div>
                </div>
                <div className="bank-arrow">›</div>
              </div>
              <div className="bank-card" onClick={() => { setBank(BANKS[0]); setStep("payment"); }}>
                <div style={{ fontSize: 28 }}>💵</div>
                <div className="bank-card-info">
                  <div className="bank-name">Готівка (термінал/банкомат)</div>
                  <div className="bank-card-num">Sense Bank або Монобанк</div>
                </div>
                <div className="bank-arrow">›</div>
              </div>
            </div>
          </>
        )}

        {step === "payment" && bank && currentPkg && (
          <>
            <div className="section-title">Реквізити для оплати</div>
            <div className="pay-box">
              <div className="pay-row">
                <span className="pay-label">Банк</span>
                <span className="pay-value">{bank.label}</span>
              </div>
              <div className="pay-row">
                <span className="pay-label">Отримувач</span>
                <span className="pay-value">{bank.holder}</span>
              </div>
              <div className="pay-divider" />
              <div className="pay-row">
                <span className="pay-label">Номер картки</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="pay-value">{bank.card}</span>
                  <button className="copy-btn" onClick={() => copyCard(bank.card)}>Копіювати</button>
                </div>
              </div>
              <div className="pay-divider" />
              <div className="pay-row">
                <span className="pay-label">Сума до оплати</span>
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
            <div className="info-box warning" style={{ margin: "0 16px" }}>
              📸 Після оплати надішліть скріншот чеку адміністратору в боті. Підтвердження протягом 5–60 хв.
            </div>
            <div className="space" />
            <div className="px">
              <button className="btn btn-primary" onClick={submitOrder}>✅ Я оплатив(ла)</button>
            </div>
          </>
        )}
        <div className="space" />
      </div>
    </div>
  );
}

function SellScreen({ onBack, showToast }) {
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const n = parseInt(amount);
  const uah = n ? Math.round(n * SELL_STAR_PRICE * 100) / 100 : 0;

  if (submitted) {
    return (
      <div>
        <Header title="Продаж Stars" onBack={onBack} showLogo={false} />
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <div className="success-title">Заявку подано!</div>
          <div className="success-sub">Ми зв'яжемось з вами найближчим часом 🦆</div>
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
          💰 Ви продаєте зірки, ми платимо вам готівкою.<br />
          Ціна: <b style={{ color: "#f5c842" }}>{SELL_STAR_PRICE} ₴ / зірка</b> · Мінімум {SELL_MIN} ⭐
        </div>
        <div className="space" />
        <div className="section-title">Кількість зірок для продажу</div>
        <div className="input-wrap">
          <input
            className="input-field"
            type="number"
            placeholder={`Мінімум ${SELL_MIN} Stars`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        {n >= SELL_MIN && (
          <div className="calc-result">
            <div className="calc-result-value">{uah} ₴</div>
            <div className="calc-result-label">ви отримаєте за {n} ⭐</div>
          </div>
        )}
        <div className="space" />
        <div className="px">
          <button className="btn btn-primary" onClick={() => {
            if (!n || n < SELL_MIN) { showToast(`❌ Мінімум ${SELL_MIN} зірок`); return; }
            setSubmitted(true);
          }}>📩 Подати заявку</button>
        </div>
      </div>
    </div>
  );
}

function CalcScreen({ onBack }) {
  const [mode, setMode] = useState("uah"); // uah | stars
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
          <button className={`btn ${mode === "stars" ? "btn-primary" : "btn-ghost"}`} style={{ padding: "11px" }} onClick={() => { setMode("stars"); setValue(""); }}>⭐ → 💵 UAH</button>
        </div>
        <div className="section-title">{mode === "uah" ? "Введіть суму в гривнях" : "Введіть кількість Stars"}</div>
        <div className="input-wrap">
          <input
            className="input-field"
            type="number"
            placeholder={mode === "uah" ? "100" : "50"}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </div>
        {result && (
          <div className="calc-result">
            <div className="calc-result-value">{result.value} {result.label}</div>
            <div className="calc-result-label">
              {mode === "uah" ? `за ${numVal} ₴` : `за ${parseInt(value)} ⭐`}
            </div>
          </div>
        )}
        <div className="space" />
        <div className="info-box muted" style={{ margin: "0 16px" }}>
          Курс: ⭐ 1 зірка = {STAR_PRICE} ₴ (купівля) · {SELL_STAR_PRICE} ₴ (продаж)
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ onBack }) {
  return (
    <div>
      <Header title="Профіль" onBack={onBack} showLogo={false} />
      <div className="profile-hero">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">@your_username</div>
        <div className="profile-tag">ID: 123456789 · №1</div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">350</div>
          <div className="stat-label">⭐ Stars куплено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0 ₴</div>
          <div className="stat-label">💳 Баланс</div>
        </div>
      </div>
      <div className="section-title">Канали</div>
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

function AdminScreen({ onBack, showToast }) {
  const [tab, setTab] = useState("orders"); // orders | users
  const [orders, setOrders] = useState(fakePendingOrders);
  const [users] = useState(fakeUsers);

  function approveOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id));
    showToast("✅ Замовлення підтверджено!");
  }
  function rejectOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id));
    showToast("❌ Замовлення відхилено");
  }

  return (
    <div>
      <div className="admin-header">
        <button className="header-back" onClick={onBack} style={{ color: "#c87dff" }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>👑 Адмін-панель</div>
        </div>
        <span className="admin-badge">ADMIN</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, background: "#0e0f14", borderBottom: "1px solid #1e2030" }}>
        {[{ id: "orders", label: `Замовлення (${orders.length})` }, { id: "users", label: "Користувачі" }].map(t => (
          <button key={t.id} className="nav-btn" style={{ borderBottom: tab === t.id ? "2px solid #c87dff" : "2px solid transparent", color: tab === t.id ? "#c87dff" : "#4a4e6a", fontSize: 12, textTransform: "none", letterSpacing: 0 }}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div style={{ paddingTop: 16 }}>
        {tab === "orders" && (
          orders.length === 0
            ? <div style={{ textAlign: "center", padding: "48px 24px", color: "#4a4e6a", fontSize: 14 }}>🎉 Немає нових замовлень</div>
            : orders.map(o => (
              <div key={o.id} className="order-card">
                <div className="order-top">
                  <div>
                    <div className="order-user">{o.username}</div>
                    <div className="order-method">{o.method}{o.recipient === "friend" ? ` · 🎁 для ${o.friendUsername}` : ""}</div>
                  </div>
                  <div>
                    <div className="order-stars">{o.stars} ⭐</div>
                    <div className="order-price">{o.price} ₴</div>
                  </div>
                </div>
                <div className="order-actions">
                  <button className="btn-sm btn-sm-ok" onClick={() => approveOrder(o.id)}>✅ Підтвердити</button>
                  <button className="btn-sm btn-sm-no" onClick={() => rejectOrder(o.id)}>❌ Відхилити</button>
                </div>
              </div>
            ))
        )}
        {tab === "users" && (
          <div className="users-list">
            {users.map(u => (
              <div key={u.id} className="user-row">
                <div className="user-num">#{u.num}</div>
                <div className="user-info">
                  <div className="user-name">{u.name}</div>
                  <div className="user-tag">{u.username}</div>
                </div>
                <div className="user-stats">
                  <div className="user-bal">{u.balance} ₴</div>
                  <div className="user-stars-count">{u.stars} ⭐</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space" />
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [screen, setScreen] = useState("home"); // home | buy | sell | calc | profile | admin
  const [navTab, setNavTab] = useState("home");
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function goHome() { setScreen("home"); setNavTab("home"); }

  const NAV = [
    { id: "home", icon: "🏠", label: "Магазин" },
    { id: "profile", icon: "👤", label: "Профіль" },
    { id: "admin", icon: "👑", label: "Адмін" },
  ];

  function renderScreen() {
    switch (screen) {
      case "buy": return <BuyFlow onBack={goHome} showToast={showToast} />;
      case "sell": return <SellScreen onBack={goHome} showToast={showToast} />;
      case "calc": return <CalcScreen onBack={goHome} />;
      case "profile": return <ProfileScreen onBack={goHome} />;
      case "admin": return <AdminScreen onBack={goHome} showToast={showToast} />;
      default: return (
        <div>
          <Header title="PonPon Shop" sub="Telegram Stars" />
          <HomeScreen
            onBuy={pkg => { setScreen("buy"); }}
            onSell={() => setScreen("sell")}
            onCalc={() => setScreen("calc")}
          />
        </div>
      );
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="content">
          {renderScreen()}
        </div>
        {["home", "profile", "admin"].includes(screen) && (
          <nav className="nav">
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
