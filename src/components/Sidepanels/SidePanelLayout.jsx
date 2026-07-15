import React from "react";

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SidePanelLayout({ title, onClose, children }) {
  return (
    <aside className="side-panel" aria-label={title}>
      <div className="side-panel__header">
        <h2 className="side-panel__title">{title}</h2>
        <button
          type="button"
          className="side-panel__close"
          onClick={onClose}
          aria-label="Close panel"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="side-panel__body">{children}</div>
    </aside>
  );
}
