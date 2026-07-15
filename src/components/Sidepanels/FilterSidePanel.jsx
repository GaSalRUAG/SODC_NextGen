import SidePanelLayout from "./SidePanelLayout";
import FilterPanel from "./FilterPanel";

export default function FilterSidePanel({
  onClose,
  obstacles,
  filteredObstacleCount,
  displayObstacleCount,
  altitudeFilterMeters,
  altitudeFilterMaxMeters,
  onAltitudeFilterChange,
  heightFilterMeters,
  heightFilterMaxMeters,
  onHeightFilterChange,
  showPointObstacles,
  showLineObstacles,
  onShowPointObstaclesChange,
  onShowLineObstaclesChange,
  selectedObstacleTypes,
  selectedLightingStatuses,
  onSelectedObstacleTypesChange,
  onSelectedLightingStatusesChange,
  availableObstacleTypes,
  availableLightingStatuses,
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
        heightFilterMeters={heightFilterMeters}
        heightFilterMaxMeters={heightFilterMaxMeters}
        onHeightFilterChange={onHeightFilterChange}
        showPointObstacles={showPointObstacles}
        showLineObstacles={showLineObstacles}
        onShowPointObstaclesChange={onShowPointObstaclesChange}
        onShowLineObstaclesChange={onShowLineObstaclesChange}
        selectedObstacleTypes={selectedObstacleTypes}
        selectedLightingStatuses={selectedLightingStatuses}
        onSelectedObstacleTypesChange={onSelectedObstacleTypesChange}
        onSelectedLightingStatusesChange={onSelectedLightingStatusesChange}
        availableObstacleTypes={availableObstacleTypes}
        availableLightingStatuses={availableLightingStatuses}
      />
    </SidePanelLayout>
  );
}
