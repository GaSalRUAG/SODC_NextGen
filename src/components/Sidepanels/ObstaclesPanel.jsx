import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";

import ImportIcon from "../../IMG/IMG/ImportIcon.png";
import RemoveIcon from "../../IMG/IMG/RemoveIcon.png";

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

const ObstaclesPanel = forwardRef(function ObstaclesPanel(
  {
    obstacles = [],
    onImportKmzFile,
    onImportAixmFile,
    onClearAll,
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
});

export default ObstaclesPanel;
