import React from "react";

const MENU_ITEMS = ["Obstacles", "Convert", "Filter", "SIRINA MAPPINGS"];

const MenuBar = ({ onMenuClick, activeMenu }) => {
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
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => onMenuClick(item)}
              style={{
                background: "none",
                border: "1px solid #e2e8f0",
                color: "black",
                fontSize: "17px",
                fontWeight: "50",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                textDecoration: "none",
                textUnderlineOffset: "4px",
              }}
              onMouseEnter={(event) => {
                if (activeMenu !== item) {
                  event.target.style.color = "#ffffff";
                }
                event.target.style.backgroundColor = "#aeb0b3";
              }}
              onMouseLeave={(event) => {
                event.target.style.color = "black";
                event.target.style.backgroundColor = "transparent";
              }}
              onMouseDown={(event) => {
                event.target.style.backgroundColor = "#000000";
              }}
              onMouseUp={(event) => {
                event.target.style.backgroundColor = "transparent";
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

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
        onMouseEnter={(event) => {
          if (activeMenu !== "Settings") {
            event.target.style.color = "#60a5fa";
          }
          event.target.style.backgroundColor = "transparent";
        }}
        onMouseLeave={(event) => {
          event.target.style.color =
            activeMenu === "Settings" ? "#60a5fa" : "black";
          event.target.style.backgroundColor = "transparent";
        }}
        onMouseDown={(event) => {
          event.target.style.backgroundColor = "#e2e8f0";
        }}
        onMouseUp={(event) => {
          event.target.style.backgroundColor = "transparent";
        }}
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
};

export default MenuBar;
