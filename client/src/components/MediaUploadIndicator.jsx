import { FiUpload } from "react-icons/fi";

const MediaUploadIndicator = () => {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-black/35 backdrop-blur-[1.5px]"
      aria-label="Uploading media"
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/45 shadow-lg backdrop-blur-md">
        <div className="absolute inset-[3px] animate-spin rounded-full border-[2.5px] border-white/20 border-t-[#d8f45a]" />

        <FiUpload className="relative z-10 text-[15px] text-white/90" />
      </div>
    </div>
  );
};

export default MediaUploadIndicator;