import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const MAP_STYLE_ID = "map-obstacle-map-styles";
const OBSTACLES_SOURCE_ID = "obstacles";
const OBSTACLES_LAYER_ID = "obstacles-circles";
const OBSTACLES_LINES_LAYER_ID = "obstacles-lines";

const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };

const SWISSTOPO_TILE_URL =
  "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg";

function obstaclesToFeatureCollection(obstacles) {
  if (!obstacles?.length) return EMPTY_FEATURE_COLLECTION;

  const features = [];
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];

    if (obstacle.geometryType === "line") {
      const coordinates = (obstacle.coordinates || []).filter(
        (vertex) =>
          Array.isArray(vertex) &&
          Number.isFinite(vertex[0]) &&
          Number.isFinite(vertex[1]),
      );

      if (coordinates.length < 2) continue;

      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {
          id: obstacle.id,
          geometryType: "line",
        },
      });
      continue;
    }

    const latitude = Number(obstacle.latitude);
    const longitude = Number(obstacle.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      properties: {
        id: obstacle.id,
        geometryType: "point",
      },
    });
  }

  return { type: "FeatureCollection", features };
}

function extendBoundsWithCoordinates(bounds, coordinates) {
  if (!coordinates?.length) return;

  if (typeof coordinates[0] === "number") {
    bounds.extend(coordinates);
    return;
  }

  for (let index = 0; index < coordinates.length; index += 1) {
    extendBoundsWithCoordinates(bounds, coordinates[index]);
  }
}

function setObstacleSourceData(map, geojson) {
  const source = map.getSource(OBSTACLES_SOURCE_ID);
  if (source && typeof source.setData === "function") {
    source.setData(geojson);
  }
}

function whenStyleReady(map, apply) {
  if (!map) return;
  if (map.isStyleLoaded()) {
    apply();
    return;
  }
  map.once("load", apply);
}

const MapView = forwardRef(function MapView(_, ref) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const obstaclesRef = useRef([]);

  useEffect(() => {
    if (document.getElementById(MAP_STYLE_ID)) return;

    const styleTag = document.createElement("style");
    styleTag.id = MAP_STYLE_ID;
    styleTag.textContent = `
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
          [OBSTACLES_SOURCE_ID]: {
            type: "geojson",
            data: EMPTY_FEATURE_COLLECTION,
          },
        },
        layers: [
          { id: "swisstopo-layer", type: "raster", source: "swisstopo" },
          {
            id: OBSTACLES_LINES_LAYER_ID,
            type: "line",
            source: OBSTACLES_SOURCE_ID,
            filter: ["==", ["geometry-type"], "LineString"],
            paint: {
              "line-color": "#e11d48",
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                1.5,
                11,
                2.5,
                14,
                4,
                18,
                6,
              ],
              "line-opacity": 0.92,
            },
          },
          {
            id: OBSTACLES_LAYER_ID,
            type: "circle",
            source: OBSTACLES_SOURCE_ID,
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
              "circle-radius": [
                "interpolate",
                ["exponential", 1.35],
                ["zoom"],
                5,
                2,
                8,
                3.25,
                11,
                4.75,
                14,
                6.5,
                17,
                8.5,
                18,
                9.5,
              ],
              "circle-color": "#e11d48",
              "circle-opacity": 0.94,
              "circle-stroke-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                0.85,
                11,
                1.15,
                18,
                1.85,
              ],
              "circle-stroke-color": "#881337",
            },
          },
        ],
      },
    });

    mapRef.current = map;

    map.on("load", () => {
      setObstacleSourceData(map, obstaclesToFeatureCollection(obstaclesRef.current));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    renderObstaclesMarkers(obstaclesList) {
      obstaclesRef.current = obstaclesList;
      const map = mapRef.current;
      whenStyleReady(map, () => {
        setObstacleSourceData(map, obstaclesToFeatureCollection(obstaclesRef.current));
      });
    },
    clearObstacleMarkers() {
      obstaclesRef.current = [];
      const map = mapRef.current;
      whenStyleReady(map, () => {
        setObstacleSourceData(map, EMPTY_FEATURE_COLLECTION);
      });
    },
    fitMapToObstacles(obstaclesList) {
      if (!obstaclesList?.length) return;
      const geojson = obstaclesToFeatureCollection(obstaclesList);
      if (!geojson.features.length) return;

      const map = mapRef.current;
      const runFit = () => {
        if (!map?.isStyleLoaded()) return;
        const bounds = new maplibregl.LngLatBounds();
        for (let index = 0; index < geojson.features.length; index += 1) {
          extendBoundsWithCoordinates(
            bounds,
            geojson.features[index].geometry.coordinates,
          );
        }
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 650 });
        }
      };

      whenStyleReady(map, runFit);
    },
  }));

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
});

export default MapView;
