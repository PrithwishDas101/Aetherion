import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCopy,
  FiCornerUpLeft,
  FiEdit2,
  FiMoreVertical,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

const MessageActions = ({
  message,
  isMyMessage,
  canEdit,
  canReact,
  onReply,
  onEdit,
  onDelete,
  onReact,
  open,
  onOpenChange,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setConfirmDelete(false);
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const close = () => {
    setConfirmDelete(false);
    onOpenChange(false);
  };

  const choose = (callback) => {
    callback?.();
    close();
  };

  const copyMessage = async () => {
    if (message.text && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message.text);
      } catch {
        // Clipboard access can be unavailable outside a secure context.
      }
    }
    close();
  };

  const menuItemClass =
    "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-[var(--home-text)] transition duration-150 hover:bg-[var(--home-hover)] active:scale-[0.99]";
  const iconClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--home-raised)] text-[var(--home-muted)] transition-colors group-hover:text-[var(--home-text)]";

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          if (open) close();
          else {
            setConfirmDelete(false);
            onOpenChange(true);
          }
        }}
        aria-label="Message actions"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex h-7 w-7 items-center justify-center rounded-full transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#879b82] ${isMyMessage ? "bg-white/10 text-white/75 hover:bg-white/20 hover:text-white" : "bg-black/[0.045] text-black/55 hover:bg-black/10 hover:text-black/80"} md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100`}
      >
        <FiMoreVertical className="text-base" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close message actions"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default bg-black/25 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={confirmDelete ? "Delete message" : "Message actions"}
            className="scrollbar-aetherion-light fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-[26px] border border-[var(--home-border)] bg-[var(--home-surface)] px-4 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_50px_rgba(20,25,20,0.2)] md:absolute md:inset-auto md:right-0 md:top-9 md:w-72 md:rounded-2xl md:px-2.5 md:pb-2.5 md:pt-2.5 md:shadow-[0_16px_44px_rgba(20,25,20,0.16)]"
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[var(--home-border)] md:hidden" />

            <div className="mb-3 flex items-center justify-between px-1 md:hidden">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--home-muted)]">
                  Message
                </p>
                <p className="mt-0.5 text-sm font-semibold tracking-tight text-[var(--home-text)]">
                  {confirmDelete ? "Delete message" : "Actions"}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--home-muted)] transition hover:bg-[var(--home-hover)] hover:text-[var(--home-text)]"
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            {confirmDelete ? (
              <div className="space-y-2 px-0.5">
                <div className="mb-3 flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.055] p-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                    <FiAlertTriangle />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--home-text)]">
                      Choose where to delete
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--home-muted)]">
                      This action can’t be undone.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => choose(() => onDelete("me"))}
                  className="flex w-full items-center gap-3 rounded-xl border border-[var(--home-border)] px-3 py-3 text-left transition hover:bg-[var(--home-hover)] active:scale-[0.99]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--home-raised)] text-[var(--home-muted)]">
                    <FiTrash2 />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--home-text)]">
                      Delete for me
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--home-muted)]">
                      Remove it from your chat only
                    </span>
                  </span>
                </button>

                {isMyMessage && (
                  <button
                    type="button"
                    onClick={() => choose(() => onDelete("everyone"))}
                    className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 px-3 py-3 text-left transition hover:bg-red-500/[0.07] active:scale-[0.99]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                      <FiTrash2 />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-red-600">
                        Delete for everyone
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--home-muted)]">
                        Remove it from the conversation
                      </span>
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--home-muted)] transition hover:bg-[var(--home-hover)] hover:text-[var(--home-text)]"
                >
                  Go back
                </button>
              </div>
            ) : (
              <div>
                {canReact && (
                  <div className="mb-2 border-b border-[var(--home-divider)] pb-3">
                    <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--home-muted)]">
                      Quick reaction
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => choose(() => onReact(emoji))}
                          aria-label={`React with ${emoji}`}
                          className="flex h-10 min-w-0 items-center justify-center rounded-xl bg-[var(--home-raised)] text-lg transition duration-150 hover:-translate-y-0.5 hover:bg-[var(--home-hover)] hover:shadow-sm active:scale-90"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-0.5">
                  <button type="button" onClick={() => choose(onReply)} className={menuItemClass}>
                    <span className={iconClass}><FiCornerUpLeft /></span>
                    <span>Reply</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyMessage}
                    disabled={!message.text}
                    className={`${menuItemClass} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <span className={iconClass}><FiCopy /></span>
                    <span>Copy text</span>
                  </button>

                  {canEdit && (
                    <button type="button" onClick={() => choose(onEdit)} className={menuItemClass}>
                      <span className={iconClass}><FiEdit2 /></span>
                      <span>Edit message</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-red-600 transition duration-150 hover:bg-red-500/[0.07] active:scale-[0.99]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                      <FiTrash2 />
                    </span>
                    <span>Delete message</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessageActions;
