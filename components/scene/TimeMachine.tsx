'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { state } from '@/lib/timeline';
import { events, valueAt } from '@/lib/events';
import { CrtScreen, planarUVs } from './CrtScreen';

const MODEL = '/models/nvidia-crt.glb';

/**
 * The hero object: an NVIDIA CRT monitor, with the live position value
 * rendered onto its actual screen.
 *
 * The model is a trimesh export — Z-up, no UVs, no textures, 3k verts. It is
 * uprighted and centred here so nothing outside this file has to know that.
 * Two metal rings still orbit it; they are the only survivors of the earlier
 * procedural machine, and they now read as the field around the device rather
 * than as the device itself.
 */
export function TimeMachine() {
  const group = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);

  const lastProgress = useRef(0);
  const velocity = useRef(0);

  const { scene } = useGLTF(MODEL);
  const screen = useMemo(() => new CrtScreen(), []);

  // Prepare the model once: hide the ground plane it ships with, wire the
  // canvas onto the Display mesh, and let the glass read as glass.
  useEffect(() => {
    scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;

      // GLTFLoader pushes every node name through PropertyBinding
      // .sanitizeNodeName, which replaces whitespace with underscores. The
      // authored names ("Convex CRT glass") therefore never match on the way
      // in — single-word names like "Display" do, which makes the bug look
      // like it is only affecting some parts. Normalise before comparing.
      const name = o.name.replace(/_/g, ' ');

      if (name === 'Ground') {
        o.visible = false;
        return;
      }

      if (name === 'Display') {
        planarUVs(o.geometry);
        o.material = new THREE.MeshBasicMaterial({
          map: screen.texture,
          toneMapped: false,
        });
        return;
      }

      if (name === 'Convex CRT glass') {
        // Opaque and self-emissive in the source file, which hides the screen
        // behind a green dome. Make it behave like glass over the tube.
        o.material = new THREE.MeshPhysicalMaterial({
          color: '#0B1A12',
          metalness: 0,
          roughness: 0.16,
          transmission: 0.7,
          thickness: 0.4,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
          envMapIntensity: 0.6,
        });
        return;
      }

      // Everything else keeps its authored material but leans harder on the
      // environment map, which is doing all the lighting in this scene.
      const m = o.material as THREE.MeshStandardMaterial;
      if (m && 'envMapIntensity' in m) m.envMapIntensity = 1.6;
    });

    return () => screen.dispose();
  }, [scene, screen]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const p = state.progress;

    // Smoothed scroll speed drives how hard the machine works.
    const raw = Math.abs(p - lastProgress.current) / Math.max(d, 0.0001);
    lastProgress.current = p;
    velocity.current += (raw - velocity.current) * 0.08;
    const drive = state.reducedMotion ? 0.25 : 0.25 + Math.min(velocity.current * 9, 3.4);

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
      group.current.scale.setScalar(1 - p * 0.42);
      // Gentler than the old spin: the screen has to stay readable.
      group.current.rotation.y = p * 0.32;
    }

    // Idle float so the device never looks welded in place.
    if (model.current && !state.reducedMotion) {
      const t = performance.now() * 0.0006;
      model.current.rotation.z = Math.sin(t) * 0.022;
      model.current.position.y = -2.758 + Math.sin(t * 1.3) * 0.06;
    }

    // Feed the tube.
    const ev = events[state.active];
    screen.update(
      valueAt(p),
      ev.year,
      ev.return,
      ev.beat === 'start' ? 'IPO' : ev.beat === 'today' ? 'TODAY' : '',
      performance.now(),
    );
  });

  return (
    <group ref={group}>
      {/* Upright (the export is Z-up) and centre on the origin. */}
      <group ref={model} rotation={[-Math.PI / 2, 0, 0]} position={[-0.025, -2.758, 0.112]} scale={1.45}>
        <primitive object={scene} />
      </group>

      {/* Orbiting field, set BEHIND the device: a ring centred on the origin
          sweeps across the screen face every revolution and makes the readout
          unreadable. Metal, so the environment gives them travelling arcs. */}
      <group position={[0, 0, -3.1]}>
      <mesh ref={ringB} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[5.2, 0.085, 16, 220]} />
        <meshStandardMaterial
          color="#8FA37E"
          emissive="#2C4406"
          emissiveIntensity={0.35}
          metalness={1}
          roughness={0.24}
          envMapIntensity={2.2}
        />
      </mesh>

      <mesh ref={ringC} rotation={[0.5, 0.4, 0]}>
        <torusGeometry args={[6.6, 0.055, 14, 240]} />
        <meshStandardMaterial
          color="#A8B79C"
          emissive="#1B2C05"
          emissiveIntensity={0.2}
          metalness={1}
          roughness={0.42}
          envMapIntensity={1.8}
        />
      </mesh>
      </group>

      {/* Rim from behind only. A light in front of the tube puts a hard
          specular blob straight across the glass. */}
      <pointLight position={[0, 0.4, -4.2]} intensity={3.4} distance={16} color="#76B900" />
    </group>
  );
}

useGLTF.preload(MODEL);
