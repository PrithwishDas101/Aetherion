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
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Background image */}
      <div
        className="fixed inset-0 -z-20 bg-[#0A0D1A]"
        style={{
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(191,181,255,0.13), transparent 48%), radial-gradient(ellipse at 100% 100%, rgba(85,103,175,0.12), transparent 42%)",
        }}
      />

      {/* Page layout */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-4">
        {/* Card */}
        <div className="w-full max-w-[520px] rounded-[28px] border border-[#BFB5FF]/20 bg-[#141930]/95 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {/* Card content */}
          <div className="px-5 pb-5 pt-5 sm:px-10">
            {/* Logo */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#BFB5FF]/35 bg-[#1E2545] text-2xl text-[#BFB5FF] shadow-[0_0_30px_rgba(216,244,90,0.12)]">
              <img
                src="/images/logo.png"
                alt="Aetherion logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Aetherion */}
            <div className="mt-3 text-center text-base tracking-[0.45em] text-[#F7F7FC]">
              <span className="mr-3 text-[#BFB5FF]">✦</span>
              AETHERION
              <span className="ml-3 text-[#BFB5FF]">✦</span>
            </div>

            {/* Heading */}
            <div className="mt-2 text-center">
              <h1 className="text-2xl font-semibold text-[#F7F7FC] sm:text-3xl tracking-[0.25rem]">
                Create Your Account
              </h1>

              <p className="mt-1 text-xs text-[#A0A7C2] xs:text-base">
                Create your account and start connecting with people.
              </p>
            </div>

            <OAuthButtons />
            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#858DAA]"><span className="h-px flex-1 bg-[#BFB5FF]/15" /><span>or</span><span className="h-px flex-1 bg-[#BFB5FF]/15" /></div>




            {/* Form */}
            <form onSubmit={onFormSubmit} className="mx-auto max-w-[560px]">
              {/* First + Last Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm text-[#D8D9E8]"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={user.firstName}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        firstName: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#1E2545] px-4 text-[#F7F7FC] outline-none placeholder:text-[#858DAA] focus:border-[#BFB5FF]/80 focus:ring-2 focus:ring-[#BFB5FF]/15"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm text-[#D8D9E8]"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={user.lastName}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        lastName: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#1E2545] px-4 text-[#F7F7FC] outline-none placeholder:text-[#858DAA] focus:border-[#BFB5FF]/80 focus:ring-2 focus:ring-[#BFB5FF]/15"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mt-3">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm text-[#D8D9E8]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={user.email}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      email: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#1E2545] px-4 text-[#F7F7FC] outline-none placeholder:text-[#858DAA] focus:border-[#BFB5FF]/80 focus:ring-2 focus:ring-[#BFB5FF]/15"
                />
              </div>

              {/* Password */}
              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm text-[#D8D9E8]"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      password: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#1E2545] px-4 text-[#F7F7FC] outline-none placeholder:text-[#858DAA] focus:border-[#BFB5FF]/80 focus:ring-2 focus:ring-[#BFB5FF]/15"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="mt-6 h-10 w-full rounded-full border border-white bg-white text-base font-semibold text-[#0A0D1A] shadow-[0_0_12px_rgba(216,244,90,0.12)] transition-all hover:bg-[#D8D2FF] hover:border-[#E7E2FF] hover:shadow-[0_0_30px_rgba(216,244,90,0.28)]"
              >
                Create Account
              </button>
            </form>


            {/* Login */}
            <div className="mt-3 text-center text-sm text-[#A0A7C2]">
              Already have an account?
              <Link
                to="/login"
                className="ml-1 text-[#BFB5FF] hover:text-[#D8D2FF]"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
