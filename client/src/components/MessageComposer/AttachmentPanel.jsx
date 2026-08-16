import React from "react";
import {
  FiCamera,
  FiFileText,
  FiImage,
  FiMapPin,
  FiUser,
  FiBarChart2,
} from "react-icons/fi";

const AttachmentPanel = ({
  isOpen,
  onCamera,
  onGallery,
  onDocument,
  onPoll,
  onLocation,
  onContact,
}) => {
  const options = [
    {
      label: "Camera",
      icon: FiCamera,
      color: "#ff5c5c",
      onClick: onCamera,
    },
    {
      label: "Gallery",
      icon: FiImage,
      color: "#4da6ff",
      onClick: onGallery,
    },
    {
      label: "Document",
      icon: FiFileText,
      color: "#7f8cff",
      onClick: onDocument,
    },
    {
      label: "Poll",
      icon: FiBarChart2,
      color: "#b36bff",
      onClick: onPoll,
    },
    {
      label: "Location",
      icon: FiMapPin,
      color: "#ff6b6b",
      onClick: onLocation,
    },
    {
      label: "Contact",
      icon: FiUser,
      color: "#3fd99b",
      onClick: onContact,
    },
  ];

  return (
    <div
      className={`
        absolute bottom-full left-1/2 z-50 mb-3
        -translate-x-1/2
        origin-bottom
        transition-all duration-300 ease-out
        ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }
      `}
    >
      <div
        className="
          w-[250px]
          rounded-2xl
          border border-white/10
          bg-[#101610]/95
          p-2
          shadow-2xl
          backdrop-blur-md
        "
      >
        <div
          className="
            grid grid-cols-3 gap-1.5
            lg:grid-cols-1
          "
        >
          {options.map(({ label, icon: Icon, color, onClick }, index) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              style={{
                "--icon-color": color,
                transitionDelay: isOpen ? `${index * 75}ms` : "0ms",
              }}
              className={`
                  group
                  flex
                  min-h-[72px]
                  flex-col
                  items-center
                  justify-center
                  gap-1.5
                  rounded-xl
                  bg-[#151c15]
                  px-1.5
                  py-2
                  text-[11px]
                  font-medium
                  text-[#aeb7aa]
                  transition-all
                  duration-300
                  ease-out

                  ${
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }

                  hover:bg-[#1b211b]
                  active:scale-95

                  lg:min-h-[48px]
                  lg:flex-row
                  lg:justify-start
                  lg:gap-3
                  lg:px-3
                  lg:py-1.5
                `}
            >
              <span
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#202820]
                    transition-all
                    duration-200

                    lg:h-8
                    lg:w-8
                  "
              >
                <Icon
                  className="
                      text-lg
                      transition-all
                      duration-200
                      lg:text-base
                    "
                  style={{
                    color: "var(--icon-color)",
                  }}
                />
              </span>

              <span
                className="
                    transition-colors
                    duration-200
                    group-hover:text-[var(--icon-color)]
                  "
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttachmentPanel;
