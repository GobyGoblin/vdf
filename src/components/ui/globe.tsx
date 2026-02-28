"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three";
import ThreeGlobe from "three-globe";
// Fallback logic for different build environments
const ThreeGlobeConstructor = (ThreeGlobe as any).default || ThreeGlobe;

import { useThree, Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

export type Position = {
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color: string;
    label?: string;
};

export type GlobeConfig = {
    pointSize?: number;
    globeColor?: string;
    showAtmosphere?: boolean;
    atmosphereColor?: string;
    atmosphereAltitude?: number;
    emissive?: string;
    emissiveIntensity?: number;
    shininess?: number;
    polygonColor?: string;
    ambientLight?: string;
    directionalLeftLight?: string;
    directionalTopLight?: string;
    pointLight?: string;
    arcTime?: number;
    arcLength?: number;
    arcDashGap?: number;
    rings?: number;
    maxRings?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
};

interface WorldProps {
    globeConfig: GlobeConfig;
    data: Position[];
}

class GlobeError extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any, errorInfo: any) { console.error("Globe Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) return <div className="flex items-center justify-center w-full h-full bg-navy text-gold text-sm italic">Failed to load 3D Globe</div>;
        return this.props.children;
    }
}

const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new Vector3(x, y, z);
};

export function Globe({ globeConfig, data }: WorldProps) {
    const [globeData, setGlobeData] = useState<any>(null);
    const [globe, setGlobe] = useState<any>(null);

    const defaultProps = useMemo(() => ({
        pointSize: 1,
        showAtmosphere: true,
        atmosphereColor: "#FFFFFF",
        atmosphereAltitude: 0.1,
        polygonColor: "rgba(255,255,255,0.7)",
        globeColor: "#000080",
        emissive: "#000080",
        emissiveIntensity: 0.1,
        shininess: 0.9,
        arcTime: 2000,
        arcLength: 0.9,
        arcDashGap: 0.05,
        rings: 1,
        maxRings: 3,
        ...globeConfig,
    }), [globeConfig]);

    // Handle data building
    useEffect(() => {
        if (!globe) {
            try {
                console.log("ThreeGlobeConstructor type:", typeof ThreeGlobeConstructor);
                console.log("ThreeGlobeConstructor content:", ThreeGlobeConstructor);
                console.log("Initializing ThreeGlobe instance...");
                const newGlobe = new ThreeGlobeConstructor();
                setGlobe(newGlobe);
            } catch (e) {
                console.error("Failed to create ThreeGlobe:", e);
            }
            return;
        }

        try {
            console.log("Configuring Globe layers...");
            const arcs = data || [];
            const points = arcs.map((arc) => ({
                lat: arc.startLat,
                lng: arc.startLng,
                size: defaultProps.pointSize,
                color: arc.color,
            }));

            globe
                .arcsData(arcs)
                .arcColor((e: any) => (e as Position).color)
                .arcAltitude((e: any) => (e as Position).arcAlt)
                .arcStroke((e: any) => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
                .arcDashLength(defaultProps.arcLength)
                .arcDashInitialGap((e: any) => Math.random() * 5)
                .arcDashGap(defaultProps.arcDashGap)
                .arcDashAnimateTime(() => defaultProps.arcTime);

            globe
                .pointsData(points)
                .pointColor((e: any) => (e as any).color)
                .pointsMerge(true)
                .pointAltitude(0.0)
                .pointRadius(2);

            globe
                .ringsData([])
                .ringColor((e: any) => (t: any) => e.color(t))
                .ringMaxRadius(defaultProps.maxRings)
                .ringPropagationSpeed(3)
                .ringRepeatPeriod(defaultProps.arcTime * (Math.random() * 2 + 1));

            const globeMaterial = globe.globeMaterial() as any;
            if (globeMaterial) {
                globeMaterial.color = new Color(defaultProps.globeColor);
                globeMaterial.emissive = new Color(defaultProps.emissive);
                globeMaterial.emissiveIntensity = defaultProps.emissiveIntensity || 0.1;
                globeMaterial.shininess = defaultProps.shininess || 0.9;
            }
        } catch (err) {
            console.error("Error building globe data:", err);
        }
    }, [globe, data, defaultProps]);

    // Handle GeoJSON
    useEffect(() => {
        if (globe && globeData) {
            try {
                globe
                    .hexPolygonsData(globeData.features)
                    .hexPolygonResolution(3)
                    .hexPolygonMargin(0.1)
                    .hexPolygonColor(() => defaultProps.polygonColor);
            } catch (err) {
                console.error("Error setting hex polygons:", err);
            }
        }
    }, [globe, globeData, defaultProps]);

    // Load world data
    useEffect(() => {
        fetch("/custom.geo.json")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load geojson");
                return res.json();
            })
            .then((data) => setGlobeData(data))
            .catch((err) => console.error("Error loading globe data:", err));
    }, []);

    if (!globe) return null;

    return <primitive object={globe} />;
}

export function World(props: WorldProps) {
    const { globeConfig, data } = props;

    return (
        <GlobeError>
            <div style={{ width: '100%', height: '100%' }}>
                <Canvas
                    camera={{ position: [0, 0, 350], fov: 50 }}
                    gl={{ antialias: true, alpha: true }}
                >
                    <ambientLight color={globeConfig.ambientLight || "#fbbf24"} intensity={0.4} />
                    <directionalLight
                        color={globeConfig.directionalLeftLight || "#fbbf24"}
                        position={[-400, 100, 400]}
                        intensity={1.5}
                    />
                    <directionalLight
                        color={globeConfig.directionalTopLight || "#fbbf24"}
                        position={[400, -100, -400]}
                        intensity={0.5}
                    />
                    <pointLight
                        color={globeConfig.pointLight || "#fbbf24"}
                        position={[-200, 500, 200]}
                        intensity={1.2}
                    />
                    <Globe {...props} />
                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minDistance={200}
                        maxDistance={500}
                        autoRotateSpeed={globeConfig.autoRotateSpeed}
                        autoRotate={globeConfig.autoRotate}
                    />
                </Canvas>
            </div>
        </GlobeError>
    );
}
