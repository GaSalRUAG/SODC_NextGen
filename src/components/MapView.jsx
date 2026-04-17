import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ICON_CACHE = new Map();
const MIN_CLUSTER_COUNT = 30;
const MAP_MARKER_STYLE_ID = "map-obstacle-marker-styles";

function getGridMultiplierByCount(count) {
  if (count >= 7000) return 3.2;
  if (count >= 3500) return 2.6;
  if (count >= 1500) return 2;
  if (count >= 500) return 1.45;
  return 1;
}

function getGridSizeByZoom(zoom) {
  if (zoom >= 13) return 0;
  if (zoom >= 12) return 0.01;
  if (zoom >= 10) return 0.02;
  if (zoom >= 8) return 0.05;
  return 0.09;
}

function isInsideViewport(obstacle, viewport) {
  const latitude = Number(obstacle.latitude);
  const longitude = Number(obstacle.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;

  return (
    latitude >= viewport.south &&
    latitude <= viewport.north &&
    longitude >= viewport.west &&
    longitude <= viewport.east
  );
}

function normalizeObstacle(obstacle) {
  const latitude = Number(obstacle.latitude);
  const longitude = Number(obstacle.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id: obstacle.id,
    latitude,
    longitude,
    count: 1,
  };
}

function createViewportBounds(bounds) {
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();
  const latPadding = (north - south) * 0.25;
  const lonPadding = (east - west) * 0.25;

  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lonPadding,
    west: west - lonPadding,
  };
}

function getClusterVisualStyle(count) {
  if (count >= 80) return { size: 40, color: "#dc2626", ring: "#7f1d1d" };
  return { size: 32, color: "#16a34a", ring: "#166534" };
}

function getClusterLabel(count) {
  if (count >= 999) return "999+";
  if (count >= 100) return "99+";
  return String(count);
}

function getObstacleIcon(count = 1) {
  const isCluster = count > 1;
  const clusterStyle = isCluster
    ? getClusterVisualStyle(count)
    : { size: 10, color: "#ef4444", ring: "#7f1d1d" };
  const label = isCluster ? getClusterLabel(count) : "";
  const key = `${clusterStyle.size}-${clusterStyle.color}-${clusterStyle.ring}-${label || "single"}`;
  if (ICON_CACHE.has(key)) return ICON_CACHE.get(key);

  const html = isCluster
    ? `<div class="obstacle-marker obstacle-marker--cluster" style="--marker-size:${clusterStyle.size}px;--marker-color:${clusterStyle.color};--marker-ring:${clusterStyle.ring};">${label}</div>`
    : `<div class="obstacle-marker obstacle-marker--single" style="--marker-size:${clusterStyle.size}px;--marker-color:${clusterStyle.color};--marker-ring:${clusterStyle.ring};"></div>`;

  const icon = L.divIcon({
    className: "obstacle-marker-icon",
    html,
    iconSize: [clusterStyle.size, clusterStyle.size],
    iconAnchor: [clusterStyle.size / 2, clusterStyle.size / 2],
  });
  ICON_CACHE.set(key, icon);
  return icon;
}

function ZoomTracker({ onZoomChange }) {
  const map = useMapEvents({
    moveend(event) {
      onZoomChange(event.target.getZoom(), event.target.getBounds());
    },
    zoomend(event) {
      onZoomChange(event.target.getZoom(), event.target.getBounds());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom(), map.getBounds());
  }, [map, onZoomChange]);

  return null;
}

const MapView = forwardRef(function MapView(_, ref) {
  const [obstacles, setObstacles] = useState([]);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [viewport, setViewport] = useState(null);

  const handleViewportChange = useCallback((nextZoom, bounds) => {
    setZoom(nextZoom);
    setViewport(createViewportBounds(bounds));
  }, []);

  useEffect(() => {
    if (document.getElementById(MAP_MARKER_STYLE_ID)) return;

    const styleTag = document.createElement("style");
    styleTag.id = MAP_MARKER_STYLE_ID;
    styleTag.textContent = `
      .obstacle-marker-icon {
        background: transparent;
        border: none;
      }
      .obstacle-marker {
        width: var(--marker-size);
        height: var(--marker-size);
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        transform: translateZ(0);
      }
      .obstacle-marker--cluster {
        background: var(--marker-color);
        border: 2px solid var(--marker-ring);
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
      }
      .obstacle-marker--single {
        background: var(--marker-color);
        border: 1px solid var(--marker-ring);
        border-radius: 2px;
      }
    `;

    document.head.appendChild(styleTag);
  }, []);

  useImperativeHandle(ref, () => ({
    renderObstaclesMarkers(obstaclesList) {
      setObstacles(obstaclesList);
    },
    clearObstacleMarkers() {
      setObstacles([]);
    },
  }));

  const markersToRender = useMemo(() => {
    if (!obstacles.length) return [];
    const filteredObstacles = viewport
      ? obstacles.filter((item) => isInsideViewport(item, viewport))
      : obstacles;
    // Safety fallback: never hide all markers because of viewport mismatch.
    const obstaclesInScope = filteredObstacles.length ? filteredObstacles : obstacles;
    const normalizedObstacles = obstaclesInScope
      .map((item) => normalizeObstacle(item))
      .filter(Boolean);
    if (!normalizedObstacles.length) return [];

    // At near zoom levels, render real obstacle coordinates only.
    if (zoom >= 13) {
      return normalizedObstacles;
    }

    if (normalizedObstacles.length < MIN_CLUSTER_COUNT) {
      return normalizedObstacles;
    }

    const gridSize = getGridSizeByZoom(zoom) * getGridMultiplierByCount(normalizedObstacles.length);

    // At high zoom we render single points.
    if (gridSize === 0) {
      return normalizedObstacles;
    }

    const cells = new Map();
    for (let index = 0; index < normalizedObstacles.length; index += 1) {
      const obstacle = normalizedObstacles[index];
      const latCell = Math.floor(obstacle.latitude / gridSize);
      const lonCell = Math.floor(obstacle.longitude / gridSize);
      const key = `${latCell}:${lonCell}`;
      const current = cells.get(key);

      if (!current) {
        cells.set(key, {
          id: key,
          latitudeSum: obstacle.latitude,
          longitudeSum: obstacle.longitude,
          count: 1,
          members: [obstacle],
        });
      } else {
        current.latitudeSum += obstacle.latitude;
        current.longitudeSum += obstacle.longitude;
        current.count += 1;
        current.members.push(obstacle);
      }
    }

    const clustered = [];
    cells.forEach((cell) => {
      if (cell.count < MIN_CLUSTER_COUNT) {
        for (let index = 0; index < cell.members.length; index += 1) {
          const member = cell.members[index];
          clustered.push({
            id: member.id,
            latitude: member.latitude,
            longitude: member.longitude,
            count: 1,
          });
        }
        return;
      }

      clustered.push({
        id: cell.id,
        latitude: cell.latitudeSum / cell.count,
        longitude: cell.longitudeSum / cell.count,
        count: cell.count,
      });
    });
    return clustered;
  }, [obstacles, zoom, viewport]);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={5}
      maxZoom={18}
      zoomControl={false}
      markerZoomAnimation={false}
      style={{ width: "100%", height: "100%" }}
    >
      <ZoomTracker onZoomChange={handleViewportChange} />
      <TileLayer url={TILE_URL} />

      {markersToRender.map((obstacle) => (
        <Marker
          key={obstacle.id}
          position={[obstacle.latitude, obstacle.longitude]}
          icon={getObstacleIcon(obstacle.count)}
        />
      ))}
    </MapContainer>
  );
});

export default MapView;
