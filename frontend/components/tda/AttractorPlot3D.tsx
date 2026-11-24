"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCw, Maximize2, Pause, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttractorPlot3DProps {
  className?: string;
  points?: Array<[number, number, number] | { x: number; y: number; z: number }>;
  initialDelay?: number;
  initialDim?: number;
  onParamsChange?: (delay: number, dim: number) => void;
}

export function AttractorPlot3D({
  className = "",
  points,
  initialDelay = 4,
  initialDim = 3,
  onParamsChange,
}: AttractorPlot3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lineMeshRef = useRef<THREE.Line | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);

  const [delay, setDelay] = useState(initialDelay);
  const [dim, setDim] = useState(initialDim);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Generate synthetic Rossler/Takens attractor trajectory if no points passed
  const trajectoryData = React.useMemo(() => {
    if (points && points.length > 0) {
      return points.map((p) => {
        if (Array.isArray(p)) return new THREE.Vector3(p[0], p[1], p[2] || 0);
        return new THREE.Vector3(p.x, p.y, p.z || 0);
      });
    }

    // Default Rossler chaotic attractor trajectory
    const pts: THREE.Vector3[] = [];
    let x = 0.1, y = 0.0, z = 0.0;
    const a = 0.2, b = 0.2, c = 5.7;
    const dt = 0.04;
    const skip = Math.max(1, delay);

    for (let i = 0; i < 3000; i++) {
      const dx = -y - z;
      const dy = x + a * y;
      const dz = b + z * (x - c);
      x += dx * dt;
      y += dy * dt;
      z += dz * dt;

      if (i % skip === 0) {
        pts.push(new THREE.Vector3(x * 0.15, y * 0.15, z * 0.1));
      }
    }
    return pts;
  }, [points, delay, dim]);

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1017); // Deep charcoal enterprise aesthetic
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // 5. Grid helper (dark charcoal)
    const gridHelper = new THREE.GridHelper(6, 12, 0x272733, 0x16161c);
    gridHelper.position.y = -1.5;
    scene.add(gridHelper);

    // 6. Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotating;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Trajectory Geometry when points or delay changes
  useEffect(() => {
    if (!sceneRef.current || trajectoryData.length === 0) return;
    const scene = sceneRef.current;

    // Remove old meshes
    if (lineMeshRef.current) scene.remove(lineMeshRef.current);
    if (pointsMeshRef.current) scene.remove(pointsMeshRef.current);

    // Build geometry with vertex colors
    const geometry = new THREE.BufferGeometry().setFromPoints(trajectoryData);
    const count = trajectoryData.length;
    const colors = new Float32Array(count * 3);

    // Gradient: dark blue/cyan at start -> vibrant orange (#FF5500) -> bright amber at tail
    const colorStart = new THREE.Color(0x00e5ff); // Cyan
    const colorMid = new THREE.Color(0xff5500);   // Electric orange
    const colorEnd = new THREE.Color(0xffaa00);   // Amber

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const c = new THREE.Color();
      if (t < 0.6) {
        c.lerpColors(colorStart, colorMid, t / 0.6);
      } else {
        c.lerpColors(colorMid, colorEnd, (t - 0.6) / 0.4);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Continuous line
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5,
    });
    const lineMesh = new THREE.Line(geometry, lineMaterial);
    scene.add(lineMesh);
    lineMeshRef.current = lineMesh;

    // Subtle point nodes along the trajectory
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const pointsMesh = new THREE.Points(geometry, pointsMaterial);
    scene.add(pointsMesh);
    pointsMeshRef.current = pointsMesh;
  }, [trajectoryData]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 7);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleDelayChange = (newDelay: number) => {
    setDelay(newDelay);
    onParamsChange?.(newDelay, dim);
  };

  const handleDimChange = (newDim: number) => {
    setDim(newDim);
    onParamsChange?.(delay, newDim);
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-4 flex flex-col ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            3D Takens Dynamical Phase-Space Attractor
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Hardware-accelerated WebGL orbit reconstruction: [s(t), s(t+τ), s(t+2τ)]
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="h-7 text-xs px-2 gap-1"
          >
            {isAutoRotating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isAutoRotating ? "Pause" : "Rotate"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleResetCamera}
            className="h-7 text-xs px-2 gap-1"
            title="Reset Camera View"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[320px] rounded-lg overflow-hidden my-3 relative cursor-grab active:cursor-grabbing border border-border/40"
      />

      {/* Parameter Sliders */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40 text-xs">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-mono text-muted-foreground">Delay Lag (τ)</span>
            <span className="font-mono font-bold text-[#FF5500]">{delay} samples</span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            step={1}
            value={delay}
            onChange={(e) => handleDelayChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#FF5500] cursor-pointer h-1.5 bg-muted rounded-lg"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-mono text-muted-foreground">Embedding Dim (d)</span>
            <span className="font-mono font-bold text-foreground">{dim}</span>
          </div>
          <input
            type="range"
            min={2}
            max={5}
            step={1}
            value={dim}
            onChange={(e) => handleDimChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#FF5500] cursor-pointer h-1.5 bg-muted rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
