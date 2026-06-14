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
  { id: "sense", label: "рџЏ¦ Sense Bank", card: "4028 0820 1302 5224", holder: "Oleksandr K." },
  { id: "mono", label: "рџђ€ РњРѕРЅРѕР±Р°РЅРє", card: "4441 1144 2865 2257", holder: "Oleksandr K." },
];

// ---- Fake data for demo ----
const fakeUsers = [
  { id: 1, num: 1, username: "@user_one", name: "РћР»РµРі", balance: 120, stars: 500, banned: false },
  { id: 2, num: 2, username: "@anna_shop", name: "РђРЅРЅР°", balance: 0, stars: 200, banned: false },
  { id: 3, num: 3, username: "@max_tg", name: "РњР°РєСЃРёРј", balance: 45, stars: 750, banned: false },
];

const fakePendingOrders = [
  { id: "ord1", uid: 1, username: "@user_one", stars: 100, price: 75, method: "РљР°СЂС‚РєР° Sense Bank", recipient: "self" },
  { id: "ord2", uid: 2, username: "@anna_shop", stars: 50, price: 40, method: "РљР°СЂС‚РєР° РњРѕРЅРѕР±Р°РЅРє", recipient: "friend", friendUsername: "@friend_tg" },
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
      {onBack && <button className="header-back" onClick={onBack}>вЂ№</button>}
      {showLogo && <div className="header-logo">в­ђ</div>}
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
        <div className="hero-star">в­ђ</div>
        <div className="hero-title">PonPon <span>Shop</span></div>
        <div className="hero-sub">Telegram Stars вЂ” С€РІРёРґРєРѕ С‚Р° РЅР°РґС–Р№РЅРѕ</div>
        <div className="price-badge">в­ђ 1 Р·С–СЂРєР° = {STAR_PRICE} в‚ґ</div>
      </div>

      <div className="section-title">РџРѕРїСѓР»СЏСЂРЅС– РїР°РєРµС‚Рё</div>
      <div className="package-list">
        {PACKAGES.map(p => (
          <div key={p.stars} className="package-card" onClick={() => onBuy(p)}>
            <div className="pkg-left">
              <div className="pkg-icon">в­ђ</div>
              <div>
                <div className="pkg-stars">{p.stars} Stars</div>
                <div className="pkg-label">Telegram Stars</div>
              </div>
            </div>
            <div className="pkg-price">{p.price}<span> в‚ґ</span></div>
          </div>
        ))}
      </div>
      <button className="custom-btn" onClick={() => onBuy(null)}>вњЏпёЏ РЎРІРѕСЏ РєС–Р»СЊРєС–СЃС‚СЊ</button>

      <div className="section-title">Р†РЅС€Рµ</div>
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onSell}>рџ’° РџСЂРѕРґР°С‚Рё Stars</button>
        <button className="btn btn-ghost" onClick={onCalc}>рџ”„ РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ</button>
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
    showToast("вњ… РЎРєРѕРїС–Р№РѕРІР°РЅРѕ!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function submitOrder() {
    setStep("success");
  }

  if (step === "success") {
    return (
      <div>
        <Header title="Р—Р°РјРѕРІР»РµРЅРЅСЏ" onBack={onBack} showLogo={false} />
        <div className="success-screen">
          <div className="success-icon">вЏі</div>
          <div className="success-title">Р§РµРє РЅР°РґС–СЃР»Р°РЅРѕ!</div>
          <div className="success-sub">РђРґРјС–РЅС–СЃС‚СЂР°С‚РѕСЂ РїС–РґС‚РІРµСЂРґРёС‚СЊ РІР°С€Рµ Р·Р°РјРѕРІР»РµРЅРЅСЏ РїСЂРѕС‚СЏРіРѕРј 5вЂ“60 С…РІРёР»РёРЅ.<br /><br />РћС‡С–РєСѓР№С‚Рµ РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ Сѓ Р±РѕС‚С– рџ¦†</div>
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={onBack}>в†ђ РќР° РіРѕР»РѕРІРЅСѓ</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={step === "recipient" ? "РљРѕРјСѓ Stars?" : step === "package" || step === "custom" ? "РћР±РµСЂС–С‚СЊ РїР°РєРµС‚" : step === "method" ? "РЎРїРѕСЃС–Р± РѕРїР»Р°С‚Рё" : step === "bank" ? "РћР±РµСЂС–С‚СЊ Р±Р°РЅРє" : "РћРїР»Р°С‚Р°"}
        sub={currentPkg ? `${currentPkg.stars} в­ђ В· ${currentPkg.price} в‚ґ` : undefined}
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
            <div className="section-title">РћС‚СЂРёРјСѓРІР°С‡ Р·С–СЂРѕРє</div>
            <div className="recipient-grid">
              <div className={`recipient-card ${recipient === "self" ? "selected" : ""}`} onClick={() => setRecipient("self")}>
                <div className="rc-icon">вњЁ</div>
                <div className="rc-label">РЎРѕР±С–</div>
              </div>
              <div className={`recipient-card ${recipient === "friend" ? "selected" : ""}`} onClick={() => setRecipient("friend")}>
                <div className="rc-icon">рџЋЃ</div>
                <div className="rc-label">Р”СЂСѓРіСѓ</div>
              </div>
            </div>
            {recipient === "friend" && (
              <>
                <div className="space" />
                <div className="
