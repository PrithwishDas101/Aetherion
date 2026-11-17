import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const palettes = {
  warm: {
    page: "#F0F0EA",
    surface: "#FFFFFF",
    input: "#F7F8F3",
    border: "#C8CDC2",
    text: "#1D211C",
    muted: "#62685F",
    accent: "#454A43",
    primary: "#292D28",
    primaryText: "#FFFFFF",
    panel: "#E7E7E1",
    panelText: "#22241F",
    panelMuted: "#676A63",
    line: "#85867F",
    glow: "#A3A39A",
  },
  night: {
    page: "#171817",
    surface: "#202220",
    input: "#1B1E1B",
    border: "#343733",
    text: "#E9E9E3",
    muted: "#A4A59D",
    accent: "#DADBD4",
    primary: "#DADBD4",
    primaryText: "#20211F",
    panel: "#222320",
    panelText: "#E9E9E3",
    panelMuted: "#A4A59D",
    line: "#777A72",
    glow: "#A2A398",
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

  React.useEffect(() => {
    document.documentElement.dataset.aetherionTheme = theme;
  }, [theme]);

  function changeTheme(nextTheme) {
    setTheme(nextTheme);
    try {
      window.localStorage.setItem("aetherion-auth-theme", nextTheme);
      document.documentElement.dataset.aetherionTheme = nextTheme;
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
            <img src="/favicon.png" alt="" className="h-9 w-9 object-contain" />
            <span className="text-[15px] font-semibold tracking-[-0.025em]">Aetherion</span>
          </a>
          <div className="flex items-center rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1" aria-label="Color theme">
            <button type="button" onClick={() => changeTheme("warm")} aria-label="Use light mode" aria-pressed={theme === "warm"} className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-accent)] ${theme === "warm" ? "bg-[var(--auth-primary)] text-[var(--auth-primary-text)]" : "text-[var(--auth-muted)] hover:text-[var(--auth-text)]"}`}>
              <FaSun size={12} /> <span className="hidden sm:inline">Light</span>
            </button>
            <button type="button" onClick={() => changeTheme("night")} aria-label="Use dark mode" aria-pressed={theme === "night"} className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-accent)] ${theme === "night" ? "bg-[var(--auth-primary)] text-[var(--auth-primary-text)]" : "text-[var(--auth-muted)] hover:text-[var(--auth-text)]"}`}>
              <FaMoon size={12} /> <span className="hidden sm:inline">Dark</span>
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {children}
        </div>

        <p className="pt-2 text-center text-xs text-[var(--auth-muted)] lg:text-left">Thoughtfully made for your next chapter.</p>
      </section>

      <aside
        style={{
          backgroundColor: palette.panel,
          backgroundImage: theme === "night"
            ? "radial-gradient(ellipse at 88% 5%, rgba(255,255,255,.055) 0%, transparent 42%), linear-gradient(145deg, #242521 0%, #1d1e1b 100%)"
            : "radial-gradient(ellipse at 88% 5%, rgba(255,255,255,.78) 0%, transparent 42%), linear-gradient(145deg, #e9e9e3 0%, #deded7 100%)",
        }}
        className="relative m-3 hidden min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[28px] border border-[var(--auth-border)]/70 p-10 text-[var(--auth-panel-text)] shadow-[0_1px_3px_rgba(0,0,0,0.035)] transition-colors duration-300 lg:flex lg:flex-col xl:p-14"
      >
        <div className="pointer-events-none absolute -right-28 -top-28 h-[440px] w-[440px] rounded-full border border-[var(--auth-line)]/15" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-[300px] w-[300px] rounded-full border border-[var(--auth-line)]/10" />
        <div className="pointer-events-none absolute -bottom-36 -left-32 h-[420px] w-[420px] rounded-full border border-[var(--auth-line)]/10" />

        <div className="relative z-10 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--auth-panel-muted)]">
          <span className="h-px w-8 bg-[var(--auth-line)]" />
          <span>Aetherion</span>
          <span className="h-px w-8 bg-[var(--auth-line)]/40" />
          <span className="tracking-[0.14em] opacity-70">A space of your own</span>
        </div>

        <div className="relative z-10 my-auto max-w-[620px] py-12">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--auth-panel-muted)]">
            {page === "signup" ? "A fresh start" : "Welcome to your space"}
          </p>
          <h2 className="max-w-[560px] text-5xl font-medium leading-[1.04] tracking-[-0.06em] xl:text-[68px]">
            Make room for
            <span className="mt-1 block font-serif font-normal italic tracking-[-0.055em]">
              {page === "signup" ? "what's next." : "what matters."}
            </span>
          </h2>
          <p className="mt-7 max-w-[390px] text-[15px] leading-7 text-[var(--auth-panel-muted)]">
            {page === "signup"
              ? "A calmer place to connect, create, and bring your ideas together."
              : "Your people, your ideas, and the things you're building—all in one place."}
          </p>

          <div className="relative mt-12 h-[220px] max-w-[540px] overflow-hidden rounded-[26px] border border-[var(--auth-line)]/20 bg-[var(--auth-surface)]/35 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
            <style>{`@keyframes authLabelGlow { 0%, 100% { border-color: color-mix(in srgb, var(--auth-line) 24%, transparent); color: var(--auth-panel-muted); box-shadow: 0 1px 2px rgba(0,0,0,.025); } 12%, 28% { border-color: color-mix(in srgb, var(--auth-line) 72%, transparent); color: var(--auth-panel-text); box-shadow: 0 0 18px color-mix(in srgb, var(--auth-line) 12%, transparent); } } .auth-path-label { animation: authLabelGlow 8s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .auth-path-label { animation: none !important; } }`}</style>
            <svg viewBox="0 0 540 210" className="h-full w-full" fill="none" aria-hidden="true">
              <path d="M-10 166 C 70 166, 73 55, 165 55 S 254 172, 338 128 S 431 18, 550 36" stroke="var(--auth-line)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 9" opacity=".8" />
              <path d="M-10 190 C 75 190, 92 96, 170 96 S 252 195, 343 153 S 445 56, 550 75" stroke="var(--auth-line)" strokeWidth="1" strokeLinecap="round" opacity=".28" />
              <path d="M-10 143 C 84 143, 104 25, 174 25 S 268 146, 347 105 S 438 0, 550 17" stroke="var(--auth-line)" strokeWidth="1" strokeLinecap="round" opacity=".16" />
              <circle cx="165" cy="55" r="7" fill="var(--auth-accent)" />
              <circle cx="338" cy="128" r="6" fill="var(--auth-panel)" stroke="var(--auth-line)" strokeWidth="2" />
              <circle cx="457" cy="39" r="9" fill="var(--auth-panel)" stroke="var(--auth-accent)" strokeWidth="2" />
              <circle cx="165" cy="55" r="17" stroke="var(--auth-line)" strokeWidth="1" opacity=".42" />
              <circle cx="457" cy="39" r="23" stroke="var(--auth-line)" strokeWidth="1" opacity=".28" />
              <circle r="4" fill="var(--auth-accent)" opacity=".9">
                <animateMotion dur="8s" calcMode="paced" repeatCount="indefinite" path="M-10 166 C 70 166, 73 55, 165 55 S 254 172, 338 128 S 431 18, 550 36" />
              </circle>
              <circle r="11" fill="var(--auth-accent)" opacity=".1">
                <animateMotion dur="8s" calcMode="paced" repeatCount="indefinite" path="M-10 166 C 70 166, 73 55, 165 55 S 254 172, 338 128 S 431 18, 550 36" />
              </circle>
            </svg>
            <div className="auth-path-label absolute left-[22%] top-1 rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)]/85 px-3 py-1.5 text-[11px] text-[var(--auth-muted)] shadow-sm" style={{ animationDelay: "0s" }}>Ideas</div>
            <div className="auth-path-label absolute right-[9%] top-[46%] rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)]/85 px-3 py-1.5 text-[11px] text-[var(--auth-muted)] shadow-sm" style={{ animationDelay: "2.65s" }}>People</div>
            <div className="auth-path-label absolute bottom-1 left-[53%] rounded-full border border-[var(--auth-border)] bg-[var(--auth-surface)]/85 px-3 py-1.5 text-[11px] text-[var(--auth-muted)] shadow-sm" style={{ animationDelay: "5.3s" }}>Possibilities</div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-[var(--auth-line)]/25 pt-5 text-xs text-[var(--auth-panel-muted)]">
          <span>A little more room for what matters.</span>
          <span className="font-medium tracking-[0.12em]">AETHERION</span>
        </div>
      </aside>
    </main>
  );
}
