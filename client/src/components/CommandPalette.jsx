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
import "./CommandPalette.css";

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

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
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

  const actions = useMemo(() => [
    {
      id: "home",
      section: "Navigation",
      label: "Go to Home",
      description: "Open your conversations",
      keywords: ["home", "chats", "messages", "conversations"],
      icon: FiHome,
      onSelect: () => navigate("/"),
    },
    {
      id: "profile",
      section: "Navigation",
      label: "Open Profile",
      description: "View your Aetherion profile",
      keywords: ["profile", "account", "me"],
      icon: FiUser,
      onSelect: () => navigate("/profile"),
    },
    {
      id: "contacts",
      section: "Navigation",
      label: "Open Contacts",
      description: "Browse your connections",
      keywords: ["contacts", "people", "connections"],
      icon: FiUsers,
      onSelect: () => navigate("/contacts"),
    },
    {
      id: "requests",
      section: "Navigation",
      label: "Open Requests",
      description: "Review contact requests",
      keywords: ["requests", "invites", "pending"],
      icon: FiUserPlus,
      onSelect: () => navigate("/requests"),
    },
    {
      id: "add-contact",
      section: "Quick actions",
      label: "Add Contact",
      description: "Find someone new on Aetherion",
      keywords: ["add", "contact", "person", "invite", "find"],
      icon: FiUserPlus,
      onSelect: () => navigate("/contacts", { state: { openAddContacts: true } }),
    },
    {
      id: "edit-profile",
      section: "Quick actions",
      label: "Edit Profile",
      description: "Update your personal details",
      keywords: ["edit", "profile", "details", "account"],
      icon: FiEdit3,
      onSelect: () => navigate("/profile/edit"),
    },
    {
      id: "theme",
      section: "Quick actions",
      label: theme === "night" ? "Switch to Light Mode" : "Switch to Dark Mode",
      description: "Change Aetherion's appearance",
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
        setQuery("");
        setActiveIndex(0);
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
      } else if (event.key === "ArrowDown" && flatResults.length) {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, flatResults.length - 1));
      } else if (event.key === "ArrowUp" && flatResults.length) {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
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

  return (
    <div
      className="aetherion-command-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <section
        className="aetherion-command-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="aetherion-command-search">
          <FiSearch className="aetherion-command-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, actions, people..."
            aria-label="Search commands and people"
            aria-activedescendant={
              flatResults.length
                ? `aetherion-command-result-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="button"
            className="aetherion-command-close"
            onClick={closePalette}
            aria-label="Close command palette"
          >
            <FiX />
          </button>
        </div>

        <div className="aetherion-command-results" role="listbox">
          {sections.length ? sections.map((section) => (
            <div className="aetherion-command-section" key={section.label}>
              <p className="aetherion-command-section-title">{section.label}</p>
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
                    className={`aetherion-command-result${selected ? " is-active" : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectResult(result)}
                  >
                    {result.person?.profilePic ? (
                      <img
                        src={result.person.profilePic}
                        alt=""
                        className="aetherion-command-avatar"
                      />
                    ) : (
                      <span className="aetherion-command-result-icon">
                        <Icon aria-hidden="true" />
                      </span>
                    )}
                    <span className="aetherion-command-result-copy">
                      <span className="aetherion-command-result-label">{result.label}</span>
                      <span className="aetherion-command-result-description">{result.description}</span>
                    </span>
                    {selected && <FiCornerDownLeft className="aetherion-command-enter" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )) : (
            <div className="aetherion-command-empty">
              <span>No matching commands or people</span>
              <span>Try another search term.</span>
            </div>
          )}
        </div>

        <footer className="aetherion-command-footer">
          <span><kbd><FiArrowUp /></kbd><kbd><FiArrowDown /></kbd> Navigate</span>
          <span><kbd><FiCornerDownLeft /></kbd> Select</span>
          <span><kbd>Esc</kbd> Close</span>
          <span className="aetherion-command-shortcut"><FiCommand /> K</span>
        </footer>
      </section>
    </div>
  );
}

export default CommandPalette;
