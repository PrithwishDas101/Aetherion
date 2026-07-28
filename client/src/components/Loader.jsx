function Loader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080d09]/85 backdrop-blur-sm">

            <div className="relative flex h-20 w-20 items-center justify-center">

                {/* Outer orbit */}
                <div className="absolute inset-0 animate-spin rounded-full border border-[#d8f45a]/20 border-t-[#d8f45a]/80" />

                {/* Inner orbit */}
                <div className="absolute h-12 w-12 animate-[spin_1.8s_linear_infinite_reverse] rounded-full border border-[#d8f45a]/15 border-b-[#d8f45a]/70" />

                {/* Aetherion core */}
                <div className="h-3 w-3 rounded-full bg-[#d8f45a] shadow-[0_0_16px_rgba(216,244,90,0.65)]" />

            </div>

        </div>
    );

}

export default Loader;
