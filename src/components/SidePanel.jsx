import React, { forwardRef, useImperativeHandle, useRef } from "react";
import ConvertSidePanel from "./Sidepanels/ConvertSidePanel";
import FilterSidePanel from "./Sidepanels/FilterSidePanel";
import ObstaclesSidePanel from "./Sidepanels/ObstaclesSidePanel";
import SettingsSidePanel from "./Sidepanels/SettingsSidePanel";
import SirinaMappingsSidePanel from "./Sidepanels/SirinaMappingsSidePanel";

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
  },
  ref,
) {
  const obstaclesSidePanelRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setErrorMessage(message) {
      obstaclesSidePanelRef.current?.setErrorMessage(message);
    },
  }));

  if (!isOpen) return null;

  switch (activeMenu) {
    case "Obstacles":
      return (
        <ObstaclesSidePanel
          ref={obstaclesSidePanelRef}
          onClose={onClose}
          obstacles={obstacles}
          onImportKmzFile={onImportKmzFile}
          onImportAixmFile={onImportAixmFile}
          onClearAll={onClearAll}
        />
      );

    case "Convert":
      return <ConvertSidePanel onClose={onClose} />;

    case "Filter":
      return (
        <FilterSidePanel
          onClose={onClose}
          obstacles={obstacles}
          filteredObstacleCount={filteredObstacleCount}
          displayObstacleCount={displayObstacleCount}
          altitudeFilterMeters={altitudeFilterMeters}
          altitudeFilterMaxMeters={altitudeFilterMaxMeters}
          onAltitudeFilterChange={onAltitudeFilterChange}
        />
      );

    case "SIRINA MAPPINGS":
      return <SirinaMappingsSidePanel onClose={onClose} />;

    case "Settings":
      return <SettingsSidePanel onClose={onClose} />;

    default:
      return null;
  }
});

export default SidePanel;
