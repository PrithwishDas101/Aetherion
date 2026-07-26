import React from "react";
import { Link } from "react-router-dom";

function Signup() {
    const [user, setUser] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    function onFormSubmit(event) {
        event.preventDefault();

        console.log(user);
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
                            <span className="mr-3 text-[#d8f45a]">
                                ✦
                            </span>

                            AETHERION

                            <span className="ml-3 text-[#d8f45a]">
                                ✦
                            </span>
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