const NewMessageDivider = ({ count, onClick }) => {
  if (!count) {
    return null;
  }

  return (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-[#d8d8d8]/10" />

      <button
        type="button"
        onClick={onClick}
        className="shrink-0 text-xs font-medium text-[#8a8a8a] transition hover:text-[#b0b0b0]"
      >
        {count} new {count === 1 ? "message" : "messages"}
      </button>

      <div className="h-px flex-1 bg-[#d8d8d8]/10" />
    </div>
  );
};

export default NewMessageDivider;