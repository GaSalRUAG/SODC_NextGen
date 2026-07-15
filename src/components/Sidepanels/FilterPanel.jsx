function FilterToggle({
  checked,
  disabled = false,
  onChange,
  label,
  hint,
  inputId,
}) {
  return (
    <label
      className={`filter-toggle${checked ? " filter-toggle--checked" : ""}${
        disabled ? " filter-toggle--disabled" : ""
      }`}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        className="visually-hidden"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="filter-toggle__box" aria-hidden="true" />
      <span>
        <span className="filter-toggle__label">{label}</span>
        {hint ? <span className="filter-toggle__hint">{hint}</span> : null}
      </span>
    </label>
  );
}

function RangeFilter({
  titleId,
  title,
  hint,
  hasObstacles,
  hasData,
  emptyImportMessage,
  emptyDataMessage,
  value,
  max,
  disabled,
  rangeId,
  onSliderChange,
  onInputChange,
  inputAriaLabel,
}) {
  return (
    <section className="filter-section" aria-labelledby={titleId}>
      <div className="filter-section__header">
        <h3 className="filter-section__title" id={titleId}>
          {title}
        </h3>
        <span className="filter-section__hint">{hint}</span>
      </div>

      {!hasObstacles ? (
        <p className="filter-message filter-message--muted">{emptyImportMessage}</p>
      ) : !hasData ? (
        <p className="filter-message filter-message--muted">{emptyDataMessage}</p>
      ) : (
        <>
          <div className="filter-metric">
            <span className="filter-metric__value">{value}</span>
            <span className="filter-metric__unit">m</span>
          </div>

          <label className="visually-hidden" htmlFor={rangeId}>
            {inputAriaLabel}
          </label>
          <input
            id={rangeId}
            type="range"
            className="filter-range"
            min={0}
            max={max}
            step={1}
            value={value}
            onChange={onSliderChange}
            disabled={disabled}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={`${value} meters`}
          />

          <div className="filter-range-footer">
            <span>0 m</span>
            <div className="filter-input-wrap">
              <input
                type="number"
                className="filter-input"
                min={0}
                max={max}
                value={value}
                onChange={onInputChange}
                disabled={disabled}
                aria-label={inputAriaLabel}
              />
              <span className="filter-input-suffix">m</span>
            </div>
            <span>{max} m</span>
          </div>
        </>
      )}
    </section>
  );
}

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
      <p className="filter-panel__intro">
        Narrow map obstacles by altitude, height, geometry, type, and lighting.
        Leave type/lighting unchecked to show all values.
      </p>

      <RangeFilter
        titleId="filter-altitude-title"
        title="Altitude"
        hint="AMSL · meters"
        hasObstacles={hasObstacles}
        hasData={hasAltitudeData}
        emptyImportMessage="Import obstacles to enable altitude filtering."
        emptyDataMessage="No altitude data available in the current dataset."
        value={altitudeFilterMeters}
        max={altitudeFilterMaxMeters}
        disabled={altitudeSliderDisabled}
        rangeId="altitude-filter-range"
        onSliderChange={handleAltitudeSliderChange}
        onInputChange={handleAltitudeInputChange}
        inputAriaLabel="Maximum altitude in meters"
      />

      <RangeFilter
        titleId="filter-height-title"
        title="Height"
        hint="extent · meters"
        hasObstacles={hasObstacles}
        hasData={hasHeightData}
        emptyImportMessage="Import obstacles to enable height filtering."
        emptyDataMessage="No height data available in the current dataset."
        value={heightFilterMeters}
        max={heightFilterMaxMeters}
        disabled={heightSliderDisabled}
        rangeId="height-filter-range"
        onSliderChange={handleHeightSliderChange}
        onInputChange={handleHeightInputChange}
        inputAriaLabel="Maximum height in meters"
      />

      <section className="filter-section" aria-labelledby="filter-geometry-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-geometry-title">
            Geometry
          </h3>
        </div>
        <div className="filter-toggle-list">
          <FilterToggle
            inputId="filter-show-points"
            checked={showPointObstacles}
            disabled={!hasObstacles}
            onChange={onShowPointObstaclesChange}
            label="Point obstacles"
            hint="Map markers"
          />
          <FilterToggle
            inputId="filter-show-lines"
            checked={showLineObstacles}
            disabled={!hasObstacles}
            onChange={onShowLineObstaclesChange}
            label="Line obstacles"
            hint="Linear extent"
          />
        </div>
        <div className="filter-legend" aria-hidden="true">
          <span className="filter-legend__item">
            <span className="filter-legend__swatch filter-legend__swatch--point" />
            Point
          </span>
          <span className="filter-legend__item">
            <span className="filter-legend__swatch filter-legend__swatch--line" />
            Line
          </span>
        </div>
      </section>

      <section className="filter-section" aria-labelledby="filter-type-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-type-title">
            Type
          </h3>
          <span className="filter-section__hint">optional</span>
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
          <div className="filter-chip-group" role="group" aria-label="Obstacle types">
            {availableObstacleTypes.map((type) => {
              const active = selectedObstacleTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={`filter-chip${active ? " filter-chip--active" : ""}`}
                  aria-pressed={active}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="filter-section" aria-labelledby="filter-lighting-title">
        <div className="filter-section__header">
          <h3 className="filter-section__title" id="filter-lighting-title">
            Lighting
          </h3>
          <span className="filter-section__hint">optional</span>
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
          <div
            className="filter-chip-group"
            role="group"
            aria-label="Lighting status"
          >
            {availableLightingStatuses.map((status) => {
              const active = selectedLightingStatuses.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  className={`filter-chip${active ? " filter-chip--active" : ""}`}
                  aria-pressed={active}
                  onClick={() => toggleLighting(status)}
                >
                  {status}
                </button>
              );
            })}
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
              <span className="filter-stats__count">{filteredObstacleCount}</span>
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
