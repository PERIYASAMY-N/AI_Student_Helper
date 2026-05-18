"use client";
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface ExecutionStep {
  stepId: number;
  line: number;
  operation: string;
  variables: Record<string, any>;
  callStack: string[];
  description: string;
}

interface ThreeSceneProps {
  executionSteps: ExecutionStep[];
  currentStep: number;
  isPlaying: boolean;
  onStepComplete: () => void;
}

export default function ThreeScene({ executionSteps, currentStep }: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const animFrameRef = useRef<number>(0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const spherical = useRef({ theta: 0, phi: Math.PI / 3, radius: 22 });

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050512);
    scene.fog = new THREE.FogExp2(0x050512, 0.018);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0x203060, 0.8));
    const dirLight = new THREE.DirectionalLight(0x8899ff, 1.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const ptLight = new THREE.PointLight(0x00ffcc, 2, 40);
    ptLight.position.set(-8, 6, 6);
    scene.add(ptLight);

    // Grid
    const grid = new THREE.GridHelper(60, 60, 0x001133, 0x000822);
    grid.position.y = -3;
    scene.add(grid);

    // Orbit controls (manual)
    const el = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onMouseUp   = () => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      spherical.current.theta -= dx * 0.01;
      spherical.current.phi   = Math.max(0.2, Math.min(Math.PI / 2, spherical.current.phi - dy * 0.01));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e: WheelEvent) => {
      spherical.current.radius = Math.max(5, Math.min(50, spherical.current.radius + e.deltaY * 0.05));
    };
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    el.addEventListener("wheel", onWheel, { passive: true });

    // Animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const { theta, phi, radius } = spherical.current;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight || 480;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mousedown", onMouseDown);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const createLabel = useCallback((text: string, pos: THREE.Vector3): THREE.Sprite => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, 128, 40);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(pos);
    sprite.scale.set(3, 0.75, 1);
    return sprite;
  }, []);

  const renderStep = useCallback((step: ExecutionStep) => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove old variable objects
    objectsRef.current.forEach(o => scene.remove(o));
    objectsRef.current = [];

    const vars = Object.entries(step.variables || {});
    if (vars.length === 0) return;

    const totalWidth = (vars.length - 1) * 4;
    let xStart = -totalWidth / 2;

    vars.forEach(([name, info]: [string, any]) => {
      const group = new THREE.Group();
      const val = typeof info === "object" && info !== null && "value" in info ? info.value : info;
      const type = typeof info === "object" && info !== null && "type" in info ? info.type : typeof val;

      if (Array.isArray(val)) {
        // Array blocks
        val.forEach((v: any, i: number) => {
          const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
          const mat = new THREE.MeshPhongMaterial({ color: 0x1155ff, emissive: 0x001133, shininess: 80 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(i * 2, 0, 0);
          mesh.castShadow = true;
          group.add(mesh);

          const valLabel = createLabel(String(v), new THREE.Vector3(i * 2, 1.4, 0));
          group.add(valLabel);
        });
        const nameLabel = createLabel(`[${name}]`, new THREE.Vector3((val.length - 1), -1.5, 0));
        group.add(nameLabel);
      } else if (typeof val === "number") {
        const h = Math.max(0.5, Math.min(6, Math.abs(val) * 0.3 + 0.5));
        const geo = new THREE.BoxGeometry(2, h, 2);
        const mat = new THREE.MeshPhongMaterial({ color: 0x00cc77, emissive: 0x003322, shininess: 90 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = h / 2;
        mesh.castShadow = true;
        group.add(mesh);
        group.add(createLabel(`${name}=${val}`, new THREE.Vector3(0, h + 1.2, 0)));
      } else {
        const geo = new THREE.CylinderGeometry(0.9, 0.9, 2, 8);
        const mat = new THREE.MeshPhongMaterial({ color: 0xff6600, emissive: 0x331100 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        group.add(mesh);
        group.add(createLabel(`${name}="${String(val).slice(0, 8)}"`, new THREE.Vector3(0, 2, 0)));
      }

      group.position.x = xStart;
      scene.add(group);
      objectsRef.current.push(group);
      xStart += 4 + (Array.isArray(val) ? val.length * 2 : 0);
    });

    // Call stack
    step.callStack?.forEach((fn, i) => {
      const w = 5, h = 1, d = 2;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshPhongMaterial({
        color: 0x6600cc,
        emissive: 0x220044,
        transparent: true,
        opacity: 0.85 - i * 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-10, i * 1.4, 0);
      scene.add(mesh);
      objectsRef.current.push(mesh);

      const label = createLabel(fn, new THREE.Vector3(-10, i * 1.4 + 0.9, 0));
      scene.add(label);
      objectsRef.current.push(label);
    });
  }, [createLabel]);

  useEffect(() => {
    if (executionSteps.length > 0 && executionSteps[currentStep]) {
      renderStep(executionSteps[currentStep]);
    }
  }, [currentStep, executionSteps, renderStep]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: "400px", cursor: "grab" }}
    />
  );
}
