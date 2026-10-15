import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import { startSocialSignIn } from "../lib/oauth.js";

export default function OAuthButtons() {
  const [loading, setLoading] = useState("");

  async function start(provider) {
    if (loading) return;
    setLoading(provider);
    try {
      await startSocialSignIn(provider);
    } catch (error) {
      toast.error(error.message || "Couldn't start social sign-in.");
      setLoading("");
    }
  }

  const buttonClass = "flex h-[50px] w-full items-center justify-center gap-3 rounded-xl border border-[var(--auth-border)] bg-[var(--auth-surface)] px-4 text-sm font-medium text-[var(--auth-text)] transition duration-150 hover:border-[var(--auth-accent)]/50 hover:bg-[var(--auth-input)] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--auth-accent)]/15";

  return (
    <div className="w-full space-y-3">
      <button type="button" onClick={() => start("google")} disabled={!!loading} className={buttonClass}>
        <FcGoogle className="text-lg" aria-hidden="true" />
        <span>{loading === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>
      <button type="button" onClick={() => start("github")} disabled={!!loading} className={buttonClass}>
        <FaGithub className="text-base" />
        <span>{loading === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
      </button>
    </div>
  );
}
