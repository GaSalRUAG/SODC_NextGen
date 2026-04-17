import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const MIN_CLUSTER_COUNT = 30;
const MAP_STYLE_ID = "map-obstacle-marker-styles";
const SWISSTOPO_TILE_URL =
  "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";

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

const MapView = forwardRef(function MapView(_, ref) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const [obstacles, setObstacles] = useState([]);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [viewport, setViewport] = useState(null);

  useEffect(() => {
    if (document.getElementById(MAP_STYLE_ID)) return;

    const styleTag = document.createElement("style");
    styleTag.id = MAP_STYLE_ID;
    styleTag.textContent = `
      .obstacle-marker {
        width: var(--marker-size);
        height: var(--marker-size);
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
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
      .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-bottom-left {
        display: none;
      }
    `;

    document.head.appendChild(styleTag);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      center: [MAP_CENTER[1], MAP_CENTER[0]],
      zoom: INITIAL_ZOOM,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          swisstopo: {
            type: "raster",
            tiles: [SWISSTOPO_TILE_URL],
            tileSize: 256,
            attribution:
              '<a href="https://www.swisstopo.admin.ch" target="_blank" rel="noreferrer">swisstopo</a>',
          },
        },
        layers: [{ id: "swisstopo-layer", type: "raster", source: "swisstopo" }],
      },
    });

    mapRef.current = map;

    const updateViewState = () => {
      setZoom(map.getZoom());
      setViewport(createViewportBounds(map.getBounds()));
    };

    map.on("load", updateViewState);
    map.on("moveend", updateViewState);
    map.on("zoomend", updateViewState);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextIds = new Set();
    for (let index = 0; index < markersToRender.length; index += 1) {
      const obstacle = markersToRender[index];
      const markerId = String(obstacle.id);
      nextIds.add(markerId);

      const isCluster = obstacle.count > 1;
      const clusterStyle = isCluster
        ? getClusterVisualStyle(obstacle.count)
        : { size: 10, color: "#ef4444", ring: "#7f1d1d" };

      const existing = markersRef.current.get(markerId);
      if (existing) {
        existing.setLngLat([obstacle.longitude, obstacle.latitude]);
        continue;
      }

      const element = document.createElement("div");
      element.className = `obstacle-marker ${isCluster ? "obstacle-marker--cluster" : "obstacle-marker--single"}`;
      element.style.setProperty("--marker-size", `${clusterStyle.size}px`);
      element.style.setProperty("--marker-color", clusterStyle.color);
      element.style.setProperty("--marker-ring", clusterStyle.ring);
      if (isCluster) {
        element.textContent = getClusterLabel(obstacle.count);
      }

      const marker = new maplibregl.Marker({
        element,
        anchor: "center",
      })
        .setLngLat([obstacle.longitude, obstacle.latitude])
        .addTo(map);

      markersRef.current.set(markerId, marker);
    }

    markersRef.current.forEach((marker, markerId) => {
      if (nextIds.has(markerId)) return;
      marker.remove();
      markersRef.current.delete(markerId);
    });
  }, [markersToRender]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
});

export default MapView;
