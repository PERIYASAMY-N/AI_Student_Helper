"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/ui/Navbar";
import toast from "react-hot-toast";
import { FlaskConical, Loader2, Play } from "lucide-react";
import * as THREE from "three";

export default function SciencePage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animRef = useRef<number>(0);

  const [form, setForm] = useState({ subject: "chemistry", concept: "Water molecule (H2O)" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0x404080, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1);
    dl.position.set(5, 10, 5);
    scene.add(dl);
    const pl = new THREE.PointLight(0x00ffff, 2, 20);
    pl.position.set(-3, 3, 3);
    scene.add(pl);

    // Default molecule: H2O
    const group = new THREE.Group();
    const oGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const oMat = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x440000, shininess: 80 });
    const oxygen = new THREE.Mesh(oGeo, oMat);
    group.add(oxygen);

    const hGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const hMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x222222, shininess: 50 });

    const h1 = new THREE.Mesh(hGeo, hMat);
    h1.position.set(-1.3, -0.9, 0);
    group.add(h1);

    const h2 = new THREE.Mesh(hGeo, hMat);
    h2.position.set(1.3, -0.9, 0);
    group.add(h2);

    // Bonds
    const createBond = (a: THREE.Vector3, b: THREE.Vector3) => {
      const dir = new THREE.Vector3().subVectors(b, a);
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      const bGeo = new THREE.CylinderGeometry(0.1, 0.1, dir.length(), 8);
      const bMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const bond = new THREE.Mesh(bGeo, bMat);
      bond.position.copy(mid);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
      return bond;
    };
    group.add(createBond(oxygen.position, h1.position));
    group.add(createBond(oxygen.position, h2.position));
    scene.add(group);

    // Animate
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      group.rotation.y += 0.008;
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const generateAnimation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/science/animate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.animation);
      toast.success("Animation generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate animation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 flex flex-col">
      <Navbar />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 pt-16">
        {/* 3D Canvas */}
        <div className="relative bg-dark-900 border-r border-dark-600" style={{ minHeight: "500px" }}>
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <FlaskConical className="text-cyan-400" size={18} />
            <span className="text-sm font-medium text-gray-300">3D Science Visualizer</span>
          </div>
          <div ref={mountRef} className="w-full h-full" style={{ minHeight: "500px" }} />
        </div>

        {/* Controls & Info */}
        <div className="p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">Science 3D Animator</h1>

          <div className="glass rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="biology">Biology</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Concept</label>
                <input
                  value={form.concept}
                  onChange={(e) => setForm({ ...form, concept: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Newton's second law"
                />
              </div>
            </div>

            <button
              onClick={generateAnimation}
              disabled={loading}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-dark-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {loading ? "Generating..." : "Generate Animation"}
            </button>
          </div>

          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold mb-2">{result.concept}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{result.description}</p>
              </div>

              {result.narrationScript?.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h4 className="text-sm font-medium mb-3">Step-by-Step Explanation</h4>
                  <ol className="space-y-2">
                    {result.narrationScript.map((s: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300">
                        <span className="w-5 h-5 bg-cyan-900 text-cyan-400 rounded-full flex items-center justify-center text-xs shrink-0">{i+1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Quick examples */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">Quick Examples</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["chemistry","Water molecule (H2O)"],
                ["physics","Projectile motion"],
                ["biology","Cell division (Mitosis)"],
                ["chemistry","Ionic bonding (NaCl)"],
                ["physics","Simple harmonic motion"],
              ].map(([sub, con]) => (
                <button
                  key={con}
                  onClick={() => setForm({ subject: sub, concept: con })}
                  className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-dark-500"
                >
                  {con}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
