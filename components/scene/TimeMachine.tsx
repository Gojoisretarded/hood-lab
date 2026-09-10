'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { state } from '@/lib/timeline';

/**
 * The hero object, built from geometry rather than a GLB.
 *
 * Three counter-rotating rings around a displaced core. It is parametric on
 * purpose: `spin` reacts to scroll velocity, so the machine visibly labours
 * during the violent years instead of idling at a constant rate. Swap in a
 * loaded model later by replacing the <group> children — nothing outside this
 * file knows what the machine is made of.
 */
export function TimeMachine() {
  const group = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  const basePositions = useRef<Float32Array | null>(null);
  const lastProgress = useRef(0);
  const velocity = useRef(0);

  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(1.55, 6), []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const p = state.progress;

    // Smoothed scroll speed drives how hard the machine works.
    const raw = Math.abs(p - lastProgress.current) / Math.max(d, 0.0001);
    lastProgress.current = p;
    velocity.current += (raw - velocity.current) * 0.08;
    const drive = state.reducedMotion ? 0.25 : 0.25 + Math.min(velocity.current * 9, 3.4);

    if (ringA.current) ringA.current.rotation.z += d * 0.42 * drive;
    if (ringB.current) {
      ringB.current.rotation.z -= d * 0.31 * drive;
      ringB.current.rotation.x = Math.PI / 2.4 + Math.sin(p * 5) * 0.06;
    }
    if (ringC.current) {
      ringC.current.rotation.y += d * 0.5 * drive;
      ringC.current.rotation.x += d * 0.12 * drive;
    }

    // The machine recedes as you travel, but never fully leaves.
    if (group.current) {
      group.current.position.z = -p * 26;
      const s = 1 - p * 0.42;
      group.current.scale.setScalar(s);
      group.current.rotation.y = p * 0.7;
    }

    // Vertex displacement on the core — the reference's signature move.
    if (core.current && !state.reducedMotion) {
      const geo = core.current.geometry as THREE.IcosahedronGeometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      if (!basePositions.current) basePositions.current = Float32Array.from(pos.array);
      const base = basePositions.current;
      const t = performance.now() * 0.00042;
      const amp = 0.055 + Math.min(velocity.current * 1.3, 0.2);
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const x = base[ix], y = base[ix + 1], z = base[ix + 2];
        const n =
          Math.sin(x * 2.1 + t * 2.0) * Math.cos(y * 1.9 - t * 1.4) * Math.sin(z * 2.3 + t);
        const k = 1 + n * amp;
        pos.array[ix] = x * k;
        pos.array[ix + 1] = y * k;
        pos.array[ix + 2] = z * k;
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
  });

  return (
    <group ref={group}>
      <mesh ref={core} geometry={coreGeo}>
        <meshStandardMaterial
          color="#141A15"
          emissive="#2F4A0A"
          emissiveIntensity={0.16}
          metalness={0.94}
          roughness={0.34}
          flatShading
        />
      </mesh>

      {/* wireframe shell — gives the core an engineered edge the solid lacks */}
      <mesh geometry={coreGeo} scale={1.035}>
        <meshBasicMaterial color="#76B900" wireframe transparent opacity={0.09} />
      </mesh>

      <mesh ref={ringA}>
        <torusGeometry args={[3.1, 0.035, 12, 200]} />
        <meshStandardMaterial color="#76B900" emissive="#76B900" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>

      <mesh ref={ringB} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[4.25, 0.022, 10, 200]} />
        <meshStandardMaterial color="#5E8F12" emissive="#4A7300" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>

      <mesh ref={ringC} rotation={[0.5, 0.4, 0]}>
        <torusGeometry args={[5.6, 0.014, 8, 220]} />
        <meshStandardMaterial color="#8FA88A" emissive="#2E4A08" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>

      {/* portal disc — reads as the mouth of the corridor */}
      <mesh position={[0, 0, -1.2]}>
        <circleGeometry args={[2.6, 64]} />
        <meshBasicMaterial color="#0B2E00" transparent opacity={0.34} side={THREE.DoubleSide} />
      </mesh>

      <pointLight position={[0, 0, 3.5]} intensity={3.2} distance={18} color="#76B900" />
    </group>
  );
}
