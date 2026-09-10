'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
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
        // IBL produces values well above 1.0 on the metal; filmic tone mapping
        // rolls those highlights off instead of clipping them to flat white.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.35;
      }}
    >
      {/*
        Image-based lighting instead of a light rig.
        The reference gets its depth from an HDR environment map, not from
        real-time lights. We build the same thing out of Lightformer panels
        rendered once into a 256px cubemap: no HDR file to fetch, no runtime
        CDN dependency, and — unlike a stock city HDR — every highlight is
        placed deliberately on the metal. `frames={1}` bakes it a single time.
      */}
      <Environment resolution={256} frames={1}>
        {/* base fill — keeps the shadow side from going pure black */}
        <Lightformer form="rect" intensity={0.42} color="#55654F" scale={[60, 60, 1]} position={[0, 0, -18]} />

        {/* key: a green ring behind the machine, the source of the rim */}
        <Lightformer form="ring" intensity={9} color="#76B900" scale={[11, 11, 1]} position={[0, 1, -13]} />

        {/* cool top light for edge definition on the torus rims */}
        <Lightformer form="rect" intensity={3.6} color="#DCE8CE" scale={[16, 3, 1]} position={[0, 11, 4]} rotation={[Math.PI / 2, 0, 0]} />

        {/* two raking side strips so the rings read as round, not flat */}
        <Lightformer form="rect" intensity={2.8} color="#9FC46B" scale={[2.5, 18, 1]} position={[-13, 0, 2]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={1.9} color="#5E7F3A" scale={[2.5, 18, 1]} position={[13, 0, 2]} rotation={[0, -Math.PI / 2, 0]} />
      </Environment>

      {/* One real light remains: it travels with the camera so the machine
          still has a directional read as it recedes down the corridor. */}
      <directionalLight position={[4, 6, 9]} intensity={0.55} color="#E4F0D2" />

      <Suspense fallback={null}>
        <TimeMachine />
        <Timeline />
        <Particles count={900} />
        <Rig onOpen={onOpen} />
      </Suspense>
    </Canvas>
  );
}
