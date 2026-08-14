import { Search, MessageCircle } from "lucide-react";

const EmptyChatState = ({ onFindSomeone }) => {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-5 py-8 sm:px-6 sm:py-10">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d8f45a]/[0.035] blur-3xl" />

      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#d8f45a]/20 bg-[#111711] shadow-[0_0_35px_rgba(216,244,90,0.06)] sm:h-20 sm:w-20 sm:rounded-[22px] sm:shadow-[0_0_45px_rgba(216,244,90,0.08)]">
          <MessageCircle
            className="h-7 w-7 text-[#d8f45a] sm:h-9 sm:w-9"
            strokeWidth={1.5}
          />

          {/* Small accent */}
          <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#d8f45a] shadow-[0_0_12px_rgba(216,244,90,0.6)]" />
        </div>

        {/* Heading */}
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-[#f1eee8] sm:mt-7 sm:text-3xl">
          Your Aetherion is empty
        </h2>

        {/* Description */}
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#858d84] sm:text-base">
          You haven't started a conversation yet.
          <br />
          Find someone and start talking.
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={onFindSomeone}
          className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#d8f45a] px-5 py-2.5 text-xs font-semibold text-[#10120d] shadow-[0_0_20px_rgba(216,244,90,0.06)] transition hover:bg-[#e4ff6f] hover:shadow-[0_0_28px_rgba(216,244,90,0.16)] active:scale-95 sm:mt-7 sm:gap-2.5 sm:px-6 sm:py-3 sm:text-sm sm:shadow-[0_0_25px_rgba(216,244,90,0.08)]"
        >
          <Search
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4"
            strokeWidth={2.2}
          />

          <span>Search for someone</span>
        </button>

        {/* Context hint */}
        <p className="mt-4 hidden text-xs text-[#60685f] sm:block">
          You can search for people using the search bar.
        </p>
      </div>
    </div>
  );
};

export default EmptyChatState;