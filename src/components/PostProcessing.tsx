'use client';

import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function PostProcessing() {
  return (
    <EffectComposer>
      {/* Golden bloom for magic glow */}
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        intensity={1.2}
        radius={0.8}
        mipmapBlur
        blendFunction={BlendFunction.SCREEN}
      />

      {/* Darkened edges for focus */}
      <Vignette
        offset={0.3}
        darkness={0.7}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Subtle film grain for texture */}
      <Noise
        premultiply
        opacity={0.02}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
