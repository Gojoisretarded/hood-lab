'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TRACK_LENGTH } from '@/lib/events';
import { state } from '@/lib/timeline';

/**
 * Ambient motes establishing depth along the corridor. They wrap around the
 * camera rather than spanning the whole track, so density stays constant and
 * count stays low. Halved on coarse pointers; frozen under reduced motion.
 */
export function Particles({ count = 900 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 16;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r * 0.8;
      positions[i * 3 + 2] = -Math.random() * (TRACK_LENGTH + 120) + 60;
      speeds[i] = 0.4 + Math.random() * 1.5;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(({ camera }, delta) => {
    const p = points.current;
    if (!p || state.reducedMotion) return;
    const arr = (p.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const d = Math.min(delta, 0.05);
    const camZ = camera.position.z;

    for (let i = 0; i < count; i++) {
      const iz = i * 3 + 2;
      arr[iz] += speeds[i] * d * 2.2;
      // Recycle anything that drifts behind the camera to far ahead.
      if (arr[iz] > camZ + 12) arr[iz] = camZ - 190 - Math.random() * 40;
    }
    (p.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#9DB88A"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
