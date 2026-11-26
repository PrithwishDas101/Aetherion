import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiCornerDownLeft,
  FiEdit3,
  FiHome,
  FiMessageCircle,
  FiMoon,
  FiSearch,
  FiSun,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { setSelectedChat } from "../redux/userSlice.js";
import { startChatWithUser } from "../utils/startChat.js";

const DESKTOP_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const hasActiveSession = () => {
  try {
    return Boolean(localStorage.getItem("token"));
  } catch {
    return false;
  }
};

const getFullName = (person) =>
  `${person?.firstName || ""} ${person?.lastName || ""}`.trim();

const getSearchablePersonText = (person) =>
  [
    getFullName(person),
    person?.username,
    person?.userName,
    person?.handle,
    person?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getOtherMembers = (chat, currentUserId, allUsers) =>
  (chat?.members || [])
    .map((member) => {
      if (member && typeof member === "object") return member;
      return (allUsers || []).find(
        (person) => String(person?._id) === String(member),
      );
    })
    .filter(Boolean)
    .filter((member) => String(member._id) !== String(currentUserId));

function CommandPalette() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, allUsers, allChats } = useSelector((state) => state.userReducer);

  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("aetherion-auth-theme") === "night" ? "night" : "warm";
    } catch {
      return "warm";
    }
  });
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  const openPalette = useCallback(() => {
    previousFocusRef.current = document.activeElement;
    setQuery("");
    setActiveIndex(0);
    setIsOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);

    window.requestAnimationFrame(() => {
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) {
        previousFocus.focus();
      } else {
        document.querySelector('[aria-label="Open profile menu"]')?.focus();
      }
    });
  }, []);

  const applyTheme = useCallback((nextTheme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.aetherionTheme = nextTheme;

    try {
      localStorage.setItem("aetherion-auth-theme", nextTheme);
    } catch {
      // Keep the current session theme working if storage is unavailable.
    }

    window.dispatchEvent(
      new CustomEvent("aetherion-theme-change", { detail: nextTheme }),
    );
  }, []);

  const openPerson = useCallback(async (person) => {
    closePalette();

    if (!user?._id || !person?._id) return;

    const existingChat = (allChats || []).find((chat) => {
      const memberIds = (chat.members || []).map((member) =>
        String(member?._id || member),
      );

      return memberIds.includes(String(user._id)) &&
        memberIds.includes(String(person._id));
    });

    if (existingChat) {
      dispatch(setSelectedChat(existingChat));
      navigate("/");
      return;
    }

    const started = await startChatWithUser({
      currentUserId: user._id,
      targetUserId: person._id,
      allChats,
      dispatch,
    });

    if (started) navigate("/");
  }, [allChats, closePalette, dispatch, navigate, user?._id]);

  const openConversation = useCallback((chat) => {
    closePalette();
    dispatch(setSelectedChat(chat));
    navigate("/");
  }, [closePalette, dispatch, navigate]);

  const selectResult = useCallback((result) => {
    if (!result) return;

    closePalette();
    result.onSelect();
  }, [closePalette]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const updateDesktopState = () => setIsDesktop(mediaQuery.matches);

    updateDesktopState();
    mediaQuery.addEventListener("change", updateDesktopState);

    return () => mediaQuery.removeEventListener("change", updateDesktopState);
  }, []);

  useEffect(() => {
    const handleOpenPalette = () => {
      if (
        !isDesktop ||
        !user?._id ||
        !hasActiveSession() ||
        pathname === "/login" ||
        pathname === "/signup"
      ) {
        return;
      }

      openPalette();
    };

    window.addEventListener("aetherion-open-command-palette", handleOpenPalette);
    return () => {
      window.removeEventListener("aetherion-open-command-palette", handleOpenPalette);
    };
  }, [isDesktop, openPalette, pathname, user?._id]);

  useEffect(() => {
    const syncTheme = (event) => {
      if (event.detail === "warm" || event.detail === "night") {
        setTheme(event.detail);
      }
    };

    window.addEventListener("aetherion-theme-change", syncTheme);
    return () => window.removeEventListener("aetherion-theme-change", syncTheme);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const actions = useMemo(() => [
    {
      id: "home",
      section: "Navigation",
      label: "Home",
      description: "Your conversations",
      keywords: ["home", "chats", "messages", "conversations"],
      icon: FiHome,
      onSelect: () => navigate("/"),
    },
    {
      id: "profile",
      section: "Navigation",
      label: "Profile",
      description: "Your account",
      keywords: ["profile", "account", "me"],
      icon: FiUser,
      onSelect: () => navigate("/profile"),
    },
    {
      id: "contacts",
      section: "Navigation",
      label: "Contacts",
      description: "Your connections",
      keywords: ["contacts", "people", "connections"],
      icon: FiUsers,
      onSelect: () => navigate("/contacts"),
    },
    {
      id: "requests",
      section: "Navigation",
      label: "Requests",
      description: "Incoming invitations",
      keywords: ["requests", "invites", "pending"],
      icon: FiUserPlus,
      onSelect: () => navigate("/requests"),
    },
    {
      id: "add-contact",
      section: "Quick actions",
      label: "Add contact",
      description: "Find someone on Aetherion",
      keywords: ["add", "contact", "person", "invite", "find"],
      icon: FiUserPlus,
      onSelect: () => navigate("/contacts", { state: { openAddContacts: true } }),
    },
    {
      id: "edit-profile",
      section: "Quick actions",
      label: "Edit profile",
      description: "Update your details",
      keywords: ["edit", "profile", "details", "account"],
      icon: FiEdit3,
      onSelect: () => navigate("/profile/edit"),
    },
    {
      id: "theme",
      section: "Quick actions",
      label: theme === "night" ? "Light appearance" : "Dark appearance",
      description: "Change the way Aetherion looks",
      keywords: ["theme", "appearance", "light", "dark", "mode"],
      icon: theme === "night" ? FiSun : FiMoon,
      onSelect: () => applyTheme(theme === "night" ? "warm" : "night"),
    },
  ], [applyTheme, navigate, theme]);

  const normalizedQuery = query.trim().toLowerCase().replace(/^@/, "");

  const peopleResults = useMemo(() => {
    if (!normalizedQuery || !Array.isArray(allUsers)) return [];

    return allUsers
      .filter((person) =>
        person?._id &&
        String(person._id) !== String(user?._id) &&
        getSearchablePersonText(person).includes(normalizedQuery),
      )
      .sort((first, second) => {
        const firstText = getSearchablePersonText(first);
        const secondText = getSearchablePersonText(second);
        const firstStarts = firstText.startsWith(normalizedQuery) ? 0 : 1;
        const secondStarts = secondText.startsWith(normalizedQuery) ? 0 : 1;
        return firstStarts - secondStarts ||
          getFullName(first).localeCompare(getFullName(second));
      })
      .slice(0, 6)
      .map((person) => ({
        id: `person-${person._id}`,
        section: "People",
        label: getFullName(person) || person.username || "Aetherion user",
        description: person.username ? `@${person.username}` : person.email || "Open conversation",
        person,
        icon: FiUser,
        onSelect: () => openPerson(person),
      }));
  }, [allUsers, normalizedQuery, openPerson, user?._id]);

  const conversationResults = useMemo(() => {
    if (!normalizedQuery || !Array.isArray(allChats)) return [];

    return allChats
      .map((chat) => {
        const members = getOtherMembers(chat, user?._id, allUsers);
        const names = members.map(getFullName).filter(Boolean);
        const label = chat?.chatName || chat?.name || names.join(", ") || "Conversation";
        const searchable = [
          label,
          ...members.map(getSearchablePersonText),
        ].join(" ").toLowerCase();

        return { chat, label, members, searchable };
      })
      .filter((item) => item.searchable.includes(normalizedQuery))
      .slice(0, 5)
      .map((item) => ({
        id: `conversation-${item.chat._id}`,
        section: "Conversations",
        label: item.label,
        description: item.members
          .map((member) => member.username ? `@${member.username}` : "")
          .filter(Boolean)
          .join(" · ") || "Jump back into this chat",
        icon: FiMessageCircle,
        onSelect: () => openConversation(item.chat),
      }));
  }, [allChats, allUsers, normalizedQuery, openConversation, user?._id]);

  const filteredActions = useMemo(() => {
    if (!normalizedQuery) return actions;

    return actions.filter((action) =>
      [action.label, action.description, ...action.keywords]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [actions, normalizedQuery]);

  const sections = useMemo(() => [
    { label: "Navigation", items: filteredActions.filter((action) => action.section === "Navigation") },
    { label: "Quick actions", items: filteredActions.filter((action) => action.section === "Quick actions") },
    { label: "Conversations", items: conversationResults },
    { label: "People", items: peopleResults },
  ].filter((section) => section.items.length > 0), [
    conversationResults,
    filteredActions,
    peopleResults,
  ]);

  const flatResults = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  useEffect(() => {
    if (!user?._id || !hasActiveSession() || !isDesktop || pathname === "/login" || pathname === "/signup") {
      setIsOpen(false);
      return undefined;
    }

    const handleKeyDown = (event) => {
      const isPaletteShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        event.key.toLowerCase() === "k";

      if (isPaletteShortcut) {
        event.preventDefault();
        openPalette();
        return;
      }

      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
      } else if (event.key === "ArrowDown" && flatResults.length) {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % flatResults.length);
      } else if (event.key === "ArrowUp" && flatResults.length) {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + flatResults.length) % flatResults.length);
      } else if (event.key === "Home" && flatResults.length) {
        event.preventDefault();
        setActiveIndex(0);
      } else if (event.key === "End" && flatResults.length) {
        event.preventDefault();
        setActiveIndex(flatResults.length - 1);
      } else if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(
          'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (event.key === "Enter") {
        const selected = flatResults[activeIndex];
        if (selected) {
          event.preventDefault();
          selectResult(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeIndex,
    closePalette,
    flatResults,
    isDesktop,
    isOpen,
    selectResult,
    openPalette,
    user?._id,
    pathname,
  ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;

    document
      .getElementById(`aetherion-command-result-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  if (!isDesktop || !isOpen || !user?._id || !hasActiveSession() || pathname === "/login" || pathname === "/signup") return null;

  let resultIndex = 0;
  const isNight = theme === "night";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#171b16]/25 px-4 pb-8 pt-[clamp(4rem,12vh,7rem)] backdrop-blur-[5px] motion-safe:animate-palette-overlay-in motion-reduce:animate-none sm:px-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aetherion-command-title"
        aria-describedby="aetherion-command-description"
        className={`relative flex max-h-[min(680px,78vh)] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] border font-sans shadow-[0_28px_90px_rgba(24,30,23,0.22),0_4px_16px_rgba(24,30,23,0.08)] ring-1 ring-black/[0.025] motion-safe:animate-palette-panel-in motion-reduce:animate-none ${
          isNight
            ? "border-[#3a4038] bg-[#20231f] text-[#e9ece5] shadow-[0_28px_90px_rgba(0,0,0,0.48),0_4px_16px_rgba(0,0,0,0.2)] ring-white/[0.035]"
            : "border-[#d5dbd0] bg-[#fbfcf8] text-[#242a22]"
        }`}
      >
        <header className={`flex items-center justify-between px-5 pb-3 pt-4 sm:px-6 ${
          isNight ? "text-[#a9b2a3]" : "text-[#788273]"
        }`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isNight ? "bg-[#30382e] text-[#c5d2bd]" : "bg-[#edf1e9] text-[#65745f]"
            }`}>
              <FiSearch className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p id="aetherion-command-title" className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                isNight ? "text-[#d4dbce]" : "text-[#465142]"
              }`}>Quick search</p>
              <p id="aetherion-command-description" className="mt-0.5 truncate text-[10px]">
                Find a page, person or conversation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePalette}
            aria-label="Close quick search"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91a187] ${
              isNight ? "text-[#9ba594] hover:bg-white/[0.07] hover:text-[#edf1e8]" : "text-[#858e80] hover:bg-[#edf0e9] hover:text-[#30382e]"
            }`}
          >
            <FiX className="h-4 w-4" />
          </button>
        </header>

        <div className={`mx-4 flex min-h-[58px] items-center gap-3 rounded-xl border px-4 transition-colors sm:mx-5 ${
          isNight
            ? "border-[#41483e] bg-[#191c19] focus-within:border-[#74856d] focus-within:ring-2 focus-within:ring-[#74856d]/15"
            : "border-[#dce2d7] bg-white focus-within:border-[#9aa991] focus-within:ring-2 focus-within:ring-[#9aa991]/20"
        }`}>
          <FiSearch className={`h-[18px] w-[18px] shrink-0 ${
            isNight ? "text-[#a6b19d]" : "text-[#7b8874]"
          }`} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search anything..."
            role="combobox"
            aria-expanded="true"
            aria-controls="aetherion-command-results"
            aria-autocomplete="list"
            aria-label="Search commands, people and conversations"
            aria-activedescendant={flatResults.length ? `aetherion-command-result-${activeIndex}` : undefined}
            autoComplete="off"
            spellCheck="false"
            className={`min-w-0 flex-1 bg-transparent py-3 text-[14px] font-medium tracking-[-0.01em] outline-none placeholder:font-normal ${
              isNight ? "text-[#edf0e8] placeholder:text-[#737d70]" : "text-[#293027] placeholder:text-[#9aa294]"
            }`}
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91a187] ${
                isNight ? "text-[#a5ae9d] hover:bg-white/[0.07]" : "text-[#788273] hover:bg-[#edf1e9]"
              }`}
            >
              Clear
            </button>
          )}
          <kbd className={`hidden rounded-md border px-2 py-1 text-[10px] font-medium sm:inline-flex ${
            isNight ? "border-[#3b4239] bg-[#252a24] text-[#9ca695]" : "border-[#e1e6dd] bg-[#f7f9f4] text-[#879080]"
          }`}>{isMac ? "⌘" : "Ctrl"} K</kbd>
        </div>

        <div className="flex items-center justify-between px-5 pb-2 pt-4 sm:px-6">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.11em] ${
            isNight ? "text-[#8e9987]" : "text-[#879080]"
          }`}>{normalizedQuery ? "Search results" : "Explore"}</span>
          <span className={`text-[10px] tabular-nums ${
            isNight ? "text-[#778172]" : "text-[#9aa293]"
          }`}>{flatResults.length} {flatResults.length === 1 ? "result" : "results"}</span>
        </div>

        <span className="sr-only" aria-live="polite">
          {flatResults.length} {flatResults.length === 1 ? "result" : "results"}
        </span>
        <div
          id="aetherion-command-results"
          role="listbox"
          aria-label="Search results"
          className="aetherion-command-palette-scrollbar min-h-[120px] overflow-y-auto overscroll-contain px-3 pb-3 pt-1 sm:px-4"
        >
          {sections.length ? sections.map((section) => (
            <div className="pb-2" key={section.label} role="group" aria-label={section.label}>
              <p className={`px-2 pb-1.5 pt-2 text-[10px] font-medium tracking-[0.015em] ${
                isNight ? "text-[#788373]" : "text-[#929b8c]"
              }`}>{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((result) => {
                  const index = resultIndex++;
                  const Icon = result.icon;
                  const selected = index === activeIndex;
                  return (
                    <button
                      type="button"
                      id={`aetherion-command-result-${index}`}
                      key={result.id}
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectResult(result)}
                      className={`group flex min-h-[48px] w-full items-center gap-3 rounded-xl px-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#91a187] ${
                        selected
                          ? isNight
                            ? "bg-[#30392d] text-[#eef2e9] shadow-[inset_2px_0_0_#9aaa8e]"
                            : "bg-[#edf2e9] text-[#283126] shadow-[inset_2px_0_0_#87977e]"
                          : isNight
                            ? "text-[#d7ddd1] hover:bg-white/[0.045]"
                            : "text-[#394235] hover:bg-[#f0f3ed]"
                      }`}
                    >
                      {result.person?.profilePic ? (
                        <img
                          src={result.person.profilePic}
                          alt=""
                          className={`h-8 w-8 shrink-0 rounded-full border object-cover ${
                            isNight ? "border-white/10" : "border-[#dce3d7]"
                          }`}
                        />
                      ) : (
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? isNight ? "bg-[#3b4737] text-[#d4dfcb]" : "bg-white/80 text-[#607259]"
                            : isNight ? "bg-[#292e28] text-[#9ba694]" : "bg-[#f0f3ed] text-[#788572]"
                        }`}>
                          <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
                        </span>
                      )}
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-[12px] font-medium tracking-[-0.005em]">{result.label}</span>
                        <span className={`max-w-[45%] shrink-0 truncate text-right text-[10px] ${
                          isNight ? "text-[#8d9886]" : "text-[#929b8d]"
                        }`}>{result.description}</span>
                      </span>
                      {selected && <FiCornerDownLeft className={`h-3.5 w-3.5 shrink-0 ${
                        isNight ? "text-[#b9c8ae]" : "text-[#778b6e]"
                      }`} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="flex min-h-[190px] flex-col items-center justify-center px-4 text-center">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isNight ? "bg-[#2a3028] text-[#a4b099]" : "bg-[#edf2e9] text-[#788a70]"
              }`}><FiSearch className="h-4 w-4" /></span>
              <p className={`mt-3 text-[12px] font-semibold ${
                isNight ? "text-[#e1e7dc]" : "text-[#485342]"
              }`}>Nothing matches that search</p>
              <p className={`mt-1 text-[10px] ${
                isNight ? "text-[#84907d]" : "text-[#929b8c]"
              }`}>Try another name or search term.</p>
            </div>
          )}
        </div>

        <footer className={`flex min-h-[42px] flex-wrap items-center gap-x-4 gap-y-2 border-t px-5 py-2 text-[10px] sm:px-6 ${
          isNight ? "border-[#343a32] bg-[#1c201c] text-[#929d8a]" : "border-[#e3e8df] bg-[#f7f9f4] text-[#879180]"
        }`}>
          <span className="inline-flex items-center gap-1.5">
            <kbd className={`rounded border px-1.5 py-0.5 ${
              isNight ? "border-[#3a4238] bg-[#252a24] text-[#b2bca9]" : "border-[#e0e6dc] bg-white text-[#788572]"
            }`}>↑</kbd>
            <kbd className={`rounded border px-1.5 py-0.5 ${
              isNight ? "border-[#3a4238] bg-[#252a24] text-[#b2bca9]" : "border-[#e0e6dc] bg-white text-[#788572]"
            }`}>↓</kbd>
            Navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className={`rounded border px-1.5 py-0.5 ${
              isNight ? "border-[#3a4238] bg-[#252a24] text-[#b2bca9]" : "border-[#e0e6dc] bg-white text-[#788572]"
            }`}>↵</kbd>
            Select
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className={`rounded border px-1.5 py-0.5 ${
              isNight ? "border-[#3a4238] bg-[#252a24] text-[#b2bca9]" : "border-[#e0e6dc] bg-white text-[#788572]"
            }`}>Esc</kbd>
            Close
          </span>
          <span className="ml-auto hidden items-center gap-1.5 sm:inline-flex">
            Search across Aetherion
            <span className={`h-1 w-1 rounded-full ${isNight ? "bg-[#84927b]" : "bg-[#a2b197]"}`} />
            {isMac ? "⌘ K" : "Ctrl K"}
          </span>
        </footer>
      </section>
    </div>
  );
}

export default CommandPalette;
