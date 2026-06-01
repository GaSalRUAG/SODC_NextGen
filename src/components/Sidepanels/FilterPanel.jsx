import React from "react";

const FONT =
  '"Gill Sans", "Segoe UI", system-ui, -apple-system, sans-serif';

function FilterSection({ title, hint, children }) {
  return (
    <section className="filter-section">
      <div className="filter-section__header">
        <h3 className="filter-section__title">{title}</h3>
        {hint ? <span className="filter-section__hint">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function FilterCheckbox({ id, label, checked, onChange, disabled = false }) {
  return (
    <label
      htmlFor={id}
      className={`filter-checkbox${disabled ? " filter-checkbox--disabled" : ""}`}
    >
      <input
        id={id}
        type="checkbox"
        className="filter-checkbox__input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="filter-checkbox__box" aria-hidden="true" />
      <span className="filter-checkbox__label">{label}</span>
    </label>
  );
}

export default function FilterPanel({
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
}) {
  const obstacleCount = Array.isArray(obstacles) ? obstacles.length : 0;
  const hasObstacleData = obstacleCount > 0;
  const maxMeters = Math.max(0, Number(altitudeFilterMaxMeters) || 0);
  const selectedMeters = Math.max(
    0,
    Math.min(maxMeters, Number(altitudeFilterMeters) || 0),
  );
  const sliderDisabled = !hasObstacleData || maxMeters <= 0;
  const displayCount = displayObstacleCount || obstacleCount;

  function handleMetersChange(nextValue) {
    const meters = Number(nextValue);
    if (!Number.isFinite(meters)) return;
    const clampedMeters = Math.max(0, Math.min(maxMeters, meters));
    onAltitudeFilterChange?.(clampedMeters);
  }

  return (
    <div className="filter-panel" style={{ fontFamily: FONT }}>
      <FilterSection
        title="Höhe"
        hint={maxMeters > 0 ? `0 – ${maxMeters} m` : null}
      >
        {sliderDisabled && hasObstacleData ? (
          <p className="filter-message filter-message--muted">
            Keine Höhenangaben in den Daten.
          </p>
        ) : null}

        <div className="filter-altitude">
          <div className="filter-altitude__value">
            <span className="filter-altitude__number">{selectedMeters}</span>
            <span className="filter-altitude__unit">m</span>
          </div>

          <input
            type="range"
            className="filter-range"
            min={0}
            max={maxMeters}
            step={1}
            value={selectedMeters}
            disabled={sliderDisabled}
            onChange={(event) => handleMetersChange(event.target.value)}
            aria-label="Mindesthöhe in Metern"
          />

          <div className="filter-altitude__footer">
            <span>0 m</span>
            <label className="filter-altitude__input-wrap">
              <span className="visually-hidden">Höhe in Metern</span>
              <input
                type="number"
                className="filter-altitude__input"
                min={0}
                max={maxMeters}
                step={1}
                value={selectedMeters}
                disabled={sliderDisabled}
                onChange={(event) => handleMetersChange(event.target.value)}
              />
              <span className="filter-altitude__input-suffix">m</span>
            </label>
            <span>{maxMeters} m</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Geometrie">
        <div className="filter-checkbox-group">
          <FilterCheckbox
            id="filter-show-points"
            label="Punkte anzeigen"
            checked={showPointObstacles}
            disabled={!hasObstacleData}
            onChange={(value) => onShowPointObstaclesChange?.(value)}
          />
          <FilterCheckbox
            id="filter-show-lines"
            label="Linien anzeigen"
            checked={showLineObstacles}
            disabled={!hasObstacleData}
            onChange={(value) => onShowLineObstaclesChange?.(value)}
          />
          {lineCount > 0 ? (
            <FilterCheckbox
              id="filter-merge-lines"
              label="Segmente zu durchgehenden Linien zusammenführen"
              checked={mergeLineSegments}
              disabled={!hasObstacleData}
              onChange={(value) => onMergeLineSegmentsChange?.(value)}
            />
          ) : null}
        </div>
      </FilterSection>

      <div
        className={`filter-stats${hasObstacleData ? "" : " filter-stats--empty"}`}
      >
        {hasObstacleData ? (
          <>
            <div className="filter-stats__primary">
              <span className="filter-stats__count">{filteredObstacleCount}</span>
              <span className="filter-stats__of">von {displayCount} sichtbar</span>
            </div>
            <ul className="filter-stats__meta">
              {unknownHeightCount > 0 ? (
                <li>{unknownHeightCount} ohne Höhe</li>
              ) : null}
              <li>
                {pointCount} Punkt{pointCount === 1 ? "" : "e"}
              </li>
              <li>
                {lineCount} Linien-Segment{lineCount === 1 ? "" : "e"}
                {mergeLineSegments ? " (zusammengeführt)" : ""}
              </li>
            </ul>
          </>
        ) : (
          <p className="filter-stats__empty">Keine Hindernisse vorhanden</p>
        )}
      </div>
    </div>
  );
}
