'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { events, SPACING, COUNT, IMPACT_TONE } from '@/lib/events';
import { state } from '@/lib/timeline';

const UP = new THREE.Color('#76B900');
const DOWN = new THREE.Color('#E5484D');
const FLAT = new THREE.Color('#2A332A');

/**
 * One ring per year, threaded down the corridor. Instanced, so 29 markers cost
 * a single draw call. Each ring's radius encodes that year's return — the
 * corridor visibly constricts in 2002, 2008 and 2022.
 */
export function Timeline() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const radii = useMemo(
    () =>
      events.map((e) => {
        const r = e.return ?? 0;
        // Compress the enormous positive tail; let losses bite.
        const k = r >= 0 ? Math.log10(1 + r / 40) * 0.5 : r / 150;
        return THREE.MathUtils.clamp(3.4 + k * 3.6, 1.5, 6.2);
      }),
    [],
  );

  useLayoutEffect(() => {
    if (!mesh.current) return;
    events.forEach((e, i) => {
      dummy.position.set(0, 0, -i * SPACING);
      dummy.rotation.set(0, 0, i * 0.4);
      dummy.scale.setScalar(radii[i] / 3.4);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);

      const tone = IMPACT_TONE[e.impact];
      const c = tone === 'down' ? DOWN : tone === 'up' ? UP : FLAT;
      mesh.current!.setColorAt(i, c);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [dummy, radii]);

  useFrame(() => {
    if (!mesh.current) return;
    // Rings brighten as the camera nears them.
    const head = state.progress * (COUNT - 1);
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.6 + Math.sin(head * Math.PI) * 0.12;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <torusGeometry args={[3.4, 0.018, 8, 128]} />
      <meshStandardMaterial emissive="#1E2A18" emissiveIntensity={0.7} toneMapped={false} />
    </instancedMesh>
  );
}
