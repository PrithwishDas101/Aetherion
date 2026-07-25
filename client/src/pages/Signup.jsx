import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const onFormSubmit = (event) => {
        event.preventDefault();
        console.log(user);
    };

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-y-auto bg-[#050606] px-8 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">

            {/* Background */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage:
                        "url('/images/background-aetherion.png')",
                }}
            />

            {/* Overlay */}
            <div className="fixed inset-0 z-[1] bg-[linear-gradient(90deg,rgba(5,6,6,0.18),rgba(5,6,6,0.38),rgba(5,6,6,0.18))]" />

            {/* Signup Card */}
            <div className="relative z-[2] flex w-full max-w-[560px] flex-col rounded-[28px] border border-[#d8f45a]/[0.14] bg-[linear-gradient(145deg,rgba(32,36,29,0.86),rgba(13,15,14,0.94))] p-12 shadow-[0_30px_80px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[20px] sm:p-16">

                {/* Brand */}
                <div className="mx-auto mb-7 flex h-[72px] w-[72px] items-center justify-center self-center rounded-full border border-[#d8f45a]/[0.24] bg-[radial-gradient(circle_at_35%_30%,#30382e,#101411_65%,#070908)] text-center text-[38px] font-semibold leading-[72px] text-[#f1eee8] shadow-[0_0_0_8px_rgba(216,244,90,0.025),0_0_35px_rgba(216,244,90,0.08)]">
                    A
                </div>

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-[32px] font-medium tracking-[-0.5px] text-[#f1eee8]">
                        Create Your Account
                    </h1>

                    <p className="mt-3 text-[14px] leading-[1.6] text-[#969d94]">
                        Create your account and start connecting with people.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={onFormSubmit}
                    className="flex flex-col gap-8"
                >
                    {/* Names */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                        <div className="flex flex-col gap-3">
                            <label
                                htmlFor="firstName"
                                className="text-[14px] font-medium text-[#c7ccc3]"
                            >
                                First Name
                            </label>

                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="John"
                                required
                                className="h-[48px] w-full rounded-[14px] border border-[#d8f45a]/10 bg-[linear-gradient(145deg,rgba(31,36,30,0.78),rgba(17,20,18,0.86))] px-4 text-[14px] text-[#f1eee8] outline-none placeholder:text-[#6f776f] focus:border-[#d8f45a]/[0.55] focus:shadow-[0_0_0_3px_rgba(216,244,90,0.06),0_0_25px_rgba(216,244,90,0.05)]"
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <label
                                htmlFor="lastName"
                                className="text-[14px] font-medium text-[#c7ccc3]"
                            >
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Doe"
                                required
                                className="h-[48px] w-full rounded-[14px] border border-[#d8f45a]/10 bg-[linear-gradient(145deg,rgba(31,36,30,0.78),rgba(17,20,18,0.86))] px-4 text-[14px] text-[#f1eee8] outline-none placeholder:text-[#6f776f] focus:border-[#d8f45a]/[0.55] focus:shadow-[0_0_0_3px_rgba(216,244,90,0.06),0_0_25px_rgba(216,244,90,0.05)]"
                            />
                        </div>

                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="email"
                            className="text-[14px] font-medium text-[#c7ccc3]"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="h-[48px] w-full rounded-[14px] border border-[#d8f45a]/10 bg-[linear-gradient(145deg,rgba(31,36,30,0.78),rgba(17,20,18,0.86))] px-4 text-[14px] text-[#f1eee8] outline-none placeholder:text-[#6f776f] focus:border-[#d8f45a]/[0.55] focus:shadow-[0_0_0_3px_rgba(216,244,90,0.06),0_0_25px_rgba(216,244,90,0.05)]"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="password"
                            className="text-[14px] font-medium text-[#c7ccc3]"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            required
                            className="h-[48px] w-full rounded-[14px] border border-[#d8f45a]/10 bg-[linear-gradient(145deg,rgba(31,36,30,0.78),rgba(17,20,18,0.86))] px-4 text-[14px] text-[#f1eee8] outline-none placeholder:text-[#6f776f] focus:border-[#d8f45a]/[0.55] focus:shadow-[0_0_0_3px_rgba(216,244,90,0.06),0_0_25px_rgba(216,244,90,0.05)]"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="mt-6 h-[50px] w-full rounded-full bg-[#d8f45a] text-[14px] font-bold text-[#10120d] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e2ff69] hover:shadow-[0_10px_30px_rgba(216,244,90,0.22)] active:translate-y-0 active:scale-[0.98]"
                    >
                        Create Account
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-[13px] text-[#737a75]">
                    <span>Already have an account?</span>

                    <Link
                        to="/login"
                        className="ml-[5px] text-[#d8f45a] hover:text-[#efff9a]"
                    >
                        Log in
                    </Link>
                </div>

            </div>
        </main>
    );
};

export default Signup;