import { useEffect, useState } from "react";
import { FiCopy, FiCornerUpLeft, FiEdit2, FiMoreHorizontal, FiTrash2, FiX } from "react-icons/fi";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

const MessageActions = ({ message, isMyMessage, canEdit, canReact, onReply, onEdit, onDelete, onReact, open, onOpenChange }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const copyMessage = async () => {
    if (message.text) {
      try { await navigator.clipboard.writeText(message.text); } catch { /* Clipboard may be unavailable. */ }
    }
    onOpenChange(false);
  };
  const choose = (callback) => {
    callback?.();
    setConfirmDelete(false);
    onOpenChange(false);
  };

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => {
          setConfirmDelete(false);
          onOpenChange(!open);
        }} aria-label="Message actions" aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c8cdc2] bg-white/95 text-[#555e54] shadow-sm transition hover:bg-[#eeefe8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9786] md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100">
        <FiMoreHorizontal className="text-lg" />
      </button>
      {open && <>
        <button type="button" aria-label="Close message actions" onClick={() => {
              setConfirmDelete(false);
              onOpenChange(false);
            }} className="fixed inset-0 z-40 cursor-default bg-black/20 md:bg-transparent" />
        <div role="dialog" aria-label={confirmDelete ? "Delete message" : "Message actions"}
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-[#c8cdc2] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(20,25,20,0.16)] md:absolute md:inset-auto md:right-0 md:top-9 md:w-64 md:rounded-xl md:p-2 md:shadow-xl">
          <div className="mb-3 flex items-center justify-between md:hidden">
            <span className="text-sm font-semibold text-[#1d211c]">{confirmDelete ? "Delete message" : "Message actions"}</span>
            <button type="button" onClick={() => {
                setConfirmDelete(false);
                onOpenChange(false);
              }} className="flex h-9 w-9 items-center justify-center rounded-full text-[#555e54]" aria-label="Close"><FiX /></button>
          </div>
          {confirmDelete ? (
            <div className="space-y-1">
              <p className="px-3 pb-2 text-sm text-[#555e54]">Choose where to delete this message.</p>
              <button type="button" onClick={() => choose(() => onDelete("me"))} className="w-full rounded-lg px-3 py-3 text-left text-sm text-[#1d211c] transition hover:bg-[#eeefe8]">Delete for me</button>
              {isMyMessage && <button type="button" onClick={() => choose(() => onDelete("everyone"))} className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-red-700 transition hover:bg-red-50">Delete for everyone</button>}
              <button type="button" onClick={() => setConfirmDelete(false)} className="w-full rounded-lg px-3 py-3 text-left text-sm text-[#555e54] transition hover:bg-[#eeefe8]">Cancel</button>
            </div>
          ) : (
            <div className="space-y-1">
              {canReact && (
                <div className="flex items-center gap-1 px-1 pb-2">
                  {REACTIONS.map((emoji) => <button key={emoji} type="button" onClick={() => choose(() => onReact(emoji))} aria-label={`React with ${emoji}`} className="flex h-10 min-w-9 flex-1 items-center justify-center rounded-lg text-xl transition hover:bg-[#eeefe8] active:scale-95">{emoji}</button>)}
                </div>
              )}
              <button type="button" onClick={() => choose(onReply)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-[#1d211c] transition hover:bg-[#eeefe8]"><FiCornerUpLeft /> Reply</button>
              <button type="button" onClick={copyMessage} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-[#1d211c] transition hover:bg-[#eeefe8]"><FiCopy /> Copy text</button>
              {canEdit && <button type="button" onClick={() => choose(onEdit)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-[#1d211c] transition hover:bg-[#eeefe8]"><FiEdit2 /> Edit message</button>}
              <button type="button" onClick={() => setConfirmDelete(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-red-700 transition hover:bg-red-50"><FiTrash2 /> Delete message</button>
            </div>
          )}
        </div>
      </>}
    </div>
  );
};

export default MessageActions;
