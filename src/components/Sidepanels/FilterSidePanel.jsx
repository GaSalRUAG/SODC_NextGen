import React from "react";
import FilterPanel from "./FilterPanel";
import SidePanelLayout from "./SidePanelLayout";

export default function FilterSidePanel({
  onClose,
  obstacles,
  filteredObstacleCount,
  displayObstacleCount,
  altitudeFilterMeters,
  altitudeFilterMaxMeters,
  onAltitudeFilterChange,
}) {
  return (
    <SidePanelLayout title="Filter" onClose={onClose}>
      <FilterPanel
        obstacles={obstacles}
        filteredObstacleCount={filteredObstacleCount}
        displayObstacleCount={displayObstacleCount}
        altitudeFilterMeters={altitudeFilterMeters}
        altitudeFilterMaxMeters={altitudeFilterMaxMeters}
        onAltitudeFilterChange={onAltitudeFilterChange}
      />
    </SidePanelLayout>
  );
}
