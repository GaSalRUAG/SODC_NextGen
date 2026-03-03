import React, { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./components/MapView";
import MenuBar from "./components/MenuBar";
import Sidebar from "./components/SidePanel";

// Diagramm-Klassen
import ImportController from "./controllers/importController";
import ImportService from "./services/importService";
import ObstacleStore from "./stores/obstacleStore";

function App() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Store-State für UI
  const [obstacles, setObstacles] = useState([]);

  // Refs für Komponenten (Controller braucht Zugriff)
  const mapViewRef = useRef(null);
  const sidebarRef = useRef(null);
  const importControllerRef = useRef(null);

  // Services/Store einmalig erstellen
  const importService = useMemo(() => new ImportService(), []);
  const obstacleStore = useMemo(() => new ObstacleStore(), []);

  // Store → React State synchronisieren
  useEffect(() => {
    return obstacleStore.subscribe(() => {
      setObstacles(obstacleStore.getObstacles());
    });
  }, [obstacleStore]);

  // Controller initialisieren, sobald MapView & Sidebar bereit sind
  useEffect(() => {
    if (!mapViewRef.current) return;
    if (!sidebarRef.current) return;

    importControllerRef.current = new ImportController({
      importService,
      obstacleStore,
      mapView: mapViewRef.current,
      sidePanel: sidebarRef.current,
    });
  }, [importService, obstacleStore]);

  const handleMenuClick = (menuItem) => {
    if (activeMenu === menuItem && isSidebarOpen) {
      setIsSidebarOpen(false);
      setActiveMenu(null);
    } else {
      setActiveMenu(menuItem);
      setIsSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setActiveMenu(null);
  };

  // Wird vom Sidebar (Obstacles Panel) verwendet
  const handleImportKmzFile = async (file) => {
    if (!importControllerRef.current) return;
    await importControllerRef.current.importKmzFile(file);
  };

  // Wird vom Sidebar (Clear All Obstacles) verwendet
  const handleResetObstacles = () => {
    if (!importControllerRef.current) return;
    importControllerRef.current.resetObstacles();
  };

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
        <Sidebar
          ref={sidebarRef}
          isOpen={isSidebarOpen}
          activeMenu={activeMenu}
          onClose={handleCloseSidebar}
          // NEU: Obstacles Panel braucht diese Props
          obstacles={obstacles}
          onImportKmzFile={handleImportKmzFile}
          onClearAllObstacles={handleResetObstacles}
        />

        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginLeft: isSidebarOpen ? "380px" : "0",
            transition: "margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <MapView ref={mapViewRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
