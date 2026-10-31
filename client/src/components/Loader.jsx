function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer orbit */}
        <div className="absolute inset-0 animate-spin rounded-full border border-[#E5E5E5] border-t-[#171717]/80" />

        {/* Inner orbit */}
        <div className="absolute h-12 w-12 animate-[spin_1.8s_linear_infinite_reverse] rounded-full border border-[#E5E5E5] border-b-[#171717]/70" />

        {/* Aetherion core */}
        <div className="h-3 w-3 rounded-full bg-[#171717] shadow-[0_0_16px_rgba(0,0,0,0.65)]" />
      </div>
    </div>
  );
}

export default Loader;
