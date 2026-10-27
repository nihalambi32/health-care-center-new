import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useVitalsSceneStore } from '@/store/vitalsSceneStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const FloatingHeart: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const heartRateBpm = useVitalsSceneStore((state) => state.heartRateBpm);
  const systolicBp = useVitalsSceneStore((state) => state.systolicBp);
  const prefersReduced = useReducedMotion();

  // Create an anatomical stylized heart shape via ExtrudeGeometry
  const heartGeometry = useMemo(() => {
    const x = 0, y = 0;
    const shape = new THREE.Shape();
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (prefersReduced) return;

    // Convert BPM to frequency (e.g. 72 BPM = 1.2 Hz)
    const frequency = heartRateBpm / 60;
    const time = state.clock.getElapsedTime();

    // Systolic/diastolic dual peak pulse
    const phase = (time * frequency * Math.PI * 2) % (Math.PI * 2);
    let pulse = 0;
    if (phase < 0.6) {
      pulse = Math.sin(phase * (Math.PI / 0.6)) * 0.18; // Primary systolic spike
    } else if (phase > 0.8 && phase < 1.3) {
      pulse = Math.sin((phase - 0.8) * (Math.PI / 0.5)) * 0.08; // Secondary diastolic bump
    }

    if (groupRef.current) {
      const baseScale = 1.3 + pulse;
      groupRef.current.scale.set(baseScale, baseScale, baseScale);
      groupRef.current.rotation.y += delta * 0.3;
    }

    if (materialRef.current) {
      // Dynamic color: Healthy Bio-Emerald/Cyan (#0EA5E9) -> Elevated Cardio Crimson (#F43F5E) if BPM > 100 or BP > 135
      const isElevated = heartRateBpm > 100 || systolicBp >= 135;
      const targetColor = isElevated ? new THREE.Color('#F43F5E') : new THREE.Color('#0EA5E9');
      const targetEmissive = isElevated ? new THREE.Color('#BE123C') : new THREE.Color('#0284C7');

      materialRef.current.color.lerp(targetColor, 0.05);
      materialRef.current.emissive.lerp(targetEmissive, 0.05);
      materialRef.current.emissiveIntensity = 0.3 + pulse * 1.5;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} rotation={[Math.PI, 0, 0]}>
        <mesh geometry={heartGeometry}>
          <meshPhysicalMaterial
            ref={materialRef}
            color="#0EA5E9"
            emissive="#0284C7"
            emissiveIntensity={0.3}
            roughness={0.15}
            metalness={0.05}
            transmission={0.65}
            thickness={1.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
};
