'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { state } from '@/lib/timeline';
import { scaleAt, tierScale, nextTier, TIER_MODEL, type TierId } from '@/lib/scale';

/**
 * THE ZOOM.
 *
 * The camera never moves. The world shrinks.
 *
 * At any moment two tiers are on screen: the one you are leaving, dwindling
 * toward a speck, and the one you are arriving at, eight times larger and
 * still resolving. When `local` reaches the top of the octave the pair swaps
 * and the numbers reset — the outgoing tier's scale at the moment of handoff
 * is exactly the incoming tier's scale on the far side, so the seam has
 * nothing to show.
 */

const CAM_Z = 3;
/** On-screen size of a tier at the bottom of its octave. */
const BASE = 2.2;

/**
 * Crossfade windows as a fraction of the tier's span, so they scale with the
 * tier rather than assuming a fixed octave width.
 */
const OUT_START = 0.45, OUT_END = 0.99;
const IN_START = 0.22, IN_END = 0.72;

function useNormalised(url: string) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    const max = Math.max(size.x, size.y, size.z) || 1;

    // Recentre on the origin and normalise to unit size, so every tier is
    // driven by the same scale number regardless of how it was modelled.
    const wrap = new THREE.Group();
    root.position.sub(centre);
    wrap.add(root);
    wrap.scale.setScalar(1 / max);

    // Every tier was modelled with +Y as its front face. glTF's Y-up export
    // maps Blender +Y to -Z, so all five arrive facing away from the camera —
    // the die shows its solder balls instead of its cores. Turn them around
    // about Y rather than X, which would also stand the rack on its head.
    wrap.rotation.y = Math.PI;

    // Own the materials: opacity is animated per tier and these models are
    // otherwise sharing material instances out of the GLTF cache.
    root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = (o.material as THREE.Material).clone();
        o.frustumCulled = false;
      }
    });
    return wrap;
  }, [scene]);
}

function Tier({ object, scale, opacity }: { object: THREE.Group; scale: number; opacity: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    g.visible = opacity > 0.004;
    if (!g.visible) return;
    g.scale.setScalar(scale);
    g.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const m = o.material as THREE.MeshStandardMaterial;
        m.transparent = opacity < 0.999;
        m.opacity = opacity;
        m.depthWrite = opacity > 0.9;
      }
    });
  });

  return <group ref={ref}><primitive object={object} /></group>;
}

function Rig() {
  const dieM = useNormalised(TIER_MODEL.die);
  const cardM = useNormalised(TIER_MODEL.card);
  const chassisM = useNormalised(TIER_MODEL.chassis);
  const rackM = useNormalised(TIER_MODEL.rack);
  const hallM = useNormalised(TIER_MODEL.hall);
  const byId = useMemo<Record<TierId, THREE.Group>>(
    () => ({ die: dieM, card: cardM, chassis: chassisM, rack: rackM, hall: hallM }),
    [dieM, cardM, chassisM, rackM, hallM],
  );

  const tierRef = useRef<TierId | null>(null);
  const spin = useRef<THREE.Group>(null);

  // Recomputed every frame; drives both tiers.
  const live = useRef({ cur: 'die' as TierId, nxt: null as TierId | null, s: BASE, sn: BASE * 10, o: 1, on: 0 });

  useFrame((_, delta) => {
    const scale = scaleAt(state.progress);
    const { tier, within, span } = tierScale(scale, tierRef.current);
    tierRef.current = tier.id;

    const cur = tier.id;
    const nx = nextTier(cur);

    // `within` runs 1 -> span across the tier. The outgoing model shrinks by
    // exactly `span` over that stretch, and the incoming one is rendered
    // `span` times larger, so at the boundary the incoming model's size is
    // identical to what the next tier's size will be once `within` resets.
    // The swap is arithmetically invisible.
    const t = (within - 1) / (span - 1 || 1);

    live.current.cur = cur;
    live.current.nxt = nx ? nx.id : null;
    live.current.s = BASE / within;
    live.current.sn = (BASE * span) / within;
    live.current.o = 1 - THREE.MathUtils.smoothstep(t, OUT_START, OUT_END);
    live.current.on = THREE.MathUtils.smoothstep(t, IN_START, IN_END);

    // A slow drift so the object is never dead still.
    if (spin.current && !state.reducedMotion) {
      spin.current.rotation.y += delta * 0.06;
      spin.current.rotation.x = Math.sin(performance.now() * 0.0002) * 0.05;
    }
  });

  const L = live.current;
  return (
    <group ref={spin}>
      <Tier object={byId[L.cur]} scale={L.s} opacity={L.o} />
      {L.nxt && <Tier object={byId[L.nxt]} scale={L.sn} opacity={L.on} />}
    </group>
  );
}

export function ZoomScene({ dpr }: { dpr: number }) {
  return (
    <Canvas
      className="canvas"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.001, far: 400, position: [0, 0, CAM_Z] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#060706', 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
        scene.fog = new THREE.Fog('#060706', 6, 60);
      }}
    >
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={0.5} color="#55654F" scale={[60, 60, 1]} position={[0, 0, -20]} />
        <Lightformer form="ring" intensity={7} color="#76B900" scale={[12, 12, 1]} position={[0, 1, -14]} />
        <Lightformer form="rect" intensity={3.4} color="#DCE8CE" scale={[18, 3, 1]} position={[0, 12, 5]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={2.6} color="#9FC46B" scale={[3, 20, 1]} position={[-14, 0, 3]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={1.8} color="#5E7F3A" scale={[3, 20, 1]} position={[14, 0, 3]} rotation={[0, -Math.PI / 2, 0]} />
      </Environment>
      <directionalLight position={[4, 6, 9]} intensity={0.6} color="#E4F0D2" />

      <Rig />
    </Canvas>
  );
}

Object.values(TIER_MODEL).forEach((u) => useGLTF.preload(u));
