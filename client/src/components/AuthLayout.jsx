import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const deepForestGreen = "#202622";

const palettes = {
  warm: {
    page: "#F4F1EA",
    surface: "#FFFEFA",
    input: "#F5F3EE",
    border: "#E5E0D7",
    text: "#252A27",
    muted: "#777C75",
    accent: deepForestGreen,
    primary: deepForestGreen,
    primaryText: "#FFFFFF",
    panel: "#E8EDE4",
    panelText: "#25372C",
    panelMuted: "#657568",
    line: deepForestGreen,
    glow: deepForestGreen,
  },
  night: {
    page: "#070908",
    surface: "#101311",
    input: "#0B0E0C",
    border: "#252B27",
    text: "#F1F5F1",
    muted: "#9BA69E",
    accent: "#B8C2BA",
    primary: "#111512",
    primaryText: "#FFFFFF",
    panel: "#090D0B",
    panelText: "#F1F5F1",
    panelMuted: "#9BA69E",
    line: "#202722",
    glow: "#0A100C",
  },
};

export default function AuthLayout({ children, page = "login" }) {
  const [theme, setTheme] = React.useState(() => {
    try {
      return window.localStorage.getItem("aetherion-auth-theme") === "night" ? "night" : "warm";
    } catch {
      return "warm";
    }
  });
  const palette = palettes[theme];

  function changeTheme(nextTheme) {
    setTheme(nextTheme);
    try {
      window.localStorage.setItem("aetherion-auth-theme", nextTheme);
    } catch {
      // The theme still works for the current visit when storage is unavailable.
    }
  }

  return (
    <main
      style={{
        "--auth-page": palette.page,
        "--auth-surface": palette.surface,
        "--auth-input": palette.input,
        "--auth-border": palette.border,
        "--auth-text": palette.text,
        "--auth-muted": palette.muted,
        "--auth-accent": palette.accent,
        "--auth-primary": palette.primary,
        "--auth-primary-text": palette.primaryText,
        "--auth-panel": palette.panel,
        "--auth-panel-text": palette.panelText,
        "--auth-panel-muted": palette.panelMuted,
        "--auth-line": palette.line,
        "--auth-glow": palette.glow,
      }}
      className="min-h-screen bg-[var(--auth-page)] font-sans text-[var(--auth-text)] transition-colors duration-300 lg:grid lg:grid-cols-[minmax(440px,0.92fr)_1.08fr]"
    >
      <section className="relative flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-12 xl:px-[clamp(3rem,7vw,7rem)]">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-accent)]" aria-label="Aetherion home">
            <img src="/images/logo.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-[15px] font-semibold tracking-[-0.025em]">Aetherion</span>
          </a>
          <div className="flex items-center rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1" aria-label="Color theme">
            <button type="button" onClick={() => changeTheme("warm")} aria-label="Use warm theme" aria-pressed={theme === "warm"} className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-accent)] ${theme === "warm" ? "bg-[var(--auth-primary)] text-[var(--auth-primary-text)]" : "text-[var(--auth-muted)] hover:text-[var(--auth-text)]"}`}>
              <FaSun size={12} /> <span className="hidden sm:inline">Warm</span>
            </button>
            <button type="button" onClick={() => changeTheme("night")} aria-label="Use night theme" aria-pressed={theme === "night"} className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-accent)] ${theme === "night" ? "bg-[var(--auth-primary)] text-[var(--auth-primary-text)]" : "text-[var(--auth-muted)] hover:text-[var(--auth-text)]"}`}>
              <FaMoon size={12} /> <span className="hidden sm:inline">Night</span>
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {children}
        </div>

        <p className="pt-2 text-center text-xs text-[var(--auth-muted)] lg:text-left">Thoughtfully made for your next chapter.</p>
      </section>

      <aside style={{ backgroundColor: palette.panel, backgroundImage: theme === "night" ? "radial-gradient(ellipse at 92% 3%, rgba(10, 16, 12, 0.12) 0%, rgba(10, 16, 12, 0.05) 20%, transparent 46%)" : undefined }} className="relative m-3 hidden min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[28px] bg-[var(--auth-panel)] p-10 text-[var(--auth-panel-text)] transition-colors duration-300 lg:flex lg:flex-col xl:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl" style={{ background: palette.glow }} />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[360px] w-[360px] rounded-full opacity-10 blur-3xl" style={{ background: palette.glow }} />
        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--auth-panel-muted)]">
          <span className="h-px w-7 bg-[var(--auth-line)]" /> Aetherion
        </div>

        <div className="relative z-10 my-auto max-w-[620px] py-16">
          <h2 className="max-w-[560px] text-5xl font-medium leading-[1.08] tracking-[-0.055em] xl:text-6xl">
            Make room for <span className="font-serif italic">{page === "signup" ? "what's next." : "what matters."}</span>
          </h2>
          <p className="mt-6 max-w-[390px] text-base leading-7 text-[var(--auth-panel-muted)]">
            {page === "signup" ? "A calmer place to connect, create, and bring your ideas together." : "Your people, your ideas, and the things you're building—all in one place."}
          </p>

          <div className="relative mt-14 h-[210px] max-w-[540px]">
            <style>{`@keyframes authLabelGlow { 0%, 100% { border-color: var(--auth-border); color: var(--auth-muted); box-shadow: 0 1px 2px rgba(0,0,0,.04); } 12%, 28% { border-color: var(--auth-accent); color: var(--auth-panel-text); box-shadow: 0 0 22px color-mix(in srgb, var(--auth-accent) 18%, transparent); } } .auth-path-label { animation: authLabelGlow 8s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .auth-path-label { animation: none !important; } }`}</style>
            <svg viewBox="0 0 540 210" className="h-full w-full" fill="none" aria-hidden="true">
              <path d="M-10 166 C 70 166, 73 55, 165 55 S 254 172, 338 128 S 431 18, 550 36" stroke="var(--auth-line)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 8" opacity=".8" />
              <path d="M-10 190 C 75 190, 92 96, 170 96 S 252 195, 343 153 S 445 56, 550 75" stroke="var(--auth-line)" strokeWidth="1" strokeLinecap="round" opacity=".35" />
              <circle cx="165" cy="55" r="7" fill="var(--auth-accent)" />
              <circle cx="338" cy="128" r="6" fill="var(--auth-panel)" stroke="var(--auth-line)" strokeWidth="2" />
              <circle cx="457" cy="39" r="9" fill="var(--auth-panel)" stroke="var(--auth-accent)" strokeWidth="2" />
              <circle cx="165" cy="55" r="17" stroke="var(--auth-line)" strokeWidth="1" opacity=".5" />
              <circle cx="457" cy="39" r="23" stroke="var(--auth-line)" strokeWidth="1" opacity=".35" />
              <circle r="4.5" fill="var(--auth-accent)" opacity=".95"><animateMotion dur="8s" calcMode="paced" repeatCount="indefinite" path="M-10 166 C 70 166, 73 55, 165 55 S 254 172, 338 128 S 431 18, 550 36" /></circle>
              <circle r="10" fill="var(--auth-accent)" opacity=".18"><animateMotion dur="8s" calcMode="paced" repeatCount="indefinite" path="M-10 166 C 70 166, 73 55, 165 55 S 254 172, 338 128 S 431 18, 550 36" /></circle>
            </svg>
            <div className="auth-path-label absolute left-[22%] top-0 rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)]/80 px-3 py-1.5 text-[11px] text-[var(--auth-muted)] shadow-sm" style={{ animationDelay: "0s" }}>Ideas</div>
            <div className="auth-path-label absolute right-[10%] top-1/2 rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)]/80 px-3 py-1.5 text-[11px] text-[var(--auth-muted)] shadow-sm" style={{ animationDelay: "2.65s" }}>People</div>
            <div className="auth-path-label absolute bottom-0 left-[53%] rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)]/80 px-3 py-1.5 text-[11px] text-[var(--auth-muted)] shadow-sm" style={{ animationDelay: "5.3s" }}>Possibilities</div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-[var(--auth-line)]/30 pt-5 text-xs text-[var(--auth-panel-muted)]">
          <span>One step at a time.</span>
          <span>01 — 03</span>
        </div>
      </aside>
    </main>
  );
}
