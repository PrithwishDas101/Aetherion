import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { signupUser } from "../apiCalls/authApi.js";
import { hideLoader, showLoader } from "../redux/sliceLoader.js";
import compressImage from "../utils/compressImage.js";

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

      if (response.success) {
        toast.success(response.message);

        navigate("/login", { replace: true });
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

      console.log(
        "Signup original image:",
        `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      );

      console.log(
        "Signup compressed image:",
        `${(compressedFile.size / 1024).toFixed(2)} KB`,
      );

      setProfileFile(compressedFile);

      const previewUrl = URL.createObjectURL(compressedFile);

      setProfilePreview(previewUrl);
    } catch (error) {
      console.error("Signup profile image compression error:", error);

      setProfileUploadError(
        "Couldn't process that image. Please try another one.",
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/background-aetherion.png')",
        }}
      />

      {/* Page layout */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-4">
        {/* Card */}
        <div className="w-full max-w-[520px] rounded-[28px] border border-[#d8f45a]/25 bg-[#111612]/90 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {/* Card content */}
          <div className="px-5 pb-5 pt-5 sm:px-10">
            {/* Logo */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d8f45a]/50 bg-[#080d09] text-4xl text-[#d8f45a] shadow-[0_0_30px_rgba(216,244,90,0.12)]">
              <img
                src="/images/logo.png"
                alt="Aetherion logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Aetherion */}
            <div className="mt-3 text-center text-lg tracking-[0.35em] text-[#f1eee8]">
              <span className="mr-3 text-[#d8f45a]">✦</span>
              AETHERION
              <span className="ml-3 text-[#d8f45a]">✦</span>
            </div>

            {/* Heading */}
            <div className="mt-2 text-center">
              <h1 className="text-3xl font-semibold text-[#f1eee8] sm:text-4xl">
                Create Your Account
              </h1>

              <p className="mt-1 text-sm text-[#9ca39a] sm:text-base">
                Create your account and start connecting with people.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#171d17] text-2xl font-bold text-[#d8f45a] ring-2 ring-[#d8f45a]/20 sm:h-24 sm:w-24">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[#858d84]">+</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#080d09] bg-[#d8f45a] text-xs font-bold text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-95 sm:h-7 sm:w-7 sm:text-sm"
                  aria-label="Add profile picture"
                >
                  +
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProfilePictureChange}
                className="hidden"
              />

              <p className="mt-2 text-xs text-[#858d84]">
                Profile picture{" "}
                <span className="text-[#60685f]">(optional)</span>
              </p>

              {profileUploadError && (
                <p
                  role="alert"
                  className="mt-2 max-w-xs text-center text-xs text-red-400"
                >
                  {profileUploadError}
                </p>
              )}
            </div>

            {/* Form */}
            <form
              onSubmit={onFormSubmit}
              className="mx-auto mt-6 max-w-[560px]"
            >
              {/* First + Last Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm text-[#d0d4cc]"
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
                    className="h-12 w-full rounded-xl border border-[#d8f45a]/20 bg-[#0b100c]/80 px-4 text-[#f1eee8] outline-none placeholder:text-[#70786f] focus:border-[#d8f45a]/60"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm text-[#d0d4cc]"
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
                    className="h-12 w-full rounded-xl border border-[#d8f45a]/20 bg-[#0b100c]/80 px-4 text-[#f1eee8] outline-none placeholder:text-[#70786f] focus:border-[#d8f45a]/60"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mt-4">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm text-[#d0d4cc]"
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
                  className="h-12 w-full rounded-xl border border-[#d8f45a]/20 bg-[#0b100c]/80 px-4 text-[#f1eee8] outline-none placeholder:text-[#70786f] focus:border-[#d8f45a]/60"
                />
              </div>

              {/* Password */}
              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm text-[#d0d4cc]"
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
                  className="h-12 w-full rounded-xl border border-[#d8f45a]/20 bg-[#0b100c]/80 px-4 text-[#f1eee8] outline-none placeholder:text-[#70786f] focus:border-[#d8f45a]/60"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="mt-5 h-12 w-full rounded-full bg-[#d8f45a] text-base font-semibold text-[#10120d] transition hover:bg-[#e4ff6c] hover:shadow-[0_0_30px_rgba(216,244,90,0.25)]"
              >
                Create Account
              </button>
            </form>

            {/* Login */}
            <div className="mt-4 text-center text-sm text-[#858d84]">
              Already have an account?
              <Link
                to="/login"
                className="ml-1 text-[#d8f45a] hover:text-[#efff9a]"
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
