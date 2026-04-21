import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";

import ImportIcon from "../IMG/IMG/ImportIcon.png";
import RemoveIcon from "../IMG/IMG/RemoveIcon.png";

const importButtonBaseStyle = {
  width: "100%",
  backgroundColor: "#ACDC92",
  border: "1px solid #e2e8f0",
  color: "black",
  fontSize: "15px",
  fontWeight: "50",
  padding: "10px 12px",
  borderRadius: "6px",
  transition: "all 0.2s ease",
};

const SidePanel = forwardRef(function SidePanel(
  {
    isOpen,
    activeMenu,
    onClose,
    onImportKmzFile,
    onImportAixmFile,
    onClearAll,
    obstacles = [],
  },
  ref,
) {
  const kmzInputRef = useRef(null);
  const aixmInputRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [importingKind, setImportingKind] = useState(null);

  useImperativeHandle(ref, () => ({
    setErrorMessage(message) {
      setErrorMessage(message);
    },
  }));

  if (!isOpen) return null;

  const obstacleCount = Array.isArray(obstacles) ? obstacles.length : 0;
  const hasObstacles = obstacleCount > 0;
  const isImporting = importingKind !== null;

  function openKmzPicker() {
    setErrorMessage("");
    kmzInputRef.current?.click();
  }

  function openAixmPicker() {
    setErrorMessage("");
    aixmInputRef.current?.click();
  }

  async function handleKmzFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportingKind("kmz");
      setErrorMessage("");
      await onImportKmzFile(file);
    } catch (error) {
      setErrorMessage(error?.message || "Invalid KMZ");
    } finally {
      setImportingKind(null);
      event.target.value = "";
    }
  }

  async function handleAixmFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportingKind("aixm");
      setErrorMessage("");
      await onImportAixmFile(file);
    } catch (error) {
      setErrorMessage(error?.message || "Invalid AIXM");
    } finally {
      setImportingKind(null);
      event.target.value = "";
    }
  }

  function renderImportButton({ onClick, label, disabled, marginTop = "10px" }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          ...importButtonBaseStyle,
          marginTop,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(event) => {
          if (!disabled) {
            event.currentTarget.style.color = "#ffffff";
          }
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = "black";
        }}
      >
        <img
          src={ImportIcon}
          alt=""
          style={{
            width: "20px",
            height: "20px",
            marginRight: "8px",
            verticalAlign: "middle",
          }}
        />
        {label}
      </button>
    );
  }

  function renderObstaclesPanel() {
    return (
      <div>
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            borderRadius: "8px",
            backgroundColor: "#f1f5f9",
            border: "1px solid #e2e8f0",
            fontFamily: "Gill Sans, sans-serif",
            fontSize: "16px",
            fontWeight: "600",
            color: "#0f172a",
          }}
        >
          {obstacleCount === 1
            ? "1 Hindernis importiert"
            : `${obstacleCount} Hindernisse importiert`}
        </div>

        <input
          ref={kmzInputRef}
          type="file"
          accept=".kmz"
          style={{ display: "none" }}
          onChange={handleKmzFileChange}
        />
        <input
          ref={aixmInputRef}
          type="file"
          accept=".xml,.aixm,text/xml,application/xml"
          style={{ display: "none" }}
          onChange={handleAixmFileChange}
        />

        {renderImportButton({
          onClick: openKmzPicker,
          disabled: isImporting,
          marginTop: "4px",
          label: importingKind === "kmz" ? "Import läuft..." : "Import KMZ File",
        })}

        {renderImportButton({
          onClick: openAixmPicker,
          disabled: isImporting,
          label: importingKind === "aixm" ? "Import läuft..." : "Import AIXM File",
        })}

        {errorMessage ? (
          <div
            style={{
              marginTop: "14px",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClearAll}
          hidden={!hasObstacles}
          style={{
            width: "100%",
            marginTop: "18px",
            backgroundColor: "#F5293D",
            border: "1px solid #e2e8f0",
            color: "white",
            fontSize: "15px",
            fontWeight: "50",
            cursor: hasObstacles ? "pointer" : "not-allowed",
            padding: "10px 12px",
            borderRadius: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(event) => {
            if (hasObstacles) {
              event.currentTarget.style.color = "#000000";
            }
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "white";
          }}
        >
          <img
            src={RemoveIcon}
            alt=""
            style={{
              width: "20px",
              height: "20px",
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          Clear All Obstacles
        </button>
      </div>
    );
  }

  function getContent() {
    switch (activeMenu) {
      case "Obstacles":
        return { title: "Obstacles", content: renderObstaclesPanel() };

      case "Convert":
        return { title: "Convert", content: <p>content</p> };

      case "Filter":
        return {
          title: "Filter",
          content: (
            <div>
              <p>Filter</p>
            </div>
          ),
        };

      case "SIRINA MAPPINGS":
        return { title: "SIRINA MAPPINGS", content: <p>SIRINA MAPPINGS</p> };

      case "Settings":
        return {
          title: "Settings",
          content: (
            <div>
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  color: "#1e293b",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                Settings
              </h3>
            </div>
          ),
        };

      default:
        return { title: "", content: <div>No content available</div> };
    }
  }

  const { title, content } = getContent();

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

        <div style={{ color: "#475569", lineHeight: "1.7" }}>{content}</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
});

export default SidePanel;
