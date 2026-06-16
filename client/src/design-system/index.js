// client/src/design-system/index.js
// BlushBook Design System — single source of truth

export const C = {
  rose:      "#C8345A",
  roseHov:   "#A8284A",
  roseSoft:  "#FFF0F4",
  roseMid:   "#F9D0DA",
  ink:       "#0F0F0F",
  ink2:      "#1C1C1C",
  muted:     "#6B6B6B",
  subtle:    "#9A9A9A",
  line:      "#EBEBEB",
  bg:        "#FFFFFF",
  bgSoft:    "#FAFAFA",
  bgBlush:   "#FEF6F8",
  success:   "#16A34A",
  error:     "#DC2626",
  errorSoft: "#FEF2F2",
  errorLine: "#FECACA",
};

export const F = {
  family: "'Plus Jakarta Sans', -apple-system, sans-serif",
};

export const S = {
  sm:     8,
  md:     12,
  lg:     16,
  xl:     20,
  xxl:    24,
  pill:   100,
  soft:   "0 2px 16px rgba(0,0,0,0.06)",
  card:   "0 4px 24px rgba(0,0,0,0.08)",
  lifted: "0 20px 48px rgba(0,0,0,0.10)",
  float:  "0 8px 32px rgba(0,0,0,0.10)",
  fast:   "0.15s cubic-bezier(0.22,1,0.36,1)",
  normal: "0.25s cubic-bezier(0.22,1,0.36,1)",
  slow:   "0.45s cubic-bezier(0.22,1,0.36,1)",
};

export const authPageStyles = `
  *, *::before, *::after { box-sizing: border-box; }

  input::placeholder { color: #BCBCBC; }

  .bb-page {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: #fff;
  }

  @media (max-width: 768px) {
    .bb-page { grid-template-columns: 1fr !important; }
    .bb-panel-image { display: none !important; }
  }

  .bb-input {
    width: 100%;
    border: 1.5px solid #EBEBEB;
    border-radius: 14px;
    padding: 13px 16px 13px 44px;
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0F0F0F;
    background: #fff;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    letter-spacing: -0.01em;
  }
  .bb-input::placeholder { color: #BCBCBC; }
  .bb-input:focus {
    border-color: #C8345A;
    box-shadow: 0 0 0 3px rgba(200,52,90,0.10);
  }
  .bb-input.error {
    border-color: #F87171;
    background: #FFF8F8;
  }
  .bb-input.success {
    border-color: #4ADE80;
    background: #F0FDF4;
  }

  .bb-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%;
    background: #0F0F0F; color: #fff;
    border: none; border-radius: 14px;
    padding: 14px 24px; font-size: 14px; font-weight: 700;
    cursor: pointer; letter-spacing: -0.01em;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
  }
  .bb-btn-primary:hover:not(:disabled) {
    background: #C8345A;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(200,52,90,0.22);
  }
  .bb-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .bb-btn-google {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%;
    background: #fff; color: #0F0F0F;
    border: 1.5px solid #EBEBEB; border-radius: 14px;
    padding: 13px 24px; font-size: 14px; font-weight: 600;
    cursor: pointer; letter-spacing: -0.01em;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.15s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .bb-btn-google:hover {
    border-color: #C8345A;
    background: #FFF0F4;
    box-shadow: 0 4px 16px rgba(200,52,90,0.10);
    transform: translateY(-1px);
  }

  .bb-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: #6B6B6B;
    border: none; padding: 0;
    font-size: 13px; font-weight: 500;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: color 0.15s;
  }
  .bb-btn-ghost:hover { color: #C8345A; }

  .bb-label {
    display: block;
    font-size: 13px; font-weight: 600; color: #0F0F0F;
    margin-bottom: 7px; letter-spacing: -0.01em;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .bb-field-error {
    font-size: 12px; color: #DC2626;
    margin-top: 6px;
    display: flex; align-items: center; gap: 5px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .bb-divider {
    display: flex; align-items: center; gap: 14px;
    margin: 20px 0;
  }
  .bb-divider::before, .bb-divider::after {
    content: ''; flex: 1; height: 1px; background: #EBEBEB;
  }
  .bb-divider span {
    font-size: 12px; color: #BCBCBC; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap;
  }

  .bb-server-error {
    background: #FFF8F8;
    border: 1.5px solid #FECACA;
    color: #DC2626;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 13px;
    display: flex; align-items: flex-start; gap: 8px;
    margin-bottom: 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .strength-bar { display: flex; gap: 4px; margin-top: 8px; }
  .strength-segment {
    flex: 1; height: 3px; border-radius: 100px;
    background: #EBEBEB; transition: background 0.3s;
  }

  .pw-rule {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: color 0.2s;
  }
  .pw-rule-dot {
    width: 16px; height: 16px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.2s;
  }

  .bb-checkbox {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; user-select: none;
  }
  .bb-checkbox input[type="checkbox"] {
    width: 16px; height: 16px;
    accent-color: #C8345A; cursor: pointer;
  }
  .bb-checkbox span {
    font-size: 13px; color: #6B6B6B;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  @keyframes bbFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bb-fade-up {
    animation: bbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .bb-fade-up-1 { animation-delay: 0.05s; }
  .bb-fade-up-2 { animation-delay: 0.10s; }
  .bb-fade-up-3 { animation-delay: 0.15s; }
  .bb-fade-up-4 { animation-delay: 0.20s; }
  .bb-fade-up-5 { animation-delay: 0.25s; }
`;