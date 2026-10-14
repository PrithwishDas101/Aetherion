import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { signupUser } from "../apiCalls/authApi.js";
import { hideLoader, showLoader } from "../redux/sliceLoader.js";
import compressImage from "../utils/compressImage.js";
import { logSafeClientError } from "../utils/safeLogging.js";
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

      if (profileFile) {
        formData.append("profilePic", profileFile);
      }

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
      toast.error(
        error.response?.data?.message ||
        "Something went wrong. Please try again.",
      );
    } finally {
      dispatch(hideLoader());
    }
  }

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileUploadError("");

    try {
      const compressedFile = await compressImage(file);

      console.log("Signup profile image compressed");

      setProfileFile(compressedFile);

      const previewUrl = URL.createObjectURL(compressedFile);

      setProfilePreview(previewUrl);
    } catch (error) {
      logSafeClientError("Signup profile image compression", error);

      setProfileUploadError(
        "Couldn't process that image. Please try another one.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-4 py-8 font-sans text-[#171923]">
      <section className="w-full max-w-[480px] rounded-[24px] border border-black/[0.05] bg-white px-6 py-7 shadow-[0_16px_48px_rgba(22,24,40,0.08)] sm:px-9 sm:py-8">
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#F0EDFF]">
            <img src="/images/logo.png" alt="Aetherion logo" className="h-full w-full object-contain" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#7162C9]">Aetherion</p>
          <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[#171923] sm:text-[30px]">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-[#737583]">A few details and you’re ready to get started.</p>
        </header>
        <div className="mt-6"><OAuthButtons /></div>
        <div className="my-5 flex items-center gap-3 text-xs text-[#9294A0]">
          <span className="h-px flex-1 bg-[#E8E8EE]" /><span>or sign up with email</span><span className="h-px flex-1 bg-[#E8E8EE]" />
        </div>
        <form onSubmit={onFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-[13px] font-medium text-[#383A46]">First name</label>
              <input id="firstName" name="firstName" type="text" autoComplete="given-name" placeholder="John" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} className="h-12 w-full rounded-xl border border-[#E4E5EC] bg-[#F7F7FA] px-4 text-sm text-[#171923] outline-none transition placeholder:text-[#A1A2AD] focus:border-[#8B7CF6] focus:bg-white focus:ring-4 focus:ring-[#8B7CF6]/10" />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-[13px] font-medium text-[#383A46]">Last name</label>
              <input id="lastName" name="lastName" type="text" autoComplete="family-name" placeholder="Doe" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} className="h-12 w-full rounded-xl border border-[#E4E5EC] bg-[#F7F7FA] px-4 text-sm text-[#171923] outline-none transition placeholder:text-[#A1A2AD] focus:border-[#8B7CF6] focus:bg-white focus:ring-4 focus:ring-[#8B7CF6]/10" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-[#383A46]">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} className="h-12 w-full rounded-xl border border-[#E4E5EC] bg-[#F7F7FA] px-4 text-sm text-[#171923] outline-none transition placeholder:text-[#A1A2AD] focus:border-[#8B7CF6] focus:bg-white focus:ring-4 focus:ring-[#8B7CF6]/10" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-[#383A46]">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} className="h-12 w-full rounded-xl border border-[#E4E5EC] bg-[#F7F7FA] px-4 text-sm text-[#171923] outline-none transition placeholder:text-[#A1A2AD] focus:border-[#8B7CF6] focus:bg-white focus:ring-4 focus:ring-[#8B7CF6]/10" />
          </div>
          <button type="submit" className="h-12 w-full rounded-xl bg-[#171923] text-sm font-semibold text-white transition duration-150 hover:bg-[#2C2E3B] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8B7CF6]/25">Create account</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#737583]">Already have an account? <Link to="/login" className="font-semibold text-[#7162C9] transition hover:text-[#5545B5]">Log in</Link></p>
      </section>
    </main>
  );
}

export default Signup;
