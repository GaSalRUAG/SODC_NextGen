import React from "react";

const MenuBar = ({ onMenuClick, activeMenu }) => {
  const menuItems = ["Convert", "Filter", "SIRINA MAPPINGS"];

  return (
    <div
      style={{
        height: "60px",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 1000,
        position: "relative",
      }}
    >
      {/* Links: Logo + Titel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#3b82f6",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "white",
          }}
        >
          S
        </div>
        <span
          style={{
            color: "black",
            fontSize: "20px",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          SODC Next Gen
        </span>
      </div>

      {/* Mitte: Menüpunkte */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => onMenuClick(item)}
            style={{
              background: "none",
              border: "none",
              color: activeMenu === item ? "#black" : "black",
              fontSize: "16px",
              fontWeight: activeMenu === item ? "600" : "400",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              textDecoration: activeMenu === item ? "underline" : "none",
              textUnderlineOffset: "4px",
            }}
            onMouseEnter={(e) => {
              if (activeMenu !== item) {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Rechts: Settings Icon */}
      <button
        onClick={() => onMenuClick("Settings")}
        style={{
          background: "none",
          border: "none",
          color: activeMenu === "Settings" ? "#60a5fa" : "white",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          fontSize: "20px",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
        }}
        title="Einstellungen"
      >
        ⚙️
      </button>
    </div>
  );
};

export default MenuBar;
