import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const SidePanel = forwardRef(function SidePanel(
  { isOpen, activeMenu, onClose, onImportKmzFile, onClearAll, obstacles = [] },
  ref,
) {
  const fileInputRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useImperativeHandle(ref, () => ({
    setErrorMessage(message) {
      setErrorMessage(message);
    },
    setInfoMessage(message) {
      setInfoMessage(message);
    },
  }));

  if (!isOpen) return null;

  function openFilePicker() {
    setErrorMessage("");
    setInfoMessage("");
    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setErrorMessage("");
      setInfoMessage("Import läuft...");

      await onImportKmzFile(file);
    } catch (error) {
      setInfoMessage("");
      setErrorMessage(error?.message || "Invalid KMZ");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  function renderObstaclesPanel() {
    const hasObstacles = Array.isArray(obstacles) && obstacles.length > 0;

    return (
      <div>
        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".kmz"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Import Button */}
        <button
          onClick={openFilePicker}
          disabled={isImporting}
          style={{
            width: "100%",
            backgroundColor: "#ACDC92",
            border: "1px solid #e2e8f0",
            color: "black",
            fontSize: "15px",
            fontWeight: "50",
            cursor: isImporting ? "not-allowed" : "pointer",
            padding: "10px 12px",
            borderRadius: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!isImporting) {
              e.target.style.color = "#ffffff";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "black";
          }}
        >
          <img
            src="./IMG/ImportIcon.png"
            alt="Import"
            style={{
              width: "20px",
              height: "20px",
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          {isImporting ? "Import läuft..." : "Import KMZ File"}
        </button>

        {/* Status */}
        {errorMessage ? (
          <div style={{ marginTop: "14px" }}>{errorMessage}</div>
        ) : null}

        {!errorMessage && hasObstacles ? (
          <div style={{ marginTop: "14px" }}>
            {obstacles.length} obstacles displayed
          </div>
        ) : null}

        {!errorMessage && !hasObstacles && infoMessage ? (
          <div style={{ marginTop: "14px" }}>{infoMessage}</div>
        ) : null}

        <div
          style={{
            marginTop: "10px",
            marginBottom: "10px",
            borderBottom: "2px solid #e2e8f0",
          }}
        />

        {/* Liste */}
        <div
          style={{
            marginTop: "14px",
            maxHeight: "55vh",
            overflowY: "auto",
          }}
        >
          {hasObstacles ? (
            obstacles.map((o, index) => (
              <div
                key={o.id || `obstacle-${index}`}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "13px" }}>
                  <div>
                    <b>LON:</b> {o.longitude}
                  </div>
                  <div>
                    <b>LAT:</b> {o.latitude}
                  </div>
                  {o.altitude !== null && o.altitude !== undefined ? (
                    <div>
                      <b>ALT:</b> {o.altitude}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              No File imported
            </div>
          )}
        </div>

        {/* Clear Button */}
        <button
          onClick={onClearAll}
          hidden={!hasObstacles}
          style={{
            width: "100%",
            marginTop: "14px",
            backgroundColor: "#F5293D",
            border: "1px solid #e2e8f0",
            color: "white",
            fontSize: "15px",
            fontWeight: "50",
            cursor: hasObstacles ? "pointer" : "not-allowed",
            padding: "10px 12px",
            borderRadius: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (hasObstacles) {
              e.target.style.color = "#000000";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "white";
          }}
        >
          <img
            src="./IMG/RemoveIcon.png"
            alt="Clear"
            style={{
              width: "20px",
              height: "20px",
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          Clear All Obstacles
        </button>
      </div>
    );
  }

  function getContent() {
    switch (activeMenu) {
      case "Obstacles":
        return { title: "Obstacles", content: renderObstaclesPanel() };

      case "Convert":
        return { title: "Convert", content: <p>content</p> };

      case "Filter":
        return {
          title: "Filter",
          content: (
            <div>
              <p>Filter</p>
            </div>
          ),
        };

      case "SIRINA MAPPINGS":
        return { title: "SIRINA MAPPINGS", content: <p>SIRINA MAPPINGS</p> };

      case "Settings":
        return {
          title: "Settings",
          content: (
            <div>
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  color: "#1e293b",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                Settings
              </h3>
            </div>
          ),
        };

      default:
        return { title: "", content: <div>No content available</div> };
    }
  }

  const { title, content } = getContent();

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: "70px",
          width: "380px",
          height: "calc(100vh - 70px)",
          backgroundColor: "white",
          boxShadow:
            "4px 0 20px rgba(0, 0, 0, 0.12), 2px 0 8px rgba(0, 0, 0, 0.08)",
          zIndex: 1000,
          padding: "28px",
          overflowY: "auto",
          animation: "slideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
            paddingBottom: "20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              margin: 0,
              background: "#0a0a0a",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "24px",
              fontWeight: "700",
              fontFamily: "Gill Sans, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontSize: "22px",
              cursor: "pointer",
              color: "#0b0c0c",
              padding: "6px 10px",
              borderRadius: "8px",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: "1",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e2e8f0";
              e.target.style.color = "#475569";
              e.target.style.transform = "rotate(90deg) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f1f5f9";
              e.target.style.color = "#64748b";
              e.target.style.transform = "rotate(0deg) scale(1)";
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ color: "#475569", lineHeight: "1.7" }}>{content}</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
});

export default SidePanel;
