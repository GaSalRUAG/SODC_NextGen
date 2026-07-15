import React from "react";
import SwissIcon from "../IMG/IMG/Swiss_ICON.webp";

const MENU_ITEMS = ["Obstacles", "Convert", "Filter", "SIRINA MAPPINGS"];

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.77 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.89 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.5.39 1.04.7 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
      />
    </svg>
  );
}

export default function MenuBar({ onMenuClick, activeMenu }) {
  return (
    <header className="menu-bar">
      <div className="menu-bar__brand">
        <img
          className="menu-bar__logo"
          src={SwissIcon}
          width={40}
          height={40}
          alt="SODC"
        />
        <h1 className="menu-bar__title">SODC Next Gen</h1>
        <span className="menu-bar__divider" aria-hidden="true" />
        <nav className="menu-bar__nav" aria-label="Main">
          {MENU_ITEMS.map((item) => {
            const isActive = activeMenu === item;
            return (
              <button
                key={item}
                type="button"
                className={`menu-bar__item${isActive ? " menu-bar__item--active" : ""}`}
                aria-pressed={isActive}
                onClick={() => onMenuClick(item)}
              >
                {item}
              </button>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        className={`menu-bar__icon-btn${
          activeMenu === "Settings" ? " menu-bar__icon-btn--active" : ""
        }`}
        aria-label="Settings"
        aria-pressed={activeMenu === "Settings"}
        onClick={() => onMenuClick("Settings")}
      >
        <SettingsIcon />
      </button>
    </header>
  );
}
