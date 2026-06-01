import React, { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./components/MapView";
import MenuBar from "./components/MenuBar";
import SidePanel from "./components/SidePanel";

import ImportController from "./controllers/importController";
import ImportService from "./services/importService";
import ObstacleStore from "./stores/obstacleStore";
import { applyLineMerge } from "./utils/obstacleMerge";

function App() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [altitudeFilterMeters, setAltitudeFilterMeters] = useState(0);
  const [showPointObstacles, setShowPointObstacles] = useState(true);
  const [showLineObstacles, setShowLineObstacles] = useState(true);
  const [mergeLineSegments, setMergeLineSegments] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const mapViewRef = useRef(null);
  const sidePanelRef = useRef(null);
  const importControllerRef = useRef(null);

  const importService = useMemo(() => new ImportService(), []);
  const obstacleStore = useMemo(() => new ObstacleStore(), []);

  useEffect(() => {
    return obstacleStore.subscribe(() => {
      setObstacles(obstacleStore.getObstacles());
    });
  }, [obstacleStore]);

  const maxObstacleAltitude = useMemo(() => {
    const altitudes = obstacles
      .filter((obstacle) => obstacle.heightKnown)
      .map((obstacle) => Number(obstacle.altitude))
      .filter((altitude) => Number.isFinite(altitude) && altitude >= 0);

    return altitudes.length ? Math.ceil(Math.max(...altitudes)) : 0;
  }, [obstacles]);

  const effectiveAltitudeFilterMeters = useMemo(() => {
    if (maxObstacleAltitude <= 0) return 0;
    const selected = Number(altitudeFilterMeters) || 0;
    if (selected <= 0) return maxObstacleAltitude;
    return Math.min(selected, maxObstacleAltitude);
  }, [maxObstacleAltitude, altitudeFilterMeters]);

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

  const obstacleStats = useMemo(() => {
    const pointCount = obstacles.filter(
      (obstacle) => obstacle.geometryType === "point",
    ).length;
    const lineCount = obstacles.filter(
      (obstacle) => obstacle.geometryType === "line" && !obstacle.merged,
    ).length;
    const unknownHeightCount = obstacles.filter(
      (obstacle) => !obstacle.heightKnown,
    ).length;

    return { pointCount, lineCount, unknownHeightCount };
  }, [obstacles]);

  const displayObstacles = useMemo(() => {
    return applyLineMerge(obstacles, mergeLineSegments);
  }, [obstacles, mergeLineSegments]);

  const filteredObstacles = useMemo(() => {
    return displayObstacles.filter((obstacle) => {
      if (obstacle.geometryType === "point" && !showPointObstacles) {
        return false;
      }
      if (obstacle.geometryType === "line" && !showLineObstacles) {
        return false;
      }

      if (!obstacle.heightKnown) {
        return true;
      }

      const altitude = Number(obstacle.altitude);
      if (!Number.isFinite(altitude)) {
        return true;
      }

      return altitude <= effectiveAltitudeFilterMeters;
    });
  }, [
    displayObstacles,
    showPointObstacles,
    showLineObstacles,
    effectiveAltitudeFilterMeters,
  ]);

  useEffect(() => {
    const mapView = mapViewRef.current;
    if (!mapView) return;
    mapView.renderObstaclesMarkers(filteredObstacles);
  }, [filteredObstacles]);

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
      await importControllerRef.current.importKmzFile(file);
    } catch (error) {
      setToastMessage(error?.message || "Import failed.");
      setShowToast(true);
    }
  }

  async function handleImportAixmFile(file) {
    if (!importControllerRef.current) return;

    try {
      await importControllerRef.current.importAixmFile(file);
    } catch (error) {
      setToastMessage(error?.message || "Import failed.");
      setShowToast(true);
    }
  }

  function handleResetObstacles() {
    if (!importControllerRef.current) return;
    importControllerRef.current.resetObstacles();
    setShowPointObstacles(true);
    setShowLineObstacles(true);
    setMergeLineSegments(false);
    setAltitudeFilterMeters(0);
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#f8fafc",
        border: "none",
      }}
    >
      <MenuBar onMenuClick={handleMenuClick} activeMenu={activeMenu} />

      <div
        style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}
      >
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
          showPointObstacles={showPointObstacles}
          showLineObstacles={showLineObstacles}
          mergeLineSegments={mergeLineSegments}
          onShowPointObstaclesChange={setShowPointObstacles}
          onShowLineObstaclesChange={setShowLineObstacles}
          onMergeLineSegmentsChange={setMergeLineSegments}
          pointCount={obstacleStats.pointCount}
          lineCount={obstacleStats.lineCount}
          unknownHeightCount={obstacleStats.unknownHeightCount}
        />

        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginLeft: isSidePanelOpen ? "380px" : "0",
            transition: "margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <MapView ref={mapViewRef} />
        </div>

        {showToast ? (
          <div
            style={{
              position: "fixed",
              top: "85px",
              right: "20px",
              backgroundColor: "#F5293D",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.18)",
              zIndex: 2000,
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {toastMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;


