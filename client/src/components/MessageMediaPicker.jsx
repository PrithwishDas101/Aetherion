import { useMemo, useState, useEffect } from "react";
import { FiSearch, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

import { searchEmojis } from "../utils/emojiSearch.js";
import { searchGifs, getTrendingGifs } from "../apiCalls/giphyApi.js";

const MessageMediaPicker = ({ isOpen, onClose, onEmojiClick, onGifClick }) => {
  const [activeTab, setActiveTab] = useState("emoji");
  const [search, setSearch] = useState("");
  const [gifResults, setGifResults] = useState([]);
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [gifError, setGifError] = useState("");
  const [gifSource, setGifSource] = useState("trending");

  const emojiSearchResults = useMemo(() => {
    if (activeTab !== "emoji" || !search.trim()) {
      return [];
    }

    return searchEmojis(search);
  }, [search, activeTab]);

  const normalizedSearch = search.trim().toLowerCase();

  const handleEmojiClick = (emojiData) => {
    if (onEmojiClick) {
      onEmojiClick(emojiData);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const searchPlaceholder =
    activeTab === "emoji"
      ? "Search emoji"
      : activeTab === "gif"
        ? "Search GIFs"
        : "Search stickers";

  const RECENT_GIFS_KEY = "aetherion_recent_gifs";
  const MAX_RECENT_GIFS = 20;

  const getRecentGifs = () => {
    try {
      const stored = localStorage.getItem(RECENT_GIFS_KEY);

      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Get recent GIFs error:", error);
      return [];
    }
  };

  const saveRecentGif = (gif) => {
    if (!gif?.id) {
      return;
    }

    const existing = getRecentGifs();

    const updated = [
      gif,
      ...existing.filter((item) => String(item.id) !== String(gif.id)),
    ].slice(0, MAX_RECENT_GIFS);

    localStorage.setItem(RECENT_GIFS_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    if (activeTab !== "gif") {
      return;
    }

    let cancelled = false;

    const loadGifs = async () => {
      try {
        setIsGifLoading(true);
        setGifError("");

        const query = search.trim();

        if (query) {
          setGifSource("search");

          const results = await searchGifs(query);

          if (!cancelled) {
            setGifResults(results);
          }

          return;
        }

        const recentGifs = getRecentGifs();

        if (recentGifs.length > 0) {
          setGifSource("recent");

          if (!cancelled) {
            setGifResults(recentGifs);
          }

          return;
        }

        setGifSource("trending");

        const results = await getTrendingGifs();

        if (!cancelled) {
          setGifResults(results);
        }
      } catch (error) {
        console.error("GIF loading error:", error);

        if (!cancelled) {
          setGifResults([]);

          setGifError("Unable to load GIFs.");
        }
      } finally {
        if (!cancelled) {
          setIsGifLoading(false);
        }
      }
    };

    loadGifs();

    return () => {
      cancelled = true;
    };
  }, [activeTab, search]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className=" z-50 w-full overflow-hidden border border-[#d8f45a]/15 bg-[#101610] shadow-2xl md:absolute md:bottom-16 md:left-0 md:w-[min(360px,calc(100vw-32px))] md:rounded-2xl">
      {/* SEARCH */}

      <div className="border-b border-[#d8f45a]/10 p-2 sm:p-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#d8f45a]/10 bg-[#080d09] px-3 py-2 transition focus-within:border-[#d8f45a]/25">
          <FiSearch className="shrink-0 text-[#8f9b86]" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#c6d5f3] outline-none placeholder:text-[#70786f]"
          />
        </div>
      </div>

      {/* TABS */}

      <div className="flex border-b border-[#d8f45a]/10">
        <button
          type="button"
          onClick={() => handleTabChange("emoji")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeTab === "emoji" ? "border-b-2 border-[#d8f45a] text-[#d8f45a]" : "text-[#858d84] hover:text-[#f1eee8]"}`}
        >
          <FiSmile />
          <span>Emoji</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("gif")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeTab === "gif" ? "border-b-2 border-[#a78bfa] text-[#a78bfa]" : "text-[#858d84] hover:text-[#f1eee8]"}`}
        >
          GIF
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("stickers")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeTab === "stickers" ? "border-b-2 border-[#f5c96a] text-[#f5c96a]" : "text-[#858d84] hover:text-[#f1eee8]"}`}
        >
          Stickers
        </button>
      </div>

      {/* CONTENT */}

      <div className="scrollbar-media-picker h-[280px] overflow-y-auto p-2 sm:h-64 sm:p-3">
        {/* EMOJI */}

        {activeTab === "emoji" && (
          <div className="h-full w-full">
            {search.trim() ? (
              emojiSearchResults.length > 0 ? (
                <div className="grid grid-cols-8 gap-1">
                  {emojiSearchResults.map((emoji) => (
                    <button
                      key={emoji.unified}
                      type="button"
                      onClick={() =>
                        onEmojiClick?.({
                          emoji: emoji.emoji,
                          unified: emoji.unified,
                          names: emoji.names,
                          isCustom: false,
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl transition hover:bg-[#d8f45a]/10"
                      title={emoji.names?.[0]}
                    >
                      {emoji.emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#70786f]">
                  No emojis found.
                </div>
              )
            ) : (
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                searchDisabled={true}
                width="100%"
                height="100%"
                previewConfig={{ showPreview: false }}
                skinTonesDisabled={false}
                lazyLoadEmojis={true}
                theme="dark"
                style={{
                  background: "#101610",
                  border: "none",
                  borderRadius: 0,
                }}
              />
            )}
          </div>
        )}

        {/* GIF */}

        {activeTab === "gif" && (
          <div className="h-full w-full">
            {isGifLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-[#70786f]">
                Loading GIFs...
              </div>
            ) : gifError ? (
              <div className="flex h-full items-center justify-center text-sm text-[#70786f]">
                {gifError}
              </div>
            ) : gifResults.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[#70786f]">
                No GIFs found.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-2 sm:gap-2">
                {gifResults.map((gif) => {
                  const image = gif.images?.fixed_width_small;

                  if (!image?.url) {
                    return null;
                  }

                  return (
                    <button
                      key={gif.id}
                      type="button"
                      onClick={() => {
                        saveRecentGif(gif);
                        onGifClick?.(gif);
                      }}
                      className="overflow-hidden rounded-xl transition hover:opacity-80 active:scale-[0.98]"
                    >
                      <img
                        src={image.url}
                        alt={gif.title || "GIF"}
                        className="h-20 w-full object-cover sm:h-28"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STICKERS */}

        {activeTab === "stickers" && (
          <div className="flex h-full items-center justify-center text-sm text-[#70786f]">
            {normalizedSearch
              ? `Sticker search for "${search}" coming later.`
              : "Stickers coming later."}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageMediaPicker;
