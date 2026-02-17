import React, { useState } from "react";
import MapView from "./components/MapView";
import MenuBar from "./components/MenuBar";
import Sidebar from "./components/Sidebar";

function App() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = (menuItem) => {
    if (activeMenu === menuItem && isSidebarOpen) {
      //wenn scho offe isch, schlüsse
      setIsSidebarOpen(false);
      setActiveMenu(null);
    } else {
      //neus menu öffne
      setActiveMenu(menuItem);
      setIsSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setActiveMenu(null);
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
      }}
    >
      {/* Menüleiste */}
      <MenuBar onMenuClick={handleMenuClick} activeMenu={activeMenu} />

      {/* Hauptinhalt mit Map */}
      <div
        style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}
      >
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          activeMenu={activeMenu}
          onClose={handleCloseSidebar}
        />

        {/* Map View */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginLeft: isSidebarOpen ? "380px" : "0",
            transition: "margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <MapView />
        </div>
      </div>
    </div>
  );
}

export default App;
