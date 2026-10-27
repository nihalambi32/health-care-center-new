import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeroOrbProps {
  isStreaming?: boolean;
}

export const HeroOrb: React.FC<HeroOrbProps> = ({ isStreaming = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const prefersReduced = useReducedMotion();

  useFrame((state, delta) => {
    if (prefersReduced) return;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isStreaming ? 0.8 : 0.25);
      meshRef.current.rotation.x += delta * (isStreaming ? 0.4 : 0.15);

      // Subtle breath scale pulse
      const t = state.clock.getElapsedTime();
      const scaleBase = 1 + Math.sin(t * (isStreaming ? 4 : 1.5)) * 0.06;
      meshRef.current.scale.set(scaleBase, scaleBase, scaleBase);
    }

    if (materialRef.current) {
      // Lerp color: calm clinical cyan (#0EA5E9) at idle -> bioluminescent emerald/violet (#10B981 / #8B5CF6) when streaming
      const targetColor = isStreaming ? new THREE.Color('#8B5CF6') : new THREE.Color('#0EA5E9');
      materialRef.current.color.lerp(targetColor, 0.05);
      materialRef.current.emissive.lerp(
        isStreaming ? new THREE.Color('#10B981') : new THREE.Color('#0284C7'),
        0.05
      );
      materialRef.current.emissiveIntensity = isStreaming ? 0.6 : 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color="#0EA5E9"
          emissive="#0284C7"
          emissiveIntensity={0.2}
          roughness={0.15}
          metalness={0.1}
          transmission={0.7}
          thickness={1.5}
          ior={1.4}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
};
