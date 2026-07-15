export default function FilterPanel({
  obstacles = [],
  filteredObstacleCount = 0,
  displayObstacleCount = 0,
  altitudeFilterMeters = 0,
  altitudeFilterMaxMeters = 0,
  onAltitudeFilterChange,
  heightFilterMeters = 0,
  heightFilterMaxMeters = 0,
  onHeightFilterChange,
  showPointObstacles = true,
  showLineObstacles = true,
  onShowPointObstaclesChange,
  onShowLineObstaclesChange,
  selectedObstacleTypes = [],
  selectedLightingStatuses = [],
  onSelectedObstacleTypesChange,
  onSelectedLightingStatusesChange,
  availableObstacleTypes = [],
  availableLightingStatuses = [],
}) {
  const hasObstacles = displayObstacleCount > 0;
  const hasAltitudeData = altitudeFilterMaxMeters > 0;
  const hasHeightData = heightFilterMaxMeters > 0;
  const altitudeSliderDisabled = !hasObstacles || !hasAltitudeData;
  const heightSliderDisabled = !hasObstacles || !hasHeightData;

  function handleAltitudeSliderChange(event) {
    onAltitudeFilterChange?.(Number(event.target.value));
  }

  function handleAltitudeInputChange(event) {
    const value = Number(event.target.value);
    if (!Number.isFinite(value) || value < 0) return;
    onAltitudeFilterChange?.(value);
  }

  function handleHeightSliderChange(event) {
    onHeightFilterChange?.(Number(event.target.value));
  }

  function handleHeightInputChange(event) {
    const value = Number(event.target.value);
    if (!Number.isFinite(value) || value < 0) return;
    onHeightFilterChange?.(value);
  }

  function toggleType(type) {
    const current = selectedObstacleTypes || [];
    if (current.includes(type)) {
      onSelectedObstacleTypesChange?.(current.filter((value) => value !== type));
    } else {
      onSelectedObstacleTypesChange?.([...current, type]);
    }
  }

  function toggleLighting(status) {
    const current = selectedLightingStatuses || [];
    if (current.includes(status)) {
      onSelectedLightingStatusesChange?.(
        current.filter((value) => value !== status),
      );
    } else {
      onSelectedLightingStatusesChange?.([...current, status]);
    }
  }

  return (
    <div className="filter-panel">
      <section className="filter-section" aria-labelledby="filter-altitude-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-altitude-title">
            Altitude
          </h3>
          <span className="filter-section__hint">AMSL · meters</span>
        </div>

        {!hasObstacles ? (
          <p className="filter-message filter-message--muted">
            Import obstacles to enable altitude filtering.
          </p>
        ) : !hasAltitudeData ? (
          <p className="filter-message filter-message--muted">
            No altitude data available in the current dataset.
          </p>
        ) : (
          <>
            <div className="filter-altitude__value">
              <span className="filter-altitude__number">
                {altitudeFilterMeters}
              </span>
              <span className="filter-altitude__unit">m</span>
            </div>

            <label className="visually-hidden" htmlFor="altitude-filter-range">
              Maximum altitude filter
            </label>
            <input
              id="altitude-filter-range"
              type="range"
              className="filter-range"
              min={0}
              max={altitudeFilterMaxMeters}
              step={1}
              value={altitudeFilterMeters}
              onChange={handleAltitudeSliderChange}
              disabled={altitudeSliderDisabled}
              aria-valuemin={0}
              aria-valuemax={altitudeFilterMaxMeters}
              aria-valuenow={altitudeFilterMeters}
              aria-valuetext={`${altitudeFilterMeters} meters`}
            />

            <div className="filter-altitude__footer">
              <span>0 m</span>
              <label className="filter-altitude__input-wrap">
                <span className="visually-hidden">Altitude maximum</span>
                <input
                  type="number"
                  className="filter-altitude__input"
                  min={0}
                  max={altitudeFilterMaxMeters}
                  value={altitudeFilterMeters}
                  onChange={handleAltitudeInputChange}
                  disabled={altitudeSliderDisabled}
                  aria-label="Altitude maximum in meters"
                />
                <span className="filter-altitude__input-suffix">m</span>
              </label>
              <span>{altitudeFilterMaxMeters} m</span>
            </div>
          </>
        )}
      </section>

      <section className="filter-section" aria-labelledby="filter-height-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-height-title">
            Height
          </h3>
          <span className="filter-section__hint">extent · meters</span>
        </div>

        {!hasObstacles ? (
          <p className="filter-message filter-message--muted">
            Import obstacles to enable height filtering.
          </p>
        ) : !hasHeightData ? (
          <p className="filter-message filter-message--muted">
            No height data available in the current dataset.
          </p>
        ) : (
          <>
            <div className="filter-altitude__value">
              <span className="filter-altitude__number">{heightFilterMeters}</span>
              <span className="filter-altitude__unit">m</span>
            </div>

            <label className="visually-hidden" htmlFor="height-filter-range">
              Maximum height filter
            </label>
            <input
              id="height-filter-range"
              type="range"
              className="filter-range"
              min={0}
              max={heightFilterMaxMeters}
              step={1}
              value={heightFilterMeters}
              onChange={handleHeightSliderChange}
              disabled={heightSliderDisabled}
            />

            <div className="filter-altitude__footer">
              <span>0 m</span>
              <label className="filter-altitude__input-wrap">
                <span className="visually-hidden">Height maximum</span>
                <input
                  type="number"
                  className="filter-altitude__input"
                  min={0}
                  max={heightFilterMaxMeters}
                  value={heightFilterMeters}
                  onChange={handleHeightInputChange}
                  disabled={heightSliderDisabled}
                  aria-label="Height maximum in meters"
                />
                <span className="filter-altitude__input-suffix">m</span>
              </label>
              <span>{heightFilterMaxMeters} m</span>
            </div>
          </>
        )}
      </section>

      <section className="filter-section" aria-labelledby="filter-geometry-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-geometry-title">
            Geometry
          </h3>
        </div>
        <div className="filter-checkbox-group">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={showPointObstacles}
              disabled={!hasObstacles}
              onChange={(event) =>
                onShowPointObstaclesChange?.(event.target.checked)
              }
            />
            <span>
              <strong>Point obstacles</strong>
              <span className="filter-checkbox__hint">Markers</span>
            </span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={showLineObstacles}
              disabled={!hasObstacles}
              onChange={(event) =>
                onShowLineObstaclesChange?.(event.target.checked)
              }
            />
            <span>
              <strong>Line obstacles</strong>
              <span className="filter-checkbox__hint">Linear extent</span>
            </span>
          </label>
        </div>
      </section>

      <section className="filter-section" aria-labelledby="filter-type-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-type-title">
            Type
          </h3>
        </div>
        {!hasObstacles ? (
          <p className="filter-message filter-message--muted">
            Import obstacles to filter by type.
          </p>
        ) : availableObstacleTypes.length === 0 ? (
          <p className="filter-message filter-message--muted">
            No type values in the current dataset.
          </p>
        ) : (
          <div className="filter-checkbox-group">
            {availableObstacleTypes.map((type) => (
              <label className="filter-checkbox" key={type}>
                <input
                  type="checkbox"
                  checked={selectedObstacleTypes.includes(type)}
                  onChange={() => toggleType(type)}
                />
                <span>
                  <strong>{type}</strong>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="filter-section" aria-labelledby="filter-lighting-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-lighting-title">
            Lighting
          </h3>
        </div>
        {!hasObstacles ? (
          <p className="filter-message filter-message--muted">
            Import obstacles to filter by lighting.
          </p>
        ) : availableLightingStatuses.length === 0 ? (
          <p className="filter-message filter-message--muted">
            No lighting values in the current dataset.
          </p>
        ) : (
          <div className="filter-checkbox-group">
            {availableLightingStatuses.map((status) => (
              <label className="filter-checkbox" key={status}>
                <input
                  type="checkbox"
                  checked={selectedLightingStatuses.includes(status)}
                  onChange={() => toggleLighting(status)}
                />
                <span>
                  <strong>{status}</strong>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section
        className={`filter-stats${!hasObstacles ? " filter-stats--empty" : ""}`}
        aria-live="polite"
      >
        {hasObstacles ? (
          <>
            <div className="filter-stats__primary">
              <span className="filter-stats__count">
                {filteredObstacleCount}
              </span>
              <span className="filter-stats__of">
                of {displayObstacleCount} obstacles visible
              </span>
            </div>
            <ul className="filter-stats__meta">
              <li>{obstacles.length} loaded</li>
              {hasAltitudeData ? (
                <li>Max altitude {altitudeFilterMaxMeters} m</li>
              ) : null}
              {hasHeightData ? (
                <li>Max height {heightFilterMaxMeters} m</li>
              ) : null}
            </ul>
          </>
        ) : (
          <p className="filter-stats__empty">No obstacles loaded.</p>
        )}
      </section>
    </div>
  );
}
