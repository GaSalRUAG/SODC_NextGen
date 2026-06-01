import React, { forwardRef, useImperativeHandle, useRef } from "react";

import ConvertPanel from "./Sidepanels/ConvertPanel";
import FilterPanel from "./Sidepanels/FilterPanel";
import ObstaclesPanel from "./Sidepanels/ObstaclesPanel";
import SettingsPanel from "./Sidepanels/SettingsPanel";
import SirinaMappingsPanel from "./Sidepanels/SirinaMappingsPanel";

const SidePanel = forwardRef(function SidePanel(
  {
    isOpen,
    activeMenu,
    onClose,
    onImportKmzFile,
    onImportAixmFile,
    onClearAll,
    obstacles = [],
    filteredObstacleCount = 0,
    displayObstacleCount = 0,
    altitudeFilterMeters = 0,
    altitudeFilterMaxMeters = 0,
    onAltitudeFilterChange,
    showPointObstacles = true,
    showLineObstacles = true,
    mergeLineSegments = false,
    onShowPointObstaclesChange,
    onShowLineObstaclesChange,
    onMergeLineSegmentsChange,
    pointCount = 0,
    lineCount = 0,
    unknownHeightCount = 0,
  },
  ref,
) {
  const obstaclesPanelRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setErrorMessage(message) {
      obstaclesPanelRef.current?.setErrorMessage(message);
    },
  }));

  if (!isOpen) return null;

  function getContent() {
    switch (activeMenu) {
      case "Obstacles":
        return {
          title: "Obstacles",
          content: (
            <ObstaclesPanel
              ref={obstaclesPanelRef}
              obstacles={obstacles}
              onImportKmzFile={onImportKmzFile}
              onImportAixmFile={onImportAixmFile}
              onClearAll={onClearAll}
              pointCount={pointCount}
              lineCount={lineCount}
              unknownHeightCount={unknownHeightCount}
            />
          ),
        };

      case "Convert":
        return { title: "Convert", content: <ConvertPanel /> };

      case "Filter":
        return {
          title: "Filter",
          content: (
            <FilterPanel
              obstacles={obstacles}
              filteredObstacleCount={filteredObstacleCount}
              displayObstacleCount={displayObstacleCount}
              altitudeFilterMeters={altitudeFilterMeters}
              altitudeFilterMaxMeters={altitudeFilterMaxMeters}
              onAltitudeFilterChange={onAltitudeFilterChange}
              showPointObstacles={showPointObstacles}
              showLineObstacles={showLineObstacles}
              mergeLineSegments={mergeLineSegments}
              onShowPointObstaclesChange={onShowPointObstaclesChange}
              onShowLineObstaclesChange={onShowLineObstaclesChange}
              onMergeLineSegmentsChange={onMergeLineSegmentsChange}
              pointCount={pointCount}
              lineCount={lineCount}
              unknownHeightCount={unknownHeightCount}
            />
          ),
        };

      case "SIRINA MAPPINGS":
        return {
          title: "SIRINA MAPPINGS",
          content: <SirinaMappingsPanel />,
        };

      case "Settings":
        return { title: "Settings", content: <SettingsPanel /> };

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
