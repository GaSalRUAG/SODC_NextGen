import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";

import ImportIcon from "../../IMG/IMG/ImportIcon.png";
import RemoveIcon from "../../IMG/IMG/RemoveIcon.png";

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

  return (
    <div className="obstacles-panel">
      <p className="obstacles-panel__summary">
        {obstacleCount === 1
          ? "1 Hindernis importiert"
          : `${obstacleCount} Hindernisse importiert`}
      </p>

      <input
        ref={kmzInputRef}
        type="file"
        accept=".kmz"
        className="visually-hidden"
        onChange={handleKmzFileChange}
      />
      <input
        ref={aixmInputRef}
        type="file"
        accept=".xml,.aixm,text/xml,application/xml"
        className="visually-hidden"
        onChange={handleAixmFileChange}
      />

      <div className="obstacles-panel__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={openKmzPicker}
          disabled={isImporting}
        >
          <img className="btn__icon" src={ImportIcon} alt="" />
          {importingKind === "kmz" ? "Import läuft..." : "Import KMZ File"}
        </button>

        <button
          type="button"
          className="btn btn--primary"
          onClick={openAixmPicker}
          disabled={isImporting}
        >
          <img className="btn__icon" src={ImportIcon} alt="" />
          {importingKind === "aixm" ? "Import läuft..." : "Import AIXM File"}
        </button>
      </div>

      {errorMessage ? (
        <p className="obstacles-panel__alert" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {hasObstacles ? (
        <button
          type="button"
          className="btn btn--danger"
          onClick={onClearAll}
        >
          <img className="btn__icon" src={RemoveIcon} alt="" />
          Clear All Obstacles
        </button>
      ) : null}
    </div>
  );
});

export default ObstaclesPanel;
