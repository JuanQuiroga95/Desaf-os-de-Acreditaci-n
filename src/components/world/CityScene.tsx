"use client";

// Ciudad 3D hecha solo con figuras simples (sin modelos ni texturas descargadas).

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  DISTRICTS,
  GENERATOR,
  GUIDE,
  INTERACT_RADIUS,
  WORLD_LIMIT,
  isRepaired,
  type PlacedMachine,
} from "./layout";

export type Vec2 = { x: number; z: number };

type SceneProps = {
  machines: PlacedMachine[];
  energy: Record<string, number>;
  hubEnergy: number;
  inputRef: RefObject<Vec2>;
  posRef: RefObject<Vec2>;
  onNearChange: (key: string | null) => void;
};

const SPEED = 6;
const PLAYER_R = 0.5;

function Player({ inputRef, posRef, machines, onNearChange }: Omit<SceneProps, "energy" | "hubEnergy">) {
  const group = useRef<THREE.Group>(null);
  const near = useRef<string | null>(null);
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const colliders = useMemo(
    () => [
      GENERATOR,
      GUIDE,
      ...machines.map((m) => ({ x: m.x, z: m.z, r: 1.2 })),
    ],
    [machines],
  );

  useFrame((state, rawDelta) => {
    const g = group.current;
    const pos = posRef.current;
    if (!g || !pos) return;
    const delta = Math.min(rawDelta, 0.05);
    const input = inputRef.current ?? { x: 0, z: 0 };
    const len = Math.hypot(input.x, input.z);
    if (len > 0.05) {
      const k = Math.min(len, 1) / len;
      pos.x += input.x * k * SPEED * delta;
      pos.z += input.z * k * SPEED * delta;
      g.rotation.y = Math.atan2(input.x, input.z);
    }
    for (const c of colliders) {
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const dist = Math.hypot(dx, dz) || 0.0001;
      const min = c.r + PLAYER_R;
      if (dist < min) {
        pos.x = c.x + (dx / dist) * min;
        pos.z = c.z + (dz / dist) * min;
      }
    }
    pos.x = THREE.MathUtils.clamp(pos.x, -WORLD_LIMIT, WORLD_LIMIT);
    pos.z = THREE.MathUtils.clamp(pos.z, -WORLD_LIMIT, WORLD_LIMIT);
    const bob = len > 0.05 ? Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.12 : 0;
    g.position.set(pos.x, bob, pos.z);

    camTarget.set(pos.x, 9, pos.z + 11);
    state.camera.position.lerp(camTarget, 1 - Math.pow(0.001, delta));
    state.camera.lookAt(pos.x, 0.8, pos.z);

    let nearest: string | null = null;
    let best = INTERACT_RADIUS;
    for (const m of machines) {
      const d = Math.hypot(pos.x - m.x, pos.z - m.z);
      if (d < best) {
        best = d;
        nearest = m.key;
      }
    }
    if (nearest !== near.current) {
      near.current = nearest;
      onNearChange(nearest);
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.42, 0.6, 6, 12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshStandardMaterial color="#fde68a" roughness={0.6} />
      </mesh>
      {/* Visera del casco de técnico: indica hacia dónde mira. */}
      <mesh position={[0, 1.62, 0.26]}>
        <boxGeometry args={[0.42, 0.12, 0.14]} />
        <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.85, -0.42]}>
        <boxGeometry args={[0.5, 0.55, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function Machine({ m }: { m: PlacedMachine }) {
  const ring = useRef<THREE.Mesh>(null);
  const alarm = useRef<THREE.MeshStandardMaterial>(null);
  const done = isRepaired(m);
  const ratio = m.total ? m.solved / m.total : 0;
  const glow = done ? m.color : ratio > 0 ? "#f59e0b" : "#1e293b";

  useFrame((state) => {
    if (ring.current) ring.current.rotation.z += done ? 0.03 : ratio > 0 ? 0.01 : 0;
    if (alarm.current && !done)
      alarm.current.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.6;
  });

  return (
    <group position={[m.x, 0, m.z]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.2, 0.4, 2.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.6, 1.8, 1.2]} />
        <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.45, 0.61]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#020617" emissive={glow} emissiveIntensity={done ? 1.4 : 0.9} />
      </mesh>
      <mesh ref={ring} position={[0, 2.75, 0]}>
        <torusGeometry args={[0.55, 0.09, 10, 32]} />
        <meshStandardMaterial color="#0f172a" emissive={glow} emissiveIntensity={done ? 2 : 0.8} />
      </mesh>
      {!done && (
        <mesh position={[0.65, 2.35, 0.45]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial ref={alarm} color="#7f1d1d" emissive="#ef4444" />
        </mesh>
      )}
      {ratio > 0 && <pointLight position={[0, 2.6, 0]} color={m.color} intensity={2 + ratio * 6} distance={7} />}
      {m.total > 0 && Array.from({ length: m.total }, (_, i) => (
        <mesh key={i} position={[-0.6 + (i / Math.max(1, m.total - 1)) * 1.2, 2.05, 0.62]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color={i < m.solved ? "#fef08a" : "#475569"} emissive="#facc15" emissiveIntensity={i < m.solved ? 2 : 0} />
        </mesh>
      ))}
      <Html position={[0, 3.6, 0]} center distanceFactor={12} zIndexRange={[20, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-lg bg-slate-950/80 px-2.5 py-1 text-center text-xs font-bold text-white shadow-lg">
          {m.title}
          <span className="block text-[10px] font-semibold text-cyan-200">
            {m.solved}/{m.total} {done ? "· reparada" : ""}
          </span>
        </div>
      </Html>
    </group>
  );
}

function Generator({ energy }: { energy: number }) {
  const core = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!core.current) return;
    core.current.rotation.y += 0.004 + energy * 0.02;
    core.current.position.y = 3.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
  });
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.2, 2.5, 0.6, 32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.9, 1.2, 2.2, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh ref={core} position={[0, 3.4, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#0c4a6e"
          emissive="#38bdf8"
          emissiveIntensity={0.25 + energy * 2.5}
        />
      </mesh>
      <pointLight position={[0, 3.4, 0]} color="#38bdf8" intensity={2 + energy * 25} distance={14} />
    </group>
  );
}

function Guide() {
  const body = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!body.current) return;
    body.current.position.y = 1.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    body.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.6;
  });
  return (
    <group position={[GUIDE.x, 0, GUIDE.z]}>
      <group ref={body}>
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, 0.42]}>
          <boxGeometry args={[0.6, 0.22, 0.2]} />
          <meshStandardMaterial color="#0f172a" emissive="#facc15" emissiveIntensity={1.6} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
        </mesh>
      </group>
      <Html position={[0, 2.9, 0]} center distanceFactor={12} zIndexRange={[20, 0]}>
        <div className="pointer-events-none rounded-lg bg-yellow-300 px-2 py-0.5 text-xs font-black text-slate-900">
          Chispa
        </div>
      </Html>
    </group>
  );
}

