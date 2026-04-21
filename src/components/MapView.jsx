import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const MAP_STYLE_ID = "map-obstacle-map-styles";
const OBSTACLES_SOURCE_ID = "obstacles";
const OBSTACLES_LAYER_ID = "obstacles-circles";

const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };

const SWISSTOPO_TILE_URL =
  "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg";

function obstaclesToFeatureCollection(obstacles) {
  if (!obstacles?.length) return EMPTY_FEATURE_COLLECTION;

  const features = [];
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];
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
      },
    });
  }

  return { type: "FeatureCollection", features };
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
            id: OBSTACLES_LAYER_ID,
            type: "circle",
            source: OBSTACLES_SOURCE_ID,
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
      const source = map.getSource(OBSTACLES_SOURCE_ID);
      if (source && typeof source.setData === "function") {
        source.setData(obstaclesToFeatureCollection(obstaclesRef.current));
      }
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
      if (!map?.isStyleLoaded()) return;
      const source = map.getSource(OBSTACLES_SOURCE_ID);
      if (source && typeof source.setData === "function") {
        source.setData(obstaclesToFeatureCollection(obstaclesList));
      }
    },
    clearObstacleMarkers() {
      obstaclesRef.current = [];
      const map = mapRef.current;
      if (!map?.isStyleLoaded()) return;
      const source = map.getSource(OBSTACLES_SOURCE_ID);
      if (source && typeof source.setData === "function") {
        source.setData(EMPTY_FEATURE_COLLECTION);
      }
    },
  }));

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
});

export default MapView;
