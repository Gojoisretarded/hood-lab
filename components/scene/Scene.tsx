'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { events, SPACING, COUNT, RADIUS, TWIST } from '@/lib/events';
import { state } from '@/lib/timeline';
import { TimeMachine } from './TimeMachine';
import { Timeline } from './Timeline';
import { EventNode } from './EventNode';
import { Particles } from './Particles';

/**
 * SCENE CONTRACT (from the implementation plan)
 * The scene receives scroll progress and the active beat. It does not own
 * historical copy — the DOM does. Everything here is geometry and camera.
 */

function Rig({ onOpen }: { onOpen: (id: string) => void }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    // Read-only: the timeline is advanced by its own RAF in lib/timeline.
    const p = state.progress;
    const head = p * (COUNT - 1);

    // Travel down the corridor.
    const z = 16 - head * SPACING;
    camera.position.z = z;

    // Drift along the spiral so cards swing past rather than sit dead ahead.
    const a = head * TWIST;
    const sway = state.reducedMotion ? 0 : 1;
    camera.position.x = Math.cos(a) * RADIUS * 0.3 * sway;
    camera.position.y = Math.sin(a) * RADIUS * 0.18 * sway + 0.3;

    // Aim slightly ahead of the current beat.
    target.current.set(0, 0, z - SPACING * 1.6);
    camera.lookAt(target.current);

    // A touch of roll keeps it feeling piloted rather than dollied.
    camera.rotation.z = Math.sin(a * 0.5) * 0.035 * sway;
  });

  return (
    <>
      {events.map((e) => (
        <EventNode key={e.id} event={e} onOpen={onOpen} />
      ))}
    </>
  );
}

export function Scene({ onOpen, dpr }: { onOpen: (id: string) => void; dpr: number }) {
  return (
    <Canvas
      className="canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 62, near: 0.1, far: 900, position: [0, 0, 16] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#060706', 1);
        scene.fog = new THREE.Fog('#060706', 40, 190);
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 10]} intensity={1.1} color="#DFF0C8" />
      <pointLight position={[-10, -6, -30]} intensity={30} distance={90} color="#1E4D00" />

      <Suspense fallback={null}>
        <TimeMachine />
        <Timeline />
        <Particles count={900} />
        <Rig onOpen={onOpen} />
      </Suspense>
    </Canvas>
  );
}
