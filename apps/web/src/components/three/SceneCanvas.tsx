import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SceneCanvasProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  children,
  className = 'w-full h-full min-h-[300px]',
  fallback = null,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && fallback) {
    return <div className={`flex items-center justify-center ${className}`}>{fallback}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-primary-400/60 font-mono text-xs tracking-wider animate-pulse">
            LOADING 3D BIOMETRICS...
          </div>
        }
      >
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <PerformanceMonitor onDecline={() => console.warn('3D performance degraded, scaling down DPR')} />
          {/* Studio 3-point clinical lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-4, -3, -2]} intensity={0.8} color="#0EA5E9" />
          <spotLight position={[0, 5, 2]} intensity={0.9} color="#10B981" angle={0.6} penumbra={0.8} />

          {children}
        </Canvas>
      </Suspense>
    </div>
  );
};
