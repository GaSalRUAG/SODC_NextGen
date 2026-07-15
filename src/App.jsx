import React, { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./components/MapView";
import MenuBar from "./components/MenuBar";
import SidePanel from "./components/SidePanel";

import ImportController from "./controllers/importController";
import ImportService from "./services/importService";
import ObstacleStore from "./stores/obstacleStore";

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}

function App() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [altitudeFilterMeters, setAltitudeFilterMeters] = useState(0);
  const [heightFilterMeters, setHeightFilterMeters] = useState(0);
  const [showPointObstacles, setShowPointObstacles] = useState(true);
  const [showLineObstacles, setShowLineObstacles] = useState(true);
  const [selectedObstacleTypes, setSelectedObstacleTypes] = useState([]);
  const [selectedLightingStatuses, setSelectedLightingStatuses] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const mapViewRef = useRef(null);
  const sidePanelRef = useRef(null);
  const importControllerRef = useRef(null);
  const shouldFitMapRef = useRef(false);

  const importService = useMemo(() => new ImportService(), []);
  const obstacleStore = useMemo(() => new ObstacleStore(), []);

  useEffect(() => {
    return obstacleStore.subscribe(() => {
      setObstacles(obstacleStore.getObstacles());
    });
  }, [obstacleStore]);

  const maxObstacleAltitude = useMemo(() => {
    const altitudes = obstacles
      .filter((obstacle) => obstacle.altitudeKnown)
      .map((obstacle) => Number(obstacle.altitude))
      .filter((altitude) => Number.isFinite(altitude) && altitude >= 0);

    return altitudes.length ? Math.ceil(Math.max(...altitudes)) : 0;
  }, [obstacles]);

  const maxObstacleHeight = useMemo(() => {
    const heights = obstacles
      .filter((obstacle) => obstacle.heightKnown)
      .map((obstacle) => Number(obstacle.height))
      .filter((height) => Number.isFinite(height) && height >= 0);

    return heights.length ? Math.ceil(Math.max(...heights)) : 0;
  }, [obstacles]);

  const availableObstacleTypes = useMemo(
    () => uniqueSorted(obstacles.map((obstacle) => obstacle.obstacleType)),
    [obstacles],
  );

  const availableLightingStatuses = useMemo(
    () => uniqueSorted(obstacles.map((obstacle) => obstacle.lightingStatus)),
    [obstacles],
  );

  const effectiveAltitudeFilterMeters = useMemo(() => {
    if (maxObstacleAltitude <= 0) return 0;
    const selected = Number(altitudeFilterMeters) || 0;
    if (selected <= 0) return maxObstacleAltitude;
    return Math.min(selected, maxObstacleAltitude);
  }, [maxObstacleAltitude, altitudeFilterMeters]);

  const effectiveHeightFilterMeters = useMemo(() => {
    if (maxObstacleHeight <= 0) return 0;
    const selected = Number(heightFilterMeters) || 0;
    if (selected <= 0) return maxObstacleHeight;
    return Math.min(selected, maxObstacleHeight);
  }, [maxObstacleHeight, heightFilterMeters]);

  useEffect(() => {
    importControllerRef.current = new ImportController({
      importService,
      obstacleStore,
      getMapView: () => mapViewRef.current,
      getSidePanel: () => sidePanelRef.current,
    });
  }, [importService, obstacleStore]);

  useEffect(() => {
    if (!showToast) return;

    const timer = setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    setSelectedObstacleTypes((current) =>
      current.filter((type) => availableObstacleTypes.includes(type)),
    );
  }, [availableObstacleTypes]);

  useEffect(() => {
    setSelectedLightingStatuses((current) =>
      current.filter((status) => availableLightingStatuses.includes(status)),
    );
  }, [availableLightingStatuses]);

  const displayObstacles = useMemo(() => {
    return obstacles;
  }, [obstacles]);

  const filteredObstacles = useMemo(() => {
    return displayObstacles.filter((obstacle) => {
      const geometryType = obstacle.geometryType === "line" ? "line" : "point";
      if (geometryType === "point" && !showPointObstacles) return false;
      if (geometryType === "line" && !showLineObstacles) return false;

      if (obstacle.altitudeKnown) {
        const altitude = Number(obstacle.altitude);
        if (
          Number.isFinite(altitude) &&
          altitude > effectiveAltitudeFilterMeters
        ) {
          return false;
        }
      }

      if (obstacle.heightKnown) {
        const height = Number(obstacle.height);
        if (
          Number.isFinite(height) &&
          height > effectiveHeightFilterMeters
        ) {
          return false;
        }
      }

      if (
        selectedObstacleTypes.length > 0 &&
        !selectedObstacleTypes.includes(obstacle.obstacleType)
      ) {
        return false;
      }

      if (
        selectedLightingStatuses.length > 0 &&
        !selectedLightingStatuses.includes(obstacle.lightingStatus)
      ) {
        return false;
      }

      return true;
    });
  }, [
    displayObstacles,
    effectiveAltitudeFilterMeters,
    effectiveHeightFilterMeters,
    showPointObstacles,
    showLineObstacles,
    selectedObstacleTypes,
    selectedLightingStatuses,
  ]);

  useEffect(() => {
    const mapView = mapViewRef.current;
    if (!mapView) return;
    mapView.renderObstaclesMarkers(filteredObstacles);
    if (shouldFitMapRef.current && filteredObstacles.length > 0) {
      shouldFitMapRef.current = false;
      requestAnimationFrame(() => {
        mapView.resizeMap?.();
        mapView.fitMapToObstacles(filteredObstacles);
      });
    }
  }, [filteredObstacles]);

  useEffect(() => {
    const mapView = mapViewRef.current;
    if (!mapView) return;

    mapView.resizeMap();
    const timer = setTimeout(() => mapView.resizeMap(), 400);
    return () => clearTimeout(timer);
  }, [isSidePanelOpen]);

  function handleMenuClick(menuItem) {
    if (activeMenu === menuItem && isSidePanelOpen) {
      setIsSidePanelOpen(false);
      setActiveMenu(null);
      return;
    }

    setActiveMenu(menuItem);
    setIsSidePanelOpen(true);
  }

  function handleCloseSidePanel() {
    setIsSidePanelOpen(false);
    setActiveMenu(null);
  }

  async function handleImportKmzFile(file) {
    if (!importControllerRef.current) return;

    try {
      shouldFitMapRef.current = true;
      await importControllerRef.current.importKmzFile(file);
      setAltitudeFilterMeters(0);
      setHeightFilterMeters(0);
      setShowPointObstacles(true);
      setShowLineObstacles(true);
      setSelectedObstacleTypes([]);
      setSelectedLightingStatuses([]);
      setTimeout(() => {
        const list = obstacleStore.getObstacles();
        if (list.length) {
          mapViewRef.current?.resizeMap?.();
          mapViewRef.current?.fitMapToObstacles?.(list);
        }
      }, 400);
    } catch (error) {
      shouldFitMapRef.current = false;
      setToastMessage(error?.message || "Import failed.");
      setShowToast(true);
    }
  }

  async function handleImportAixmFile(file) {
    if (!importControllerRef.current) return;

    try {
      shouldFitMapRef.current = true;
      await importControllerRef.current.importAixmFile(file);
      setAltitudeFilterMeters(0);
      setHeightFilterMeters(0);
      setShowPointObstacles(true);
      setShowLineObstacles(true);
      setSelectedObstacleTypes([]);
      setSelectedLightingStatuses([]);
      setTimeout(() => {
        const list = obstacleStore.getObstacles();
        if (list.length) {
          mapViewRef.current?.resizeMap?.();
          mapViewRef.current?.fitMapToObstacles?.(list);
        }
      }, 400);
    } catch (error) {
      shouldFitMapRef.current = false;
      setToastMessage(error?.message || "Import failed.");
      setShowToast(true);
    }
  }

  function handleResetObstacles() {
    if (!importControllerRef.current) return;
    importControllerRef.current.resetObstacles();
    setAltitudeFilterMeters(0);
    setHeightFilterMeters(0);
    setShowPointObstacles(true);
    setShowLineObstacles(true);
    setSelectedObstacleTypes([]);
    setSelectedLightingStatuses([]);
  }

  return (
    <div className="app-shell">
      <MenuBar onMenuClick={handleMenuClick} activeMenu={activeMenu} />

      <div className="app-main">
        <SidePanel
          ref={sidePanelRef}
          isOpen={isSidePanelOpen}
          activeMenu={activeMenu}
          onClose={handleCloseSidePanel}
          obstacles={obstacles}
          onImportKmzFile={handleImportKmzFile}
          onImportAixmFile={handleImportAixmFile}
          onClearAll={handleResetObstacles}
          filteredObstacleCount={filteredObstacles.length}
          displayObstacleCount={displayObstacles.length}
          altitudeFilterMeters={effectiveAltitudeFilterMeters}
          altitudeFilterMaxMeters={maxObstacleAltitude}
          onAltitudeFilterChange={setAltitudeFilterMeters}
          heightFilterMeters={effectiveHeightFilterMeters}
          heightFilterMaxMeters={maxObstacleHeight}
          onHeightFilterChange={setHeightFilterMeters}
          showPointObstacles={showPointObstacles}
          showLineObstacles={showLineObstacles}
          onShowPointObstaclesChange={setShowPointObstacles}
          onShowLineObstaclesChange={setShowLineObstacles}
          selectedObstacleTypes={selectedObstacleTypes}
          selectedLightingStatuses={selectedLightingStatuses}
          onSelectedObstacleTypesChange={setSelectedObstacleTypes}
          onSelectedLightingStatusesChange={setSelectedLightingStatuses}
          availableObstacleTypes={availableObstacleTypes}
          availableLightingStatuses={availableLightingStatuses}
        />

        <div
          className={`app-map-host${
            isSidePanelOpen ? " app-map-host--panel-open" : ""
          }`}
        >
          <MapView ref={mapViewRef} />
        </div>

        {showToast ? (
          <div className="app-toast" role="status" aria-live="polite">
            {toastMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
