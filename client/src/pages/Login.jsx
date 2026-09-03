import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { loginUser } from "../apiCalls/authApi.js";
import { hideLoader, showLoader } from "../redux/sliceLoader.js";

function Login() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });

  async function onFormSubmit(event) {
    event.preventDefault();

    dispatch(showLoader());

    try {
      const response = await loginUser(user);

      if (response.success) {
        localStorage.setItem("token", response.token);

        toast("Welcome to Aetherion", {
          icon: null,
        });

        navigate("/");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      dispatch(hideLoader());
    }
  }

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
        <div className="h-[540px] w-full max-w-[450px] rounded-[28px] border border-[#d8f45a]/25 bg-[#111612]/90 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {/* Card content */}
          <div className="px-5 pb-6 pt-6 sm:px-10">
            {/* Logo */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d8f45a]/50 bg-[#080d09] shadow-[0_0_30px_rgba(216,244,90,0.12)]">
              <img
                src="/images/logo.png"
                alt="Aetherion logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Aetherion */}
            <div className="mt-3 text-center text-lg tracking-[0.65em] text-[#f1eee8]">
              <span className="mr-3 text-[#d8f45a]">✦</span>
              AETHERION
              <span className="ml-3 text-[#d8f45a]">✦</span>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <h1 className="text-3xl font-semibold text-[#f1eee8] sm:text-3xl tracking-[0.25rem]">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-[#9ca39a] sm:text-base">
                Log in to continue.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={onFormSubmit}
              className="mx-auto mt-7 max-w-[560px]"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-3 block text-sm text-[#d0d4cc]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={user.email}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      email: e.target.value,
                    })
                  }
                  className="h-10 w-full py-2 rounded-xl border border-[#d8f45a]/20 bg-[#0b100c]/80 px-4 text-[#f1eee8] outline-none placeholder:text-[#70786f] focus:border-[#d8f45a]/60"
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
                  type="password"
                  placeholder="Enter your password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      password: e.target.value,
                    })
                  }
                  className="h-10 w-full py-2 rounded-xl border border-[#d8f45a]/20 bg-[#0b100c]/80 px-4 text-[#f1eee8] outline-none placeholder:text-[#70786f] focus:border-[#d8f45a]/60"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="mt-6 h-10 w-full rounded-full border border-[#d8f45a]/70 bg-[#d8f45a] text-base font-semibold text-[#10120d] shadow-[0_0_0_1px_rgba(216,244,90,0.15),0_0_18px_rgba(216,244,90,0.08)] transition-all hover:border-[#f0ff9a] hover:bg-[#e4ff6c] hover:shadow-[0_0_0_2px_rgba(216,244,90,0.12),0_0_30px_rgba(216,244,90,0.25)]"
              >
                Log In
              </button>
            </form>

            {/* Signup */}
            <div className="mt-5 text-center text-sm text-[#858d84]">
              Don't have an account yet?
              <Link
                to="/signup"
                className="ml-1 text-[#d8f45a] hover:text-[#efff9a]"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
