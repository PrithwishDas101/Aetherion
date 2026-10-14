import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { signupUser } from "../apiCalls/authApi.js";
import { hideLoader, showLoader } from "../redux/sliceLoader.js";
import compressImage from "../utils/compressImage.js";
import { logSafeClientError } from "../utils/safeLogging.js";
import AuthLayout from "../components/AuthLayout.jsx";
import OAuthButtons from "../components/OAuthButtons.jsx";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const fileInputRef = useRef(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [profileUploadError, setProfileUploadError] = useState("");

  async function onFormSubmit(event) {
    event.preventDefault();
    try {
      dispatch(showLoader());
      const formData = new FormData();
      formData.append("firstName", user.firstName);
      formData.append("lastName", user.lastName);
      formData.append("email", user.email);
      formData.append("password", user.password);
      if (profileFile) formData.append("profilePic", profileFile);

      const response = await signupUser(formData);
      if (response.success && response.token && response.user) {
        localStorage.setItem("token", response.token);
        toast.success("Account created.");
        navigate("/", { replace: true });
      } else if (response.success) {
        toast("Sign in to continue.", { icon: null });
        navigate("/login", {
          replace: true,
          state: { email: user.email.trim().toLowerCase() },
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      dispatch(hideLoader());
    }
  }

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileUploadError("");
    try {
      const compressedFile = await compressImage(file);
      console.log("Signup profile image compressed");
      setProfileFile(compressedFile);
      const previewUrl = URL.createObjectURL(compressedFile);
      setProfilePreview(previewUrl);
    } catch (error) {
      logSafeClientError("Signup profile image compression", error);
      setProfileUploadError("Couldn't process that image. Please try another one.");
    }
  };

  return (
    <AuthLayout page="signup">
      <div>
        <p className="text-sm font-medium text-[var(--auth-accent)]">A good place to begin</p>
        <h1 className="mt-3 text-[34px] font-semibold leading-[1.08] tracking-[-0.055em] text-[var(--auth-text)] sm:text-[38px]">Create your account.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--auth-muted)]">Start building your Aetherion space.</p>
      </div>

      <form onSubmit={onFormSubmit} className="mt-7 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-2 block text-[13px] font-medium text-[var(--auth-text)]">First name</label>
            <input id="firstName" name="firstName" type="text" autoComplete="given-name" required placeholder="John" value={user.firstName} onChange={(event) => setUser({ ...user, firstName: event.target.value })} className="h-[50px] w-full rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input)] px-4 text-sm text-[var(--auth-text)] outline-none transition placeholder:text-[var(--auth-muted)]/70 focus:border-[var(--auth-accent)] focus:ring-4 focus:ring-[var(--auth-accent)]/10" />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-2 block text-[13px] font-medium text-[var(--auth-text)]">Last name</label>
            <input id="lastName" name="lastName" type="text" autoComplete="family-name" required placeholder="Doe" value={user.lastName} onChange={(event) => setUser({ ...user, lastName: event.target.value })} className="h-[50px] w-full rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input)] px-4 text-sm text-[var(--auth-text)] outline-none transition placeholder:text-[var(--auth-muted)]/70 focus:border-[var(--auth-accent)] focus:ring-4 focus:ring-[var(--auth-accent)]/10" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-[var(--auth-text)]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={user.email} onChange={(event) => setUser({ ...user, email: event.target.value })} className="h-[50px] w-full rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input)] px-4 text-sm text-[var(--auth-text)] outline-none transition placeholder:text-[var(--auth-muted)]/70 focus:border-[var(--auth-accent)] focus:ring-4 focus:ring-[var(--auth-accent)]/10" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-[var(--auth-text)]">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Create a password" value={user.password} onChange={(event) => setUser({ ...user, password: event.target.value })} className="h-[50px] w-full rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input)] px-4 text-sm text-[var(--auth-text)] outline-none transition placeholder:text-[var(--auth-muted)]/70 focus:border-[var(--auth-accent)] focus:ring-4 focus:ring-[var(--auth-accent)]/10" />
        </div>
        <button type="submit" className="h-[50px] w-full rounded-xl bg-[var(--auth-primary)] px-4 text-sm font-semibold text-[var(--auth-primary-text)] transition duration-150 hover:opacity-90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--auth-accent)]/25">Create account</button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--auth-muted)]">
        <span className="h-px flex-1 bg-[var(--auth-border)]" />
        <span>or sign up with</span>
        <span className="h-px flex-1 bg-[var(--auth-border)]" />
      </div>
      <OAuthButtons />

      <p className="mt-7 text-center text-sm text-[var(--auth-muted)]">Already have an account? <Link to="/login" className="font-semibold text-[var(--auth-accent)] underline-offset-4 transition hover:underline">Log in</Link></p>
    </AuthLayout>
  );
}

export default Signup;
