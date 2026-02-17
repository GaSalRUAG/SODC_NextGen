import React from "react";

const Sidebar = ({ isOpen, activeMenu, onClose }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (activeMenu) {
      case "Convert":
        return {
          title: "Convert",
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
                Konvertierung
              </h3>
              <p
                style={{
                  marginBottom: "24px",
                  color: "#64748b",
                  fontSize: "15px",
                }}
              >
                Konvertieren Sie Ihre Daten in verschiedene Formate.
              </p>
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#475569",
                      fontSize: "14px",
                    }}
                  >
                    Quellformat:
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "white",
                      color: "#1e293b",
                      fontSize: "14px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option>GeoJSON</option>
                    <option>KML</option>
                    <option>Shapefile</option>
                    <option>CSV</option>
                  </select>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#475569",
                      fontSize: "14px",
                    }}
                  >
                    Zielformat:
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "white",
                      color: "#1e293b",
                      fontSize: "14px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option>KML</option>
                    <option>GeoJSON</option>
                    <option>Shapefile</option>
                    <option>CSV</option>
                  </select>
                </div>
                <button
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 6px rgba(102, 126, 234, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 12px rgba(102, 126, 234, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 6px rgba(102, 126, 234, 0.25)";
                  }}
                >
                  Konvertieren
                </button>
              </div>
            </div>
          ),
        };
      case "Filter":
        return {
          title: "Filter",
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
                Datenfilter
              </h3>
              <p
                style={{
                  marginBottom: "24px",
                  color: "#64748b",
                  fontSize: "15px",
                }}
              >
                Filtern Sie Ihre Kartendaten nach verschiedenen Kriterien.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#475569",
                      fontSize: "14px",
                    }}
                  >
                    Region:
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "white",
                      color: "#1e293b",
                      fontSize: "14px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option>Alle Regionen</option>
                    <option>Zürich</option>
                    <option>Bern</option>
                    <option>Basel</option>
                    <option>Genf</option>
                    <option>Luzern</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#475569",
                      fontSize: "14px",
                    }}
                  >
                    Kategorie:
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "white",
                      color: "#1e293b",
                      fontSize: "14px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option>Alle Kategorien</option>
                    <option>Infrastruktur</option>
                    <option>Umwelt</option>
                    <option>Verkehr</option>
                  </select>
                </div>
                <button
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 6px rgba(102, 126, 234, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 12px rgba(102, 126, 234, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 6px rgba(102, 126, 234, 0.25)";
                  }}
                >
                  Filter anwenden
                </button>
              </div>
            </div>
          ),
        };
      case "SIRINA MAPPINGS":
        return {
          title: "SIRINA MAPPINGS",
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
                Datenverwaltung
              </h3>
              <p
                style={{
                  marginBottom: "24px",
                  color: "#64748b",
                  fontSize: "15px",
                }}
              >
                Verwalten und analysieren Sie Ihre Daten.
              </p>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  style={{
                    padding: "14px 20px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 6px rgba(102, 126, 234, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 12px rgba(102, 126, 234, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 6px rgba(102, 126, 234, 0.25)";
                  }}
                >
                  Daten importieren
                </button>
                <button
                  style={{
                    padding: "14px 20px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 6px rgba(16, 185, 129, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 12px rgba(16, 185, 129, 0.35)";
                    e.target.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 6px rgba(16, 185, 129, 0.25)";
                    e.target.style.backgroundColor = "#10b981";
                  }}
                >
                  Daten exportieren
                </button>
              </div>
            </div>
          ),
        };
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
        return {
          title: "",
          content: <div>Kein Inhalt verfügbar</div>,
        };
    }
  };

  const { title, content } = getContent();

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: "64px",
          width: "380px",
          height: "calc(100vh - 64px)",
          backgroundColor: "white",
          boxShadow:
            "4px 0 20px rgba(0, 0, 0, 0.12), 2px 0 8px rgba(0, 0, 0, 0.08)",
          zIndex: 1000,
          padding: "28px",
          overflowY: "auto",
          animation: "slideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header mit Schließen-Button */}
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "26px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "#64748b",
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
            title="Schließen"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ color: "#475569", lineHeight: "1.7" }}>{content}</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
