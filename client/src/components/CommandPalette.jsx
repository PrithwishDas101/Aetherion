import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowUp,
  FiCommand,
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
      className="fixed inset-0 z-[200] flex items-start justify-center bg-[#171b16]/20 px-6 pb-8 pt-[clamp(4.5rem,14vh,8rem)] backdrop-blur-md motion-safe:animate-palette-overlay-in motion-reduce:animate-none"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <section
        className={`flex max-h-[min(680px,74vh)] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border backdrop-blur-xl shadow-[0_20px_60px_rgba(29,33,28,0.14),0_3px_12px_rgba(29,33,28,0.05)] motion-safe:animate-palette-panel-in motion-reduce:animate-none ${
          isNight
            ? "border-[#343733]/90 bg-[#202220]/96 text-[#e9e9e3] shadow-[0_20px_60px_rgba(0,0,0,0.32),0_3px_12px_rgba(0,0,0,0.12)]"
            : "border-[#c8cdc2]/90 bg-[#f7f8f3]/96 text-[#1d211c]"
        }`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aetherion-command-title"
        aria-describedby="aetherion-command-description"
      >
        <div className={`flex min-h-[34px] items-center justify-between border-b px-5 font-sans text-[10px] font-semibold tracking-[0.08em] ${
          isNight ? "border-[#343733]/80" : "border-[#d2d6cc]/80"
        }`}>
          <span id="aetherion-command-title" className="inline-flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${isNight ? "bg-[#a6b89b] shadow-[0_0_8px_rgba(166,184,155,0.65)]" : "bg-[#71866b]"}`} /> Aetherion <span className={isNight ? "text-white/25" : "text-black/25"}>/</span> Quick search</span>
          <span id="aetherion-command-description" className={isNight ? "text-[#778272]" : "text-[#92998d]"}>Pages, people, conversations & actions</span>
        </div>
        <div className={`flex min-h-[66px] items-center gap-3 border-b px-5 ${isNight ? "border-[#343733]" : "border-[#d2d6cc]"}`}>
          <FiSearch
            className={`h-[21px] w-[21px] shrink-0 ${
              isNight ? "text-[#a4a99e]" : "text-[#70786d]"
            }`}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, people, conversations…"
            aria-label="Search commands and people"
            aria-activedescendant={
              flatResults.length
                ? `aetherion-command-result-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            spellCheck="false"
            className={`min-w-0 flex-1 bg-transparent font-sans text-[17px] font-medium tracking-[-0.025em] outline-none placeholder:font-normal ${
              isNight
                ? "text-[#e9e9e3] placeholder:text-[#858b80]"
                : "text-[#20241f] placeholder:text-[#92998e]"
            }`}
          />
          {query.trim() && (
            <button
              type="button"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9a85] ${
                isNight
                  ? "text-[#a7b0a2] hover:bg-white/[0.08] hover:text-white"
                  : "text-[#858d81] hover:bg-black/[0.06] hover:text-[#252b24]"
              }`}
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              title="Clear search"
            >
              <FiX className="h-[15px] w-[15px]" />
            </button>
          )}
          <button
            type="button"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-150 hover:rotate-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9a85] ${
              isNight
                ? "text-[#a7b0a2] hover:bg-white/[0.08] hover:text-white"
                : "text-[#858d81] hover:bg-black/[0.06] hover:text-[#252b24]"
            }`}
            onClick={closePalette}
            aria-label="Close command palette"
          >
            <FiX className="h-[17px] w-[17px]" />
          </button>
        </div>

        <div
          className="aetherion-command-palette-scrollbar min-h-[120px] overflow-y-auto overscroll-contain px-3 pb-3 pt-3"
          role="listbox"
          aria-label="Search results"
        >
          <span className="sr-only" aria-live="polite">
            {flatResults.length} {flatResults.length === 1 ? "result" : "results"}
          </span>
          {sections.length ? sections.map((section, sectionIndex) => (
            <div
              className={`${sectionIndex > 0 ? `mt-2 border-t pt-2 ${isNight ? "border-[#343733]/70" : "border-[#d2d6cc]/70"}` : ""}`}
              key={section.label}
              role="group"
              aria-label={section.label}
            >
              <p className={`px-3 pb-2 pt-1 font-sans text-[10px] font-semibold tracking-[0.06em] ${
                isNight ? "text-[#a4a59d]" : "text-[#70786d]"
              }`}>
                {section.label}
              </p>
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
                    className={`group flex min-h-[54px] w-full items-center gap-3 rounded-lg px-3 text-left transition-[background-color,transform] duration-150 ease-out active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8b9a85] ${
                      selected
                        ? isNight
                          ? "bg-[#2c332a] shadow-[inset_2px_0_0_#a6b89b]"
                           : "bg-[#e9ede5] shadow-[inset_2px_0_0_#71866b]"
                        : isNight
                          ? "hover:bg-white/[0.045]"
                          : "hover:bg-[#eeefe8]/80"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectResult(result)}
                  >
                    {result.person?.profilePic ? (
                      <img
                        src={result.person.profilePic}
                        alt=""
                        className={`h-[34px] w-[34px] shrink-0 rounded-full border object-cover ${
                          isNight ? "border-white/15" : "border-[#dfe4da]"
                        }`}
                      />
                    ) : (
                      <span
                        className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                          selected
                            ? isNight
                              ? "bg-white/[0.07] text-[#d9e2d3]"
                              : "bg-white/80 text-[#52654f]"
                            : isNight
                              ? "bg-white/[0.045] text-[#a4a59d]"
                              : "bg-[#eeefe8] text-[#555e54]"
                        }`}
                      >
                        <Icon className="h-[16px] w-[16px]" aria-hidden="true" />
                      </span>
                    )}
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <span className={`truncate font-sans text-[13px] font-semibold tracking-[-0.01em] ${
                        isNight ? "text-[#edf0e8]" : "text-[#2a3028]"
                      }`}>
                        {result.label}
                      </span>
                      <span className={`max-w-[48%] truncate text-right font-sans text-[11px] font-medium ${
                        isNight ? "text-[#929d8e]" : "text-[#899185]"
                      }`}>
                        {result.description}
                      </span>
                    </span>
                    {selected && (
                      <FiCornerDownLeft
                        className={`h-[14px] w-[14px] shrink-0 ${
                          isNight ? "text-[#b7c4b0]" : "text-[#7b8976]"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )) : (
            <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 text-center">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                isNight
                  ? "border-[#343733]/80 bg-[#242624] text-[#a4a59d]"
                  : "border-[#d2d6cc]/80 bg-[#eeefe8] text-[#70786d]"
              }`}>
                <FiSearch className="h-[18px] w-[18px]" />
              </span>
              <span className={`pt-1 font-sans text-[13px] font-semibold ${
                isNight ? "text-[#e2e7dc]" : "text-[#525c4e]"
              }`}>
                No results found
              </span>
              <span className={`font-sans text-[11px] ${
                isNight ? "text-[#899486]" : "text-[#92998e]"
              }`}>
                Try a different name or command.
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className={`mt-2 rounded-lg px-3 py-1.5 font-sans text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9a85] ${
                  isNight
                    ? "text-[#c2cbbb] hover:bg-white/[0.07]"
                    : "text-[#52654f] hover:bg-[#e9ede5]"
                }`}
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <footer className={`flex min-h-[48px] items-center gap-4 border-t px-5 font-sans text-[10px] font-medium ${
          isNight
            ? "border-[#343733]/80 bg-[#1b1e1b]/55 text-[#a4a59d]"
            : "border-[#d2d6cc]/80 bg-[#eeefe8]/65 text-[#70786d]"
        }`}>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <kbd className={`inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-md border px-1 ${
              isNight ? "border-[#343733] bg-[#242624] text-[#a4a59d]" : "border-[#c8cdc2] bg-[#f7f8f3] text-[#555e54]"
            }`}><FiArrowUp className="h-3 w-3" /></kbd>
            <kbd className={`inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-md border px-1 ${
              isNight ? "border-white/10 bg-white/[0.05] text-[#c2cbbb]" : "border-[#dfe3d9] bg-white/70 text-[#687265]"
            }`}><FiArrowDown className="h-3 w-3" /></kbd>
            Navigate
          </span>
          <span className="hidden items-center gap-1 whitespace-nowrap xl:inline-flex">
            <kbd className={`inline-flex h-[20px] items-center rounded-md border px-1.5 ${isNight ? "border-white/10 bg-white/[0.05] text-[#c2cbbb]" : "border-[#dfe3d9] bg-white/70 text-[#687265]"}`}>Home</kbd>
            <kbd className={`inline-flex h-[20px] items-center rounded-md border px-1.5 ${isNight ? "border-white/10 bg-white/[0.05] text-[#c2cbbb]" : "border-[#dfe3d9] bg-white/70 text-[#687265]"}`}>End</kbd>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <kbd className={`inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-md border px-1 shadow-sm ${
              isNight ? "border-white/10 bg-white/[0.05] text-[#c2cbbb]" : "border-[#dfe3d9] bg-white/70 text-[#687265]"
            }`}><FiCornerDownLeft className="h-3 w-3" /></kbd>
            Select
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <kbd className={`inline-flex h-[20px] items-center justify-center rounded-md border px-1.5 ${
              isNight ? "border-white/10 bg-white/[0.05] text-[#c2cbbb]" : "border-[#dfe3d9] bg-white/70 text-[#687265]"
            }`}>Esc</kbd>
            Close
          </span>
          <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap">
            {isMac ? <FiCommand className="h-3 w-3" /> : (
              <kbd className={`inline-flex h-[20px] items-center justify-center rounded-md border px-1.5 shadow-sm ${
                isNight ? "border-white/10 bg-white/[0.05] text-[#c2cbbb]" : "border-[#dfe3d9] bg-white/70 text-[#687265]"
              }`}>Ctrl</kbd>
            )}
            <kbd className={`inline-flex h-[20px] items-center justify-center rounded-md border px-1.5 shadow-sm ${
              isNight ? "border-white/10 bg-white/[0.05] text-[#c2cbbb]" : "border-[#dfe3d9] bg-white/70 text-[#687265]"
            }`}>K</kbd>
          </span>
        </footer>
      </section>
    </div>
  );
}

export default CommandPalette;
