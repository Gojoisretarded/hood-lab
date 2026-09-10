'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IMPACT_TONE, SPACING, type TimelineEvent } from '@/lib/events';
import { labelTexture } from '@/lib/labelTexture';
import { state } from '@/lib/timeline';

interface Props {
  event: TimelineEvent;
  onOpen: (id: string) => void;
}

/**
 * A single event card. Faces the camera, brightens on approach, dims once
 * passed. The card is a texture — all *readable* copy lives in the DOM panel,
 * per the plan's core rule.
 */
export function EventNode({ event, onOpen }: Props) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);

  const tone = IMPACT_TONE[event.impact];
  const tex = useMemo(() => labelTexture(event, tone), [event, tone]);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;

    const camZ = camera.position.z;
    const dz = camZ - event.position[2];

    // Cull cheaply: anything far behind or far ahead contributes nothing.
    const visible = dz > -SPACING * 2.2 && dz < SPACING * 5.5;
    g.visible = visible;
    if (!visible) return;

    g.lookAt(camera.position);

    // Approach curve: fade in ahead, peak in the readable zone, fall away behind.
    const ahead = THREE.MathUtils.smoothstep(dz, -SPACING * 2.0, -SPACING * 0.35);
    const behind = 1 - THREE.MathUtils.smoothstep(dz, SPACING * 0.9, SPACING * 3.6);
    let a = ahead * behind;

    // The active beat is privileged; its neighbours recede.
    const isActive = state.active === event.index;
    if (isActive) a = Math.min(1, a * 1.25 + 0.16);
    else a *= 0.5;

    if (hovered.current) a = Math.min(1, a + 0.22);
    if (mat.current) mat.current.opacity = a;

    const lift = isActive ? 1.1 : 1.0;
    const s = (0.86 + a * 0.2) * lift;
    g.scale.setScalar(s);
  });

  return (
    <group ref={group} position={event.position} rotation={event.rotation}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onOpen(event.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = '';
        }}
      >
        <planeGeometry args={[5.2, 2.6]} />
        <meshBasicMaterial
          ref={mat}
          map={tex}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
