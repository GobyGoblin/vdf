import { World } from "./ui/globe";
import globeData from "../data/globe.json";

interface GlobeProps {
  height?: number;
  autoRotate?: boolean;
  showConnections?: boolean;
}

const Globe = ({
  height = 600,
  autoRotate = true,
}: GlobeProps) => {
  const globeConfig = {
    pointSize: 4,
    globeColor: "#05070a",
    showAtmosphere: true,
    atmosphereColor: "#fbbf24",
    atmosphereAltitude: 0.15,
    emissive: "#0a192f",
    emissiveIntensity: 0.5,
    shininess: 0.9,
    polygonColor: "rgba(251, 191, 36, 0.8)",
    ambientLight: "#fbbf24",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#fbbf24",
    pointLight: "#fbbf24",
    arcTime: 2600,
    arcLength: 0.6,
    arcDashGap: 2.0,
    rings: 2,
    maxRings: 4,
    autoRotate: autoRotate,
    autoRotateSpeed: 1.2,
  };

  return (
    <div style={{ width: "100%", height, position: "relative" }}>
      <div className="absolute inset-x-0 bottom-0 top-0 w-full h-full z-10">
        <World data={globeData} globeConfig={{ ...globeConfig, autoRotate }} />
      </div>
    </div>
  );
};

export default Globe;
