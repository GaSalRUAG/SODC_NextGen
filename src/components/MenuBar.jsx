import React from "react";

const MenuBar = ({ onMenuClick, activeMenu }) => {
  const menuItems = ["Obstacles", "Convert", "Filter", "SIRINA MAPPINGS"];

  return (
    <div
      style={{
        height: "65px",
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
      {/* Left: Logo  | + Menu Items */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div>
          <img
            src="./IMG/Swiss_ICON.webp"
            alt="SODC Logo"
            width="45"
            height="45"
            style={{ borderRadius: "8px" }}
          />
        </div>

        <span
          style={{
            color: "black",
            fontSize: "20px",
            fontWeight: "600",
            fontFamily: "Gill Sans, sans-serif",
          }}
        >
          SODC Next Gen
        </span>

        <span
          style={{
            color: "black",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          |
        </span>

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
                border: "1px solid #e2e8f0",
                color: activeMenu === item ? "black" : "black",
                fontSize: "17px",
                fontWeight: "50",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                textDecoration: activeMenu === item ? "none" : "none",
                textUnderlineOffset: "4px",
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== item) {
                  e.target.style.color = "#ffffff";
                }
                e.target.style.backgroundColor = "#aeb0b3";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "black";
                e.target.style.backgroundColor = "transparent";
              }}
              onMouseDown={(e) => {
                e.target.style.backgroundColor = "#000000";
              }}
              onMouseUp={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Settings */}
      <button
        onClick={() => onMenuClick("Settings")}
        style={{
          background: "none",
          border: "1px solid #e2e8f0",
          color: activeMenu === "Settings" ? "#60a5fa" : "black",
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
          if (activeMenu !== "Settings") {
            e.target.style.color = "#60a5fa";
          }
          e.target.style.backgroundColor = "transparent";
        }}
        onMouseLeave={(e) => {
          e.target.style.color =
            activeMenu === "Settings" ? "#60a5fa" : "black";
          e.target.style.backgroundColor = "transparent";
        }}
        onMouseDown={(e) => {
          e.target.style.backgroundColor = "#e2e8f0";
        }}
        onMouseUp={(e) => {
          e.target.style.backgroundColor = "transparent";
        }}
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
};

export default MenuBar;
