import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginUser } from "../apiCalls/authApi.js";
import { hideLoader, showLoader } from "../redux/sliceLoader.js";
import AuthLayout from "../components/AuthLayout.jsx";
import OAuthButtons from "../components/OAuthButtons.jsx";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState({
    email: location.state?.email || "",
    password: "",
  });

  async function onFormSubmit(event) {
    event.preventDefault();
    dispatch(showLoader());
    try {
      const response = await loginUser(user);
      if (response.success) {
        localStorage.setItem("token", response.token);
        toast(`Welcome ${response.user.firstName}`, { icon: null });
        navigate("/");
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      dispatch(hideLoader());
    }
  }

  return (
    <AuthLayout page="login">
      <div>
        <p className="text-sm font-medium text-[var(--auth-accent)]">Good to see you again</p>
        <h1 className="mt-3 text-[34px] font-semibold leading-[1.08] tracking-[-0.055em] text-[var(--auth-text)] sm:text-[38px]">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--auth-muted)]">Sign in to continue to your Aetherion space.</p>
      </div>

      <form onSubmit={onFormSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-[var(--auth-text)]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={user.email} onChange={(event) => setUser({ ...user, email: event.target.value })} className="h-[50px] w-full rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input)] px-4 text-sm text-[var(--auth-text)] outline-none transition placeholder:text-[var(--auth-muted)]/70 focus:border-[var(--auth-accent)] focus:ring-4 focus:ring-[var(--auth-accent)]/10" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-[var(--auth-text)]">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" value={user.password} onChange={(event) => setUser({ ...user, password: event.target.value })} className="h-[50px] w-full rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input)] px-4 text-sm text-[var(--auth-text)] outline-none transition placeholder:text-[var(--auth-muted)]/70 focus:border-[var(--auth-accent)] focus:ring-4 focus:ring-[var(--auth-accent)]/10" />
        </div>
        <button type="submit" className="h-[50px] w-full rounded-xl bg-[var(--auth-primary)] px-4 text-sm font-semibold text-[var(--auth-primary-text)] transition duration-150 hover:opacity-90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--auth-accent)]/25">Log in</button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--auth-muted)]">
        <span className="h-px flex-1 bg-[var(--auth-border)]" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-[var(--auth-border)]" />
      </div>
      <OAuthButtons />

      <p className="mt-7 text-center text-sm text-[var(--auth-muted)]">New to Aetherion? <Link to="/signup" className="font-semibold text-[var(--auth-accent)] underline-offset-4 transition hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
}

export default Login;