/** Edificios alrededor de la ciudad; se iluminan con la energía de su lado. */
function Buildings({ energy, hubEnergy }: { energy: Record<string, number>; hubEnergy: number }) {
  const blocks = useMemo(() => {
    const list: { x: number; z: number; w: number; h: number; d: number }[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = -20; i <= 20; i += 4) {
      for (const [x, z] of [
        [i, -21],
        [i, 21],
        [-21, i],
        [21, i],
      ]) {
        list.push({ x, z, w: 2.5 + rand() * 1.2, h: 2 + rand() * 6, d: 2.5 + rand() * 1.2 });
      }
    }
    return list;
  }, []);
  const left = energy.matematica ?? 0;
  const right = energy.lengua ?? 0;
  return (
    <group>
      {blocks.map((b, i) => {
        const e = b.x < -6 ? left : b.x > 6 ? right : hubEnergy;
        return (
          <mesh key={i} position={[b.x, b.h / 2, b.z]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive={e > 0 ? "#fbbf24" : "#000000"}
              emissiveIntensity={e * 0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function DistrictFloor({ x, z, color, energy, comingSoon, name }: {
  x: number;
  z: number;
  color: string;
  energy: number;
  comingSoon?: boolean;
  name: string;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[6.5, 48]} />
        <meshStandardMaterial
          color={comingSoon ? "#1f2937" : "#0f172a"}
          emissive={color}
          emissiveIntensity={comingSoon ? 0 : 0.05 + energy * 0.35}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={i} position={[Math.cos(a) * 6, 0, Math.sin(a) * 6]}>
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 2.8, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 2.9, 0]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial
                color="#334155"
                emissive={color}
                emissiveIntensity={energy > i / 4 ? 2.2 : 0.15}
              />
            </mesh>
            {!comingSoon && energy > i / 4 && <pointLight position={[0, 2.8, 0]} color="#fde68a" intensity={5} distance={8} />}
          </group>
        );
      })}
      {comingSoon && (
        <>
          {[-2.4, 0, 2.4].map((dz) => (
            <mesh key={dz} position={[-6.6, 0.6, dz]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.3, 1.2, 2]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
          ))}
        </>
      )}
      <Html position={[0, 0.5, 6.8]} center distanceFactor={14} zIndexRange={[20, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-slate-950/70 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
          {name}
          {comingSoon ? " · próximamente" : ""}
        </div>
      </Html>
    </group>
  );
}

export default function CityScene(props: SceneProps) {
  const { machines, energy, hubEnergy } = props;
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 9, 17], fov: 50 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <color attach="background" args={[hubEnergy > 0.99 ? "#36577e" : "#263b60"]} />
      <fog attach="fog" args={["#263b60", 32, 65]} />
      <hemisphereLight args={["#bfdbfe", "#64748b", 1.4 + hubEnergy * 0.4]} />
      <directionalLight position={[8, 14, 6]} intensity={1.6 + hubEnergy * 0.6} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0b1222" />
      </mesh>
      {/* Calles desde la plaza hacia cada barrio. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -3]}>
        <planeGeometry args={[34, 2.4]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 4]}>
        <planeGeometry args={[2.4, 14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      <Generator energy={hubEnergy} />
      <Guide />
      {DISTRICTS.map((d) => (
        <DistrictFloor
          key={d.id}
          x={d.x}
          z={d.z}
          color={d.color}
          energy={energy[d.id] ?? 0}
          comingSoon={d.comingSoon}
          name={d.name}
        />
      ))}
      {machines.map((m) => (
        <Machine key={m.key} m={m} />
      ))}
      <Buildings energy={energy} hubEnergy={hubEnergy} />
      <Player {...props} />
    </Canvas>
  );
}
