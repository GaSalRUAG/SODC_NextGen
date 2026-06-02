import React from "react";

export default function SidePanelLayout({ title, onClose, children }) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          left: 0,
          top: "70px",
          width: "380px",
          height: "calc(100vh - 70px)",
          backgroundColor: "white",
          boxShadow:
            "4px 0 20px rgba(0, 0, 0, 0.12), 2px 0 8px rgba(0, 0, 0, 0.08)",
          zIndex: 1000,
          padding: "28px",
          overflowY: "auto",
          animation: "slideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
            paddingBottom: "20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              margin: 0,
              background: "#0a0a0a",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "24px",
              fontWeight: "700",
              fontFamily: "Gill Sans, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontSize: "22px",
              cursor: "pointer",
              color: "#0b0c0c",
              padding: "6px 10px",
              borderRadius: "8px",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: "1",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = "#e2e8f0";
              event.currentTarget.style.color = "#475569";
              event.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "#f1f5f9";
              event.currentTarget.style.color = "#64748b";
              event.currentTarget.style.transform = "rotate(0deg) scale(1)";
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        <div style={{ color: "#475569", lineHeight: "1.7" }}>{children}</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
