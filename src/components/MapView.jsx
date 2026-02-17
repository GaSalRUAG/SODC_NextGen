import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const kMapCenter = [46.8182, 8.2275];
const kInitialZoom = 9.2;
const kTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function MapView() {
  const mMapRef = useRef(null);

  return (
    <MapContainer
      center={kMapCenter}
      zoom={kInitialZoom}
      minZoom={5}
      maxZoom={18}
      scrollWheelZoom={true}
      zoomControl={false}
      ref={mMapRef}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer url={kTileUrl} />
    </MapContainer>
  );
}

export default MapView;
