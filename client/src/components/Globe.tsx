import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import '../styles/globe.css';

interface Marker {
  lat: number;
  lon: number;
  color?: number;
  size?: number;
}

interface GlobeProps {
  markers?: Marker[];
}

export default function Globe({ markers = [] }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // scene/camera/renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    // load texture from public folder or use CDN
    const texLoader = new THREE.TextureLoader();
    // Try local first, fallback to CDN
    const earthUrl = '/earth.jpg';
    texLoader.load(
      earthUrl,
      (texture) => {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.MeshPhongMaterial({ map: texture });
        const earth = new THREE.Mesh(geometry, material);
        earth.name = 'earth';
        scene.add(earth);

        const atmosphereMat = new THREE.MeshBasicMaterial({
          color: 0x6699ff,
          transparent: true,
          opacity: 0.06,
          side: THREE.DoubleSide,
        });
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.02, 64, 64), atmosphereMat);
        atmosphere.name = 'atmosphere';
        scene.add(atmosphere);
      },
      undefined,
      (error) => {
        // Fallback to CDN if local file not found
        console.warn('Local earth.jpg not found, using CDN texture');
        const cdnUrl = 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg';
        texLoader.load(
          cdnUrl,
          (texture) => {
            const geometry = new THREE.SphereGeometry(1, 64, 64);
            const material = new THREE.MeshPhongMaterial({ map: texture });
            const earth = new THREE.Mesh(geometry, material);
            earth.name = 'earth';
            scene.add(earth);

            const atmosphereMat = new THREE.MeshBasicMaterial({
              color: 0x6699ff,
              transparent: true,
              opacity: 0.06,
              side: THREE.DoubleSide,
            });
            const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.02, 64, 64), atmosphereMat);
            atmosphere.name = 'atmosphere';
            scene.add(atmosphere);
          }
        );
      }
    );

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1.6;
    controls.maxDistance = 10;

    // helpers
    function latLonToVector3(lat: number, lon: number, r: number = 1) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    }

    // add markers function
    function addMarker(lat: number, lon: number, { size = 0.02, color = 0xff0000 }: { size?: number; color?: number } = {}) {
      const geometry = new THREE.SphereGeometry(size, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(geometry, material);
      const pos = latLonToVector3(lat, lon, 1 + size * 0.7);
      marker.position.copy(pos);
      marker.name = 'marker';
      scene.add(marker);
      return marker;
    }

    // add connection arc function
    function addConnection(startLat: number, startLon: number, endLat: number, endLon: number, color: number = 0xffd700) {
      const startPos = latLonToVector3(startLat, startLon, 1.01);
      const endPos = latLonToVector3(endLat, endLon, 1.01);

      const midPoint = new THREE.Vector3()
        .add(startPos)
        .add(endPos)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(1.5);

      const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
      const arcPoints = curve.getPoints(50);
      const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);

      const arcMaterial = new THREE.LineBasicMaterial({
        color,
        linewidth: 2,
        transparent: true,
        opacity: 0.8,
      });

      const arc = new THREE.Line(arcGeometry, arcMaterial);
      arc.name = 'connection';
      scene.add(arc);
      return arc;
    }

    // add initial markers from props
    const createdMarkers: THREE.Mesh[] = [];
    markers.forEach((m) => {
      createdMarkers.push(addMarker(m.lat, m.lon, { size: m.size, color: m.color }));
    });

    // Add Germany ↔ Morocco connection
    addConnection(52.52, 13.405, 34.0209, -6.8416, 0xffd700);

    // resize handling
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // animation loop
    let reqId: number;
    function animate() {
      reqId = requestAnimationFrame(animate);
      // subtle auto-rotation
      const earth = scene.getObjectByName('earth');
      if (earth) earth.rotation.y += 0.0008;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // cleanup
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      // dispose objects & renderer
      createdMarkers.forEach((m) => {
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((mat) => mat.dispose());
            else obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // run once

  // When markers prop changes, add new markers (simple approach)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    // remove existing markers
    scene.children.filter((c) => c.name === 'marker').forEach((m) => {
      scene.remove(m);
      if (m instanceof THREE.Mesh) {
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      }
    });
    // add markers
    markers.forEach((m) => {
      const phi = (90 - m.lat) * (Math.PI / 180);
      const theta = (m.lon + 180) * (Math.PI / 180);
      const r = 1 + (m.size || 0.02) * 0.7;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const geometry = new THREE.SphereGeometry(m.size || 0.02, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: m.color || 0xff0000 });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);
      marker.name = 'marker';
      scene.add(marker);
    });
  }, [markers]);

  return <div ref={mountRef} className="globe-container" />;
}
