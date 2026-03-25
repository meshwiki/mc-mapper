"use client";
import React from "react";
import Map, { MapRef, NavigationControl } from "react-map-gl/maplibre";
import maplibregl, {
    CustomRenderMethodInput,
    MapLibreEvent,
    MercatorCoordinate,
} from "maplibre-gl";
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { MdLocationSearching, MdMyLocation } from "react-icons/md";

import { useGeoLocation } from "@/hooks/useGeoLocation";

import "maplibre-gl/dist/maplibre-gl.css";
import styles from "./Map.module.css";

type RssiDatum = {
    id: string;
    rssi: number;
    snr: number;
    stamp: string;
    lastRepeater: string;
    lat: number;
    lng: number;
};

function rssiToHeight(rssi: number) {
    const min = -120;
    const max = -30;
    const t = (rssi - min) / (max - min);
    return 20 + t * 200;
}

function rssiToColor(rssi: number) {
    const t = (rssi + 120) / 90;
    const r = Math.round(255 * (1 - t));
    const g = Math.round(255 * t);
    return (r << 16) | (g << 8);
}

function buildMeshes(
    data: RssiDatum[],
    group: THREE.Group | null,
    map: maplibregl.Map | null
) {
    if (!group || !map) return;

    group.clear();

    const canvas = map.getCanvas();

    data.forEach((d) => {
        const merc = MercatorCoordinate.fromLngLat(
            { lng: d.lng, lat: d.lat },
            0
        );
        const scale = merc.meterInMercatorCoordinateUnits();
        const heightMeters = rssiToHeight(d.rssi);
        // One local root per datum.
        // This root is placed in mercator space and scales local meter units to mercator units.
        const featureRoot = new THREE.Group();
        featureRoot.position.set(merc.x, merc.y, merc.z);
        featureRoot.scale.set(scale, scale, scale);
        // Vertical line in local coordinates, measured in meters.
        // Use Y as "up" because Line2 works naturally that way in this setup.
        const geometry = new LineGeometry();
        geometry.setPositions([0, 0, 0, 0, 0, heightMeters]);
        const material = new LineMaterial({
            color: rssiToColor(d.rssi),
            linewidth: 2, // 2 CSS pixels
            worldUnits: false, // keep width constant on screen
            transparent: true,
            opacity: 1,
            depthTest: true,
            depthWrite: false,
        });
        material.resolution.set(canvas.width, canvas.height);
        const line = new Line2(geometry, material);
        line.computeLineDistances();
        featureRoot.add(line);
        group.add(featureRoot);
    });
    map.triggerRepaint();
}

type MapProps = {
    data: RssiDatum[];
};
export default function RSSIMap({ data }: MapProps) {
    const mapRef = React.useRef<MapRef | null>(null);
    const location = useGeoLocation();
    const [snapped, setSnapped] = React.useState(true);

    const sceneRef = React.useRef<THREE.Scene>(null);
    const cameraRef = React.useRef<THREE.Camera>(null);
    const rendererRef = React.useRef<THREE.WebGLRenderer>(null);
    const groupRef = React.useRef<THREE.Group>(null);

    // console.log(data);

    const handleMapLoad = React.useCallback((e: MapLibreEvent) => {
        const map = e.target;
        // console.log("map loaded", map);
        if (map.getLayer("rssi-layer")) return;

        const layer = {
            id: "rssi-layer",
            type: "custom" as const,
            renderingMode: "3d" as const,

            onAdd: (map: maplibregl.Map, gl: WebGLRenderingContext) => {
                const scene = new THREE.Scene();
                const camera = new THREE.Camera();

                const renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true,
                });

                renderer.autoClear = false;

                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(0, 0, 100);
                scene.add(light);

                const group = new THREE.Group();
                scene.add(group);

                sceneRef.current = scene;
                cameraRef.current = camera;
                rendererRef.current = renderer;
                groupRef.current = group;

                buildMeshes(data, group, map);
            },

            render: (
                gl: WebGLRenderingContext,
                options: CustomRenderMethodInput
            ) => {
                let matrix = options.defaultProjectionData.mainMatrix;

                const camera = cameraRef.current;
                const renderer = rendererRef.current;
                const scene = sceneRef.current;

                if (!camera || !renderer || !scene) return;

                camera.projectionMatrix = new THREE.Matrix4().fromArray(
                    options.defaultProjectionData.mainMatrix
                );

                const canvas = renderer.domElement;
                scene.traverse((obj: any) => {
                    if (obj.material?.isLineMaterial) {
                        obj.material.resolution.set(
                            canvas.width,
                            canvas.height
                        );
                    }
                });

                renderer.resetState();
                renderer.render(scene, camera);
                map.triggerRepaint();
            },
        };

        map.addLayer(layer);
    }, []);

    React.useEffect(() => {
        buildMeshes(data, groupRef.current, mapRef.current?.getMap() ?? null);
    }, [data]);

    React.useEffect(() => {
        if (location && mapRef.current && snapped) {
            mapRef.current.flyTo({
                center: [location.coords.longitude, location.coords.latitude],
                duration: 2000,
            });
        }
    }, [location, snapped]);

    return (
        <div className={styles.MapContainer}>
            <Map
                ref={mapRef}
                mapLib={maplibregl}
                initialViewState={{
                    longitude: location?.coords.longitude ?? 5.12,
                    latitude: location?.coords.latitude ?? 52.09,
                    zoom: 13,
                    pitch: 75,
                    bearing: 0,
                }}
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                }}
                maxPitch={85}
                sky={{
                    // "sky-color": "#199EF3",
                    "sky-color": "#88C6FC",
                    "sky-horizon-blend": 0.5,
                    "horizon-color": "#ffffff",
                    "horizon-fog-blend": 0.5,
                    "fog-color": "#0000ff",
                    "fog-ground-blend": 0.5,
                    "atmosphere-blend": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0,
                        1,
                        10,
                        1,
                        12,
                        0,
                    ],
                }}
                mapStyle="https://api.maptiler.com/maps/dataviz-v4/style.json?key=LKEbKWkHg8HwYhK8Gsco"
                onLoad={handleMapLoad}
            >
                <NavigationControl position="top-right" />
                <button
                    className={styles.SnapButton}
                    onClick={() => setSnapped((s) => !s)}
                >
                    {snapped ? <MdMyLocation /> : <MdLocationSearching />}
                </button>
            </Map>
        </div>
    );
}
